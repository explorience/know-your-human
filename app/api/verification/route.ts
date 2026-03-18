import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { registerAttestation, VERIFICATION_LEVELS, checkOdisQuota } from "@/lib/self-protocol";
import type { Address } from "viem";

// In-memory store for verification requests (use Redis in production)
const verificationRequests = new Map<
  string,
  {
    id: string;
    agentAddress: string;
    userAddress: string;
    level: string;
    status: "pending" | "completed" | "failed";
    verificationId?: string;
    attestationHash?: string;
    createdAt: string;
    expiresAt: string;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentAddress, userAddress, level = "basic" } = body;

    // Validate inputs
    if (!agentAddress || !userAddress) {
      return NextResponse.json(
        { error: "agentAddress and userAddress are required" },
        { status: 400 }
      );
    }

    const verificationLevel = VERIFICATION_LEVELS[level];
    if (!verificationLevel) {
      return NextResponse.json(
        { error: "Invalid verification level. Use: basic, standard, or enhanced" },
        { status: 400 }
      );
    }

    // Skip ODIS check in demo mode (no issuer key)
    const hasIssuerKey = process.env.ISSUER_PRIVATE_KEY;
    if (hasIssuerKey) {
      // Check ODIS quota
      const quota = await checkOdisQuota();
      console.log(`ODIS Quota available: ${quota}`);
    } else {
      console.log(`Demo mode: Skipping ODIS quota check`);
    }

    // Create verification request
    const verificationId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

    const requestData: {
    id: string;
    agentAddress: string;
    userAddress: string;
    level: string;
    status: "pending" | "completed" | "failed";
    verificationId?: string;
    attestationHash?: string;
    createdAt: string;
    expiresAt: string;
  } = {
      id: verificationId,
      agentAddress: agentAddress.toLowerCase(),
      userAddress: userAddress.toLowerCase(),
      level,
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    verificationRequests.set(verificationId, requestData);

    // For demo purposes without wallet, just mark as completed
    // In production, this would redirect to Self Protocol widget
    
    if (hasIssuerKey) {
      try {
        // Attempt to register attestation
        const result = await registerAttestation(
          `+1555${userAddress.slice(-7)}`, // Demo: construct phone from address
          userAddress as Address
        );

        requestData.status = "completed";
        requestData.attestationHash = result.transactionHash;

        console.log(`Verification completed for ${userAddress}:`, result.transactionHash);
      } catch (error) {
        console.error("Verification registration failed:", error);
        // Don't fail the request - let user retry
        requestData.status = "pending";
      }
    } else {
      // Demo mode - simulate successful verification
      requestData.status = "completed";
      requestData.attestationHash = "0xdemo" + Math.random().toString(16).slice(2, 10);
      console.log(`Demo mode: Verification simulated for ${userAddress}`);
    }

    return NextResponse.json({
      verificationId,
      status: requestData.status,
      level,
      expiresAt,
      message: "Verification initiated. Complete verification via Self Protocol app.",
    });
  } catch (error) {
    console.error("Verification request error:", error);
    return NextResponse.json(
      { error: "Failed to create verification request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const verificationId = searchParams.get("id");
  const userAddress = searchParams.get("userAddress");

  if (verificationId) {
    const requestData = verificationRequests.get(verificationId);
    if (!requestData) {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verificationId: requestData.id,
      status: requestData.status,
      level: requestData.level,
      attestationHash: requestData.attestationHash,
      createdAt: requestData.createdAt,
      expiresAt: requestData.expiresAt,
    });
  }

  if (userAddress) {
    // Find all verifications for a user
    const userVerifications = Array.from(verificationRequests.values())
      .filter((r) => r.userAddress === userAddress.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latest = userVerifications[0];
    if (!latest) {
      return NextResponse.json({ verified: false });
    }

    return NextResponse.json({
      verified: latest.status === "completed",
      level: latest.level,
      attestationHash: latest.attestationHash,
      issuedAt: latest.createdAt,
    });
  }

  return NextResponse.json(
    { error: "Provide verificationId or userAddress" },
    { status: 400 }
  );
}
