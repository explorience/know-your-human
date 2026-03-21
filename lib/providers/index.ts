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
import { verifyWithStarter } from "./starter";

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
    | "nationality"
    | "phone";
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
  level: "starter" | "basic" | "standard" | "enhanced";
  providers: Array<"self" | "didit" | "human-passport" | "starter">;
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
  level: "starter" | "basic" | "standard" | "enhanced"
): VerificationPlan {
  switch (level) {
    case "starter":
      return {
        level,
        providers: ["starter"],
        checks: ["phone", "sybil-score"],
        estimatedCostUSD: "0.001",
        estimatedTimeSeconds: 2,
      };
    case "basic":
      return {
        level,
        providers: ["self"],
        checks: ["humanity", "age"],
        estimatedCostUSD: "0.01",
        estimatedTimeSeconds: 3,
      };
    case "standard":
      return {
        level,
        providers: ["human-passport"],
        checks: ["document", "liveness", "face-match", "humanity"],
        estimatedCostUSD: "0.25",
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
        estimatedCostUSD: "0.75",
        estimatedTimeSeconds: 12,
      };
  }
}

/**
 * Execute multi-provider verification for a given tier.
 */
export async function executeVerification(
  level: "starter" | "basic" | "standard" | "enhanced",
  userData: {
    userAddress: string;
    agentAddress: string;
    agentId?: number;
  }
): Promise<MultiProviderResult> {
  const start = Date.now();
  const plan = getVerificationPlan(level);
  const results: ProviderResult[] = [];

  if (level === "starter") {
    // Starter: phone + social stamps only, no document required
    const starterResult = await verifyWithStarter("starter", userData.userAddress);
    results.push(starterResult);
  } else if (level === "basic") {
    // Basic: Self Protocol ZK passport only
    const selfResult = await verifySelf(level, userData.userAddress);
    results.push(selfResult);
  } else if (level === "standard") {
    // Standard: Human Passport Individual Verifications (Gov ID + liveness + face match)
    const hpResult = await verifyWithHumanPassport(level, userData.userAddress);
    results.push(hpResult);
  } else if (level === "enhanced") {
    // Enhanced: Self + Didit full KYC + HP Clean Hands
    const [selfResult, diditResult, hpResult] = await Promise.all([
      verifySelf(level, userData.userAddress),
      verifyWithDidit(level, userData.userAddress),
      verifyWithHumanPassport(level, userData.userAddress),
    ]);
    results.push(selfResult, diditResult, hpResult);
  }

  // suppress unused warning
  void plan;

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
