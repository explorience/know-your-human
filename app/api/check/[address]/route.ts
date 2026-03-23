import { NextRequest, NextResponse } from "next/server";
import { enrichWithENS, isENSName, resolveToAddress } from "@/lib/ens";
import { getEvidence } from "@/lib/claims";

/**
 * GET /api/check/{address}
 *
 * Free credential check. Returns the latest verification status for an address.
 * This is the "read forever for free" endpoint — any agent or dApp can call it.
 *
 * Accepts:
 * - Hex addresses: /api/check/0xABC123...
 * - ENS names: /api/check/vitalik.eth
 *
 * Returns ENS name + avatar alongside every response when available.
 *
 * In production, this queries the EAS contract on Celo directly.
 * Currently uses the in-memory verification store for demo purposes.
 */

// Import verification requests from the store
import { verificationRequests } from "@/app/api/verification/route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address: rawInput } = await params;

  // Accept both hex addresses and ENS names
  let resolvedAddress: string | null = null;
  let inputType: "address" | "ens" = "address";

  if (isENSName(rawInput)) {
    inputType = "ens";
    resolvedAddress = await resolveToAddress(rawInput);
    if (!resolvedAddress) {
      return NextResponse.json(
        {
          error: "ENS name could not be resolved",
          input: rawInput,
          hint: "The ENS name may not exist or may not have an address record set.",
        },
        { status: 404 }
      );
    }
  } else if (rawInput.match(/^0x[a-fA-F0-9]{40}$/)) {
    resolvedAddress = rawInput;
  } else {
    return NextResponse.json(
      { error: "Invalid input. Provide a hex address (0x...) or ENS name (name.eth)" },
      { status: 400 }
    );
  }

  const normalizedAddress = resolvedAddress.toLowerCase();

  // Enrich with ENS (resolve name + avatar)
  const ensData = await enrichWithENS(normalizedAddress);

  // Find latest completed verification for this address
  const verifications = Array.from(verificationRequests.values())
    .filter(
      (r) =>
        r.userAddress === normalizedAddress && r.status === "completed"
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const latest = verifications[0];

  const identity = {
    address: normalizedAddress,
    ...(ensData.ensName ? { ensName: ensData.ensName } : {}),
    ...(ensData.ensAvatar ? { ensAvatar: ensData.ensAvatar } : {}),
    ...(inputType === "ens" ? { resolvedFrom: rawInput } : {}),
  };

  if (!latest) {
    return NextResponse.json(
      {
        verified: false,
        ...identity,
        message: "No credential found. Use POST /api/verify to start verification.",
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  }

  // Check if credential has expired (90 days)
  const issuedAt = new Date(latest.createdAt);
  const expiresAt = new Date(issuedAt.getTime() + 90 * 24 * 60 * 60 * 1000);
  const isExpired = new Date() > expiresAt;

  if (isExpired) {
    return NextResponse.json(
      {
        verified: false,
        expired: true,
        ...identity,
        lastTier: latest.level,
        expiredAt: expiresAt.toISOString(),
        message: "Credential expired. Use POST /api/verify to re-verify.",
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  }

  // Retrieve structured claims if evidence exists
  const evidenceHash = latest.evidenceHash;
  const evidence = evidenceHash ? getEvidence(evidenceHash) : null;

  return NextResponse.json(
    {
      verified: true,
      ...identity,
      tier: latest.level,
      attestationUID: latest.attestationHash,
      issuedAt: latest.createdAt,
      expiresAt: expiresAt.toISOString(),
      // Structured claims (agents query these directly)
      ...(evidence ? {
        claims: evidence.claims,
        providers: evidence.providers,
        evidence: {
          hash: evidenceHash,
          url: `https://knowyourhuman.xyz/api/evidence/${evidenceHash}`,
        },
      } : {}),
      onChain: latest.attestationHash
        ? `https://celo.easscan.org/attestation/view/${latest.attestationHash}`
        : null,
      directQuery: {
        contract: "0x72E1d8ccf5299fb36fEfD8CC4394B8ef7e98Af92",
        schemaUID:
          "0x23b867f11eb49a6d94a6490e11aa2c4fd2dbbda5950b8444281ed2953daad5ab",
        chain: "celo",
        chainId: 42220,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
