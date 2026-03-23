/**
 * Claims Extraction & Evidence Layer
 *
 * Architecture:
 * - On-chain attestation stays lean and unopinionated (credentialType, assuranceLevel, evidenceRef, expiresAt)
 * - Off-chain evidence JSON holds structured claims, provider attribution, and Venice verdict
 * - The /api/check endpoint returns parsed claims so agents can query "is this person over 18?" directly
 * - The /api/evidence/[hash] endpoint serves the full evidence blob
 *
 * This keeps the schema durable (no migrations needed) while making claims queryable via API.
 */

import { createHash } from "crypto";
import type { MultiProviderResult } from "./providers";
import { pinToIPFS } from "./ipfs";

export interface ClaimSet {
  version: string;
  tier: string;
  providers: string[];
  claims: Record<string, boolean | string | number | null>;
  providerDetails: Record<string, {
    type: string;
    claims: string[];
    demoMode: boolean;
  }>;
  veniceVerdict: {
    approved: boolean;
    confidence: number;
    engine: string;
    reasoning?: string;
    flags?: string[];
  } | null;
  issuedAt: string;
  expiresAt: string;
}

// In-memory evidence store (Redis in production)
const evidenceStore = new Map<string, ClaimSet>();
// Maps sha256 hash -> IPFS CID (when pinned)
const evidenceIPFS = new Map<string, string>();

/**
 * Extract structured claims from provider results.
 * Maps raw provider checks to boolean claims that agents can query.
 */
export function extractClaims(
  verificationResult: MultiProviderResult,
  tier: string
): Record<string, boolean | string | number | null> {
  const claims: Record<string, boolean | string | number | null> = {};
  const allChecks = verificationResult.providerResults.flatMap(r => r.checks);

  // Universal claims (derived from any tier)
  claims.uniqueHuman = allChecks.some(c => c.type === "humanity" && c.passed) || false;

  // Document-level claims (Self Protocol)
  const hasSelf = verificationResult.providerResults.some(r => r.provider === "self");
  if (hasSelf) {
    const selfChecks = verificationResult.providerResults
      .filter(r => r.provider === "self")
      .flatMap(r => r.checks);

    claims.documentValid = selfChecks.some(c => c.type === "document" && c.passed) || false;
    claims.over18 = selfChecks.some(c => c.type === "age" && c.passed) || false;
    claims.over21 = selfChecks.some(c => c.type === "age" && c.passed) || false; // Same check for now, refine with actual DOB data
    claims.nationality = selfChecks.find(c => c.type === "nationality")?.details || null;
  }

  // Biometric-level claims (Didit)
  const hasDidit = verificationResult.providerResults.some(r => r.provider === "didit");
  if (hasDidit) {
    const diditChecks = verificationResult.providerResults
      .filter(r => r.provider === "didit")
      .flatMap(r => r.checks);

    claims.livenessConfirmed = diditChecks.some(c => c.type === "liveness" && c.passed) || false;
    claims.faceMatch = diditChecks.some(c => c.type === "face-match" && c.passed) || false;
    claims.notSanctioned = diditChecks.some(c => c.type === "sanctions" && c.passed) ||
                           diditChecks.some(c => c.type === "aml" && c.passed) || false;
  }

  // Reputation-level claims (Human Passport)
  const hasHP = verificationResult.providerResults.some(r => r.provider === "human-passport");
  if (hasHP) {
    const hpResult = verificationResult.providerResults.find(r => r.provider === "human-passport");
    claims.onchainReputation = hpResult?.score || 0;
    claims.sybilResistant = allChecks.some(c => c.type === "sybil-score" && c.passed) || false;
  }

  return claims;
}

/**
 * Build the full evidence blob from a verification result.
 */
export function buildEvidence(
  verificationResult: MultiProviderResult,
  tier: string,
  expiresAt: string
): ClaimSet {
  const claims = extractClaims(verificationResult, tier);

  const providerDetails: ClaimSet["providerDetails"] = {};
  for (const pr of verificationResult.providerResults) {
    providerDetails[pr.provider] = {
      type: pr.provider === "self" ? "zk-passport" :
            pr.provider === "didit" ? "biometric" :
            pr.provider === "human-passport" ? "reputation" : "unknown",
      claims: pr.checks.filter(c => c.passed).map(c => c.type),
      demoMode: pr.demoMode,
    };
  }

  const veniceVerdict = verificationResult.veniceVerdict ? {
    approved: verificationResult.veniceVerdict.approve,
    confidence: verificationResult.veniceVerdict.confidence,
    engine: verificationResult.veniceVerdict.engine,
    reasoning: verificationResult.veniceVerdict.reasoning,
    flags: verificationResult.veniceVerdict.flags,
  } : null;

  return {
    version: "1.0",
    tier,
    providers: verificationResult.providerResults.map(r => r.provider),
    claims,
    providerDetails,
    veniceVerdict,
    issuedAt: new Date().toISOString(),
    expiresAt,
  };
}

/**
 * Store evidence and return its content hash (sha256).
 * The hash is stored as evidenceRef in the EAS attestation.
 * Also pins to IPFS if Pinata is configured.
 */
export async function storeEvidence(evidence: ClaimSet): Promise<string> {
  const json = JSON.stringify(evidence, null, 2);
  const hash = "0x" + createHash("sha256").update(json).digest("hex");
  evidenceStore.set(hash, evidence);

  // Pin to IPFS (non-blocking, best-effort)
  const ipfsResult = await pinToIPFS(
    evidence as unknown as Record<string, unknown>,
    `kyh-evidence-${hash.slice(0, 10)}`
  );

  if (ipfsResult) {
    // Store IPFS CID alongside the evidence
    evidenceIPFS.set(hash, ipfsResult.cid);
    console.log(`Evidence pinned to IPFS: ${ipfsResult.cid} (${ipfsResult.url})`);
  }

  return hash;
}

/**
 * Retrieve evidence by its hash.
 */
export function getEvidence(hash: string): ClaimSet | null {
  return evidenceStore.get(hash) || null;
}

/**
 * Get IPFS CID for evidence (if pinned).
 */
export function getEvidenceIPFS(hash: string): string | null {
  return evidenceIPFS.get(hash) || null;
}

/**
 * Get all stored evidence hashes (for debugging/explorer).
 */
export function listEvidenceHashes(): string[] {
  return Array.from(evidenceStore.keys());
}
