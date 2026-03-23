import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ISSUER_PRIVATE_KEY: process.env.ISSUER_PRIVATE_KEY ? `set (${process.env.ISSUER_PRIVATE_KEY.length} chars)` : "MISSING",
    KYH_SCHEMA_UID: process.env.KYH_SCHEMA_UID ? `set (${process.env.KYH_SCHEMA_UID.slice(0,10)}...)` : "MISSING",
    EAS_CONTRACT: process.env.EAS_CONTRACT || "MISSING",
    CELO_RPC: process.env.CELO_RPC || "MISSING",
    HP_API_KEY: process.env.HP_API_KEY ? `set (${process.env.HP_API_KEY.length} chars)` : "MISSING",
    HP_SCORER_ID: process.env.HP_SCORER_ID || "MISSING",
    VENICE_API_KEY: process.env.VENICE_API_KEY ? "set" : "MISSING",
  });
}
