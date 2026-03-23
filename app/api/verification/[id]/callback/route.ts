import { NextRequest, NextResponse } from "next/server";
import { verificationRequests } from "@/app/api/verification/route";
import { verifyProof } from "@/lib/self-protocol-v2";
import { issueKYHCredential, formatAttestationResponse } from "@/lib/eas";
import { buildEvidence, storeEvidence, getEvidenceIPFS } from "@/lib/claims";
import { getPrivacyAttestation, reasonOverVerification } from "@/lib/venice";
import type { TierLevel } from "@/lib/x402";

/**
 * POST /api/verification/[id]/callback
 *
 * Webhook endpoint called by Self Protocol app after user completes verification.
 * Self app POSTs the ZK proof + public signals here.
 *
 * Flow: Self app scan -> ZK proof generated on device -> POSTed here ->
 * we verify proof -> run Venice AI reasoning -> issue EAS attestation -> done.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const requestData = verificationRequests.get(id);
    if (!requestData) {
      return NextResponse.json(
        { error: "Verification session not found" },
        { status: 404 }
      );
    }

    if (requestData.status === "completed") {
      return NextResponse.json({
        message: "Already completed",
        attestationHash: requestData.attestationHash,
      });
    }

    const body = await request.json().catch(() => ({}));
    const { proof, publicSignals } = body;

    if (!proof || !publicSignals) {
      return NextResponse.json(
        { error: "proof and publicSignals are required" },
        { status: 400 }
      );
    }

    // Step 1: Verify the ZK proof using Self's backend verifier
    const verificationResult = await verifyProof(proof, publicSignals, id);

    if (!verificationResult.isVerified) {
      requestData.status = "failed";
      return NextResponse.json(
        { error: "Verification proof is invalid" },
        { status: 400 }
      );
    }

    // Step 2: Run Venice AI reasoning on the Self Protocol signals
    const selfChecks: Array<{ type: "humanity" | "age" | "nationality"; passed: boolean; details: string; confidence: number }> = [
      { type: "humanity", passed: true, details: "Self Protocol NFC passport ZK proof verified", confidence: 99 },
    ];
    if (verificationResult.isAdult) {
      selfChecks.push({ type: "age", passed: true, details: "User is 18+", confidence: 99 });
    }
    if (verificationResult.nationality) {
      selfChecks.push({ type: "nationality", passed: true, details: `Nationality: ${verificationResult.nationality}`, confidence: 99 });
    }

    const selfSignals = {
      provider: "self" as const,
      success: true,
      checks: selfChecks,
      score: 99,
      demoMode: false,
      durationMs: 0,
    };

    let veniceVerdict = null;
    try {
      veniceVerdict = await reasonOverVerification({
        tier: requestData.level,
        walletAddress: requestData.userAddress,
        agentAddress: requestData.agentAddress,
        providerSignals: [{
          provider: "self",
          success: true,
          score: 99,
          checks: selfSignals.checks.map(c => `${c.type}: ${c.details}`),
          durationMs: 0,
          demoMode: false,
        }],
      });
    } catch (err) {
      console.warn("Venice AI reasoning failed (proceeding with Self proof):", err);
      // Self ZK proof is cryptographically verified — Venice is advisory, not a gate
    }

    // Step 3: Issue EAS attestation on Celo
    const easAttestation = await issueKYHCredential(
      requestData.userAddress,
      requestData.level as TierLevel,
      "self",
      false // Real attestation, not demo
    );

    // Step 4: Build and store evidence
    const expiresAtDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const multiProviderResult = {
      level: requestData.level,
      overallSuccess: true,
      totalChecks: selfSignals.checks.length,
      passedChecks: selfSignals.checks.length,
      durationMs: 0,
      demoMode: false,
      providerResults: [selfSignals],
      veniceVerdict,
    };
    const evidence = buildEvidence(multiProviderResult, requestData.level, expiresAtDate);
    const evidenceHash = await storeEvidence(evidence);
    const ipfsCid = getEvidenceIPFS(evidenceHash);

    // Step 5: Mark as completed
    requestData.status = "completed";
    requestData.attestationHash = easAttestation.uid;
    requestData.evidenceHash = evidenceHash;

    console.log(`Self Protocol callback completed for ${requestData.userAddress}: ${easAttestation.uid}`);

    return NextResponse.json({
      success: true,
      verificationId: requestData.id,
      status: "completed",
      attestation: formatAttestationResponse(easAttestation),
      attestationHash: easAttestation.uid,
      evidence: {
        hash: evidenceHash,
        url: `https://knowyourhuman.xyz/api/evidence/${evidenceHash}`,
        ...(ipfsCid ? { ipfs: `ipfs://${ipfsCid}`, ipfsGateway: `https://gateway.pinata.cloud/ipfs/${ipfsCid}` } : {}),
      },
      nationality: verificationResult.nationality,
      isAdult: verificationResult.isAdult,
      isHuman: verificationResult.isHuman,
      veniceVerdict: veniceVerdict ? {
        approve: veniceVerdict.approve,
        confidence: veniceVerdict.confidence,
        reasoning: veniceVerdict.reasoning,
        engine: veniceVerdict.engine,
        dataRetention: "none",
      } : { approve: true, confidence: 99, reasoning: "Self Protocol ZK proof cryptographically verified", engine: "self-zk" },
      privacy: getPrivacyAttestation(),
      demoMode: false,
    });
  } catch (error) {
    console.error("Self Protocol callback error:", error);
    return NextResponse.json(
      { error: "Callback processing failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/verification/[id]/callback
 *
 * Check status of a specific verification session.
 * Used by the frontend to poll for completion.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const requestData = verificationRequests.get(id);
  if (!requestData) {
    return NextResponse.json(
      { error: "Verification session not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    verificationId: requestData.id,
    status: requestData.status,
    level: requestData.level,
    attestationHash: requestData.attestationHash,
    evidenceHash: requestData.evidenceHash,
    createdAt: requestData.createdAt,
    expiresAt: requestData.expiresAt,
  });
}
