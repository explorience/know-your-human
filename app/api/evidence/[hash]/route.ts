import { NextRequest, NextResponse } from "next/server";
import { getEvidence } from "@/lib/claims";

/**
 * GET /api/evidence/{hash}
 *
 * Serves the structured evidence JSON for a verification.
 * The hash is the sha256 of the evidence blob, stored as evidenceRef in the EAS attestation.
 * Free, no auth required.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;

  // Normalize hash format
  const normalizedHash = hash.startsWith("0x") ? hash : `0x${hash}`;

  const evidence = getEvidence(normalizedHash);

  if (!evidence) {
    return NextResponse.json(
      {
        error: "Evidence not found",
        hash: normalizedHash,
        hint: "The evidence may not exist yet, or may have been stored on IPFS. In production, evidence is pinned to IPFS and the hash is the CID.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json(evidence, {
    headers: {
      "Cache-Control": "public, max-age=3600, immutable",
    },
  });
}
