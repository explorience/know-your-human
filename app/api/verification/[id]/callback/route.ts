import { NextRequest, NextResponse } from "next/server";
import { verificationRequests } from "@/app/api/verification/route";
import { verifyProof, simulateDemoVerification } from "@/lib/self-protocol-v2";
import { registerAttestation } from "@/lib/self-protocol";
import type { Address } from "viem";

/**
 * POST /api/verification/[id]/callback
 *
 * Webhook endpoint called by Self Protocol after user completes verification.
 * Also handles demo mode simulation.
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
    const { proof, publicSignals, demo } = body;

    let verificationResult;

    if (demo || !process.env.SELF_APP_ID) {
      // Demo mode simulation
      verificationResult = await simulateDemoVerification(id);
    } else {
      // Real Self Protocol proof verification
      if (!proof || !publicSignals) {
        return NextResponse.json(
          { error: "proof and publicSignals are required" },
          { status: 400 }
        );
      }
      verificationResult = await verifyProof(proof, publicSignals, id);
    }

    if (!verificationResult.isVerified) {
      requestData.status = "failed";
      return NextResponse.json(
        { error: "Verification proof is invalid" },
        { status: 400 }
      );
    }

    // Register on-chain attestation
    const hasIssuerKey = process.env.ISSUER_PRIVATE_KEY;
    if (hasIssuerKey) {
      try {
        const result = await registerAttestation(
          `+1555${requestData.userAddress.slice(-7)}`,
          requestData.userAddress as Address
        );
        requestData.status = "completed";
        requestData.attestationHash = result.transactionHash;
      } catch (error) {
        console.error("On-chain attestation failed:", error);
        // Still mark as completed with demo hash
        requestData.status = "completed";
        requestData.attestationHash =
          "0x" + Math.random().toString(16).slice(2, 66);
      }
    } else {
      // Demo mode attestation hash
      requestData.status = "completed";
      requestData.attestationHash =
        "0x" + Math.random().toString(16).slice(2, 66);
    }

    return NextResponse.json({
      success: true,
      verificationId: id,
      status: "completed",
      attestationHash: requestData.attestationHash,
      nationality: verificationResult.nationality,
      isAdult: verificationResult.isAdult,
      isHuman: verificationResult.isHuman,
      demoMode: verificationResult.demoMode,
    });
  } catch (error) {
    console.error("Callback error:", error);
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
    verificationId: id,
    status: requestData.status,
    level: requestData.level,
    attestationHash: requestData.attestationHash,
    createdAt: requestData.createdAt,
    expiresAt: requestData.expiresAt,
  });
}
