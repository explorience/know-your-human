import { NextRequest, NextResponse } from "next/server";
import { verificationRequests } from "@/app/api/verification/route";
import { verifyProof } from "@/lib/self-protocol-v2";

/**
 * POST /api/verification/[id]/callback
 *
 * Webhook endpoint called by Self Protocol app after user completes verification.
 * Self app POSTs the ZK proof + public signals here.
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

    // Verify the ZK proof using Self's backend verifier
    const verificationResult = await verifyProof(proof, publicSignals, id);

    if (!verificationResult.isVerified) {
      requestData.status = "failed";
      return NextResponse.json(
        { error: "Verification proof is invalid" },
        { status: 400 }
      );
    }

    // Mark as completed
    requestData.status = "completed";
    requestData.attestationHash =
      "0x" + Buffer.from(proof.slice(0, 32)).toString("hex").padEnd(64, "0");

    return NextResponse.json({
      success: true,
      verificationId: id,
      status: "completed",
      attestationHash: requestData.attestationHash,
      nationality: verificationResult.nationality,
      isAdult: verificationResult.isAdult,
      isHuman: verificationResult.isHuman,
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
