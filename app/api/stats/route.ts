import { NextResponse } from "next/server";
import { verificationRequests } from "@/app/api/verification/route";

export async function GET() {
  const all = Array.from(verificationRequests.values());

  const stats = {
    totalVerifications: all.length,
    completed: all.filter((v) => v.status === "completed").length,
    pending: all.filter((v) => v.status === "pending").length,
    failed: all.filter((v) => v.status === "failed").length,
    byLevel: {
      basic: all.filter((v) => v.level === "basic").length,
      standard: all.filter((v) => v.level === "standard").length,
      enhanced: all.filter((v) => v.level === "enhanced").length,
    },
    revenueEstimate: {
      total: calculateRevenue(all),
      currency: "cUSD",
    },
  };

  return NextResponse.json(stats);
}

function calculateRevenue(
  verifications: Array<{ level: string; status: string }>
) {
  const prices: Record<string, number> = {
    basic: 0.25,
    standard: 1.5,
    enhanced: 5.0,
  };

  return verifications
    .filter((v) => v.status === "completed")
    .reduce((total, v) => total + (prices[v.level] || 0), 0)
    .toFixed(2);
}
