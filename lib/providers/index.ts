/**
 * Multi-Provider Verification Abstraction
 *
 * Routes verification requests to the appropriate providers based on tier:
 * - Basic: Self Protocol (ZK humanity) + Human Passport (sybil score)
 * - Standard: Self + Didit (ID + face match) + HP score
 * - Enhanced: Self + Didit (full KYC + AML) + HP (sanctions)
 */

import { verifySelf } from "./self";
import { verifyWithDidit } from "./didit";
import { verifyWithHumanPassport } from "./human-passport";

export interface ProviderCheck {
  type:
    | "humanity"
    | "document"
    | "liveness"
    | "face-match"
    | "aml"
    | "sybil-score"
    | "sanctions"
    | "age"
    | "nationality";
  passed: boolean;
  details?: string;
  confidence?: number;
}

export interface ProviderResult {
  provider: "self" | "didit" | "human-passport";
  success: boolean;
  checks: ProviderCheck[];
  score?: number;
  attestationData?: Record<string, unknown>;
  demoMode: boolean;
  durationMs: number;
}

export interface VerificationPlan {
  level: "basic" | "standard" | "enhanced";
  providers: Array<"self" | "didit" | "human-passport">;
  checks: string[];
  estimatedCostUSD: string;
  estimatedTimeSeconds: number;
}

export interface MultiProviderResult {
  level: string;
  overallSuccess: boolean;
  providerResults: ProviderResult[];
  totalChecks: number;
  passedChecks: number;
  demoMode: boolean;
  durationMs: number;
}

/**
 * Get the verification plan for a given tier.
 */
export function getVerificationPlan(
  level: "basic" | "standard" | "enhanced"
): VerificationPlan {
  switch (level) {
    case "basic":
      return {
        level,
        providers: ["self", "human-passport"],
        checks: ["humanity", "age", "sybil-score"],
        estimatedCostUSD: "0.10",
        estimatedTimeSeconds: 3,
      };
    case "standard":
      return {
        level,
        providers: ["self", "didit", "human-passport"],
        checks: [
          "humanity",
          "age",
          "nationality",
          "document",
          "face-match",
          "sybil-score",
        ],
        estimatedCostUSD: "1.00",
        estimatedTimeSeconds: 8,
      };
    case "enhanced":
      return {
        level,
        providers: ["self", "didit", "human-passport"],
        checks: [
          "humanity",
          "age",
          "nationality",
          "document",
          "liveness",
          "face-match",
          "aml",
          "sanctions",
          "sybil-score",
        ],
        estimatedCostUSD: "2.50",
        estimatedTimeSeconds: 12,
      };
  }
}

/**
 * Execute multi-provider verification for a given tier.
 */
export async function executeVerification(
  level: "basic" | "standard" | "enhanced",
  userData: {
    userAddress: string;
    agentAddress: string;
    agentId?: number;
  }
): Promise<MultiProviderResult> {
  const start = Date.now();
  const plan = getVerificationPlan(level);
  const results: ProviderResult[] = [];

  // Always run Self Protocol
  const selfResult = await verifySelf(level, userData.userAddress);
  results.push(selfResult);

  // Run Didit for Standard and Enhanced tiers
  if (level === "standard" || level === "enhanced") {
    const diditResult = await verifyWithDidit(level, userData.userAddress);
    results.push(diditResult);
  }

  // Always run Human Passport
  const hpResult = await verifyWithHumanPassport(
    level,
    userData.userAddress
  );
  results.push(hpResult);

  // Aggregate results
  const allChecks = results.flatMap((r) => r.checks);
  const passedChecks = allChecks.filter((c) => c.passed).length;
  const overallSuccess = results.every((r) => r.success);
  const demoMode = results.some((r) => r.demoMode);

  return {
    level,
    overallSuccess,
    providerResults: results,
    totalChecks: allChecks.length,
    passedChecks,
    demoMode,
    durationMs: Date.now() - start,
  };
}
