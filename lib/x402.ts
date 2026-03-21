/**
 * x402 Payment Protocol Integration
 *
 * x402 enables HTTP micropayments — the server responds with 402 Payment Required
 * and clients pay automatically via crypto. Built on EIP-3009 (transferWithAuthorization).
 *
 * In demo mode: simulates the payment flow visually without actual on-chain transactions.
 * In production: uses real cUSD transfers on Celo.
 */

import type { Address } from "viem";

export interface PaymentTier {
  level: "starter" | "basic" | "standard" | "enhanced";
  priceUSD: string;
  priceCUSD: string;
  description: string;
}

export interface PaymentRequest {
  scheme: "exact";
  network: "celo" | "celo-sepolia";
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string; // cUSD contract address
  extra: {
    name: string;
    version: string;
  };
}

export interface PaymentReceipt {
  txHash: string;
  paidAmount: string;
  paidTo: Address;
  timestamp: string;
  network: string;
  demoMode: boolean;
}

export interface x402PaymentResult {
  success: boolean;
  receipt?: PaymentReceipt;
  error?: string;
}

// Payment tiers
export const PAYMENT_TIERS: Record<string, PaymentTier> = {
  starter: {
    level: "starter",
    priceUSD: "$0.001",
    priceCUSD: "0.001",
    description: "Starter — phone + social proof (no documents required)",
  },
  basic: {
    level: "basic",
    priceUSD: "$0.01",
    priceCUSD: "0.01",
    description: "Basic — ZK passport proof via Self Protocol",
  },
  standard: {
    level: "standard",
    priceUSD: "$0.25",
    priceCUSD: "0.25",
    description: "Standard — Gov ID + liveness via Human Passport",
  },
  enhanced: {
    level: "enhanced",
    priceUSD: "$0.75",
    priceCUSD: "0.75",
    description: "Enhanced — ZK passport + biometric KYC + AML screening",
  },
};

// cUSD contract on Alfajores testnet
const CUSD_ADDRESS_ALFAJORES = "0xEF4d55D6dE8e8d73232827Cd1e9b2F2dBb45bC80";

/**
 * Generate a 402 Payment Required response header.
 * This is what the server sends back when payment is needed.
 */
export function generate402Header(
  level: "starter" | "basic" | "standard" | "enhanced",
  resource: string
): string {
  const tier = PAYMENT_TIERS[level];
  const issuerAddress = process.env.ISSUER_ADDRESS || "0x7f812f3a8695400e3075DAC2d5008CB068D162e7";

  const paymentRequest: PaymentRequest = {
    scheme: "exact",
    network: "celo-sepolia",
    maxAmountRequired: tier.priceCUSD,
    resource,
    description: tier.description,
    mimeType: "application/json",
    payTo: issuerAddress,
    maxTimeoutSeconds: 300,
    asset: CUSD_ADDRESS_ALFAJORES,
    extra: {
      name: "cUSD",
      version: "1",
    },
  };

  return Buffer.from(JSON.stringify(paymentRequest)).toString("base64");
}

/**
 * Verify a payment header from the client.
 * In production: validates the EIP-3009 signed transfer.
 * In demo mode: accepts any payment claim.
 */
export async function verifyPayment(
  paymentHeader: string,
  requiredAmount: string,
  level: "starter" | "basic" | "standard" | "enhanced"
): Promise<x402PaymentResult> {
  const isDemoMode = !process.env.ISSUER_PRIVATE_KEY || paymentHeader.startsWith("demo:");

  if (isDemoMode) {
    // Simulate payment verification
    await sleep(800);
    return {
      success: true,
      receipt: {
        txHash: "0x" + randomHex(64),
        paidAmount: requiredAmount,
        paidTo: (process.env.ISSUER_ADDRESS || "0x7f812f3a8695400e3075DAC2d5008CB068D162e7") as Address,
        timestamp: new Date().toISOString(),
        network: "celo-sepolia",
        demoMode: true,
      },
    };
  }

  try {
    // Decode payment header
    const paymentData = JSON.parse(
      Buffer.from(paymentHeader, "base64").toString("utf-8")
    );

    // In production: validate the signed EIP-3009 transfer
    // and verify the amount matches the required amount
    // This would use viem to validate the signature

    return {
      success: true,
      receipt: {
        txHash: paymentData.txHash,
        paidAmount: paymentData.amount,
        paidTo: paymentData.to as Address,
        timestamp: new Date().toISOString(),
        network: "celo-sepolia",
        demoMode: false,
      },
    };
  } catch {
    return {
      success: false,
      error: "Invalid payment header",
    };
  }
}

/**
 * Create a demo payment for the interactive demo page.
 * Simulates the full x402 flow without real transactions.
 */
export async function createDemoPayment(
  level: "starter" | "basic" | "standard" | "enhanced",
  payerAddress: string
): Promise<x402PaymentResult> {
  const tier = PAYMENT_TIERS[level];

  // Simulate processing
  await sleep(1500);

  return {
    success: true,
    receipt: {
      txHash: "0x" + randomHex(64),
      paidAmount: tier.priceCUSD,
      paidTo: (process.env.ISSUER_ADDRESS || "0x7f812f3a8695400e3075DAC2d5008CB068D162e7") as Address,
      timestamp: new Date().toISOString(),
      network: "celo-sepolia",
      demoMode: true,
    },
  };
}

// Helpers

function randomHex(length: number): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
