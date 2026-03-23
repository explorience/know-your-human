/**
 * Venice AI Integration — Private Cognition for Identity Verification
 *
 * Venice provides no-data-retention inference. We use it for privacy-sensitive
 * analysis during verification — document classification, risk assessment,
 * and anomaly detection — without storing any user data.
 *
 * OpenAI-compatible API at https://api.venice.ai/api/v1
 */

const VENICE_API_KEY = process.env.VENICE_API_KEY;
const VENICE_BASE_URL = "https://api.venice.ai/api/v1";

export function isVeniceConfigured(): boolean {
  return !!VENICE_API_KEY;
}

interface VeniceAnalysis {
  riskScore: number; // 0-100, higher = more risk
  flags: string[];
  reasoning: string;
  confidence: number; // 0-1
  private: true; // Venice guarantee: no data retained
}

/**
 * Analyze verification data privately via Venice.
 * Used during biometric and fullkyc tiers for risk assessment
 * without retaining any PII.
 */
export async function analyzeVerificationPrivately(params: {
  tier: string;
  walletAge?: number; // days
  transactionCount?: number;
  previousVerifications?: number;
  countryCode?: string;
  documentType?: string;
}): Promise<VeniceAnalysis> {
  if (!VENICE_API_KEY) {
    // Return neutral analysis if Venice is not configured
    return {
      riskScore: 50,
      flags: ["venice_not_configured"],
      reasoning: "Venice AI not configured — using default risk assessment.",
      confidence: 0,
      private: true,
    };
  }

  try {
    const response = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages: [
          {
            role: "system",
            content: `You are a privacy-preserving identity risk assessor. Analyze the following verification request and return a JSON object with: riskScore (0-100), flags (array of risk flag strings), reasoning (brief explanation), confidence (0-1). Be conservative — flag anything unusual but don't block legitimate users. You will NEVER see actual PII — only metadata about the verification request.`,
          },
          {
            role: "user",
            content: JSON.stringify({
              tier: params.tier,
              walletAgeDays: params.walletAge ?? "unknown",
              txCount: params.transactionCount ?? "unknown",
              priorVerifications: params.previousVerifications ?? 0,
              country: params.countryCode ?? "unknown",
              docType: params.documentType ?? "unknown",
            }),
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
        venice_parameters: {
          include_venice_system_prompt: false,
        },
      }),
    });

    if (!response.ok) {
      console.error(`Venice API error: ${response.status}`);
      return {
        riskScore: 50,
        flags: ["venice_api_error"],
        reasoning: `Venice API returned ${response.status}`,
        confidence: 0,
        private: true,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON from Venice's response
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        riskScore: Math.min(100, Math.max(0, parsed.riskScore || 50)),
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        reasoning: parsed.reasoning || "Analysis complete.",
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
        private: true,
      };
    }

    return {
      riskScore: 50,
      flags: ["venice_parse_error"],
      reasoning: "Could not parse Venice response.",
      confidence: 0,
      private: true,
    };
  } catch (error) {
    console.error("Venice analysis error:", error);
    return {
      riskScore: 50,
      flags: ["venice_error"],
      reasoning: "Venice analysis failed — using default assessment.",
      confidence: 0,
      private: true,
    };
  }
}

/**
 * Privacy attestation — returns metadata about Venice's data handling
 * for transparency in API responses.
 */
export function getPrivacyAttestation() {
  return {
    provider: "Venice AI",
    dataRetention: "none",
    description:
      "Risk analysis performed via Venice AI with zero data retention. No PII is sent to or stored by Venice — only anonymized metadata about the verification request.",
    url: "https://venice.ai",
    configured: isVeniceConfigured(),
  };
}
