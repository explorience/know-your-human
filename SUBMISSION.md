# Hackathon Submission: Know Your Human (KYH)

**Tagline:** Your identity follows you to Celo.

**Live Demo:** [knowyourhuman.xyz](https://knowyourhuman.xyz)
**GitHub:** [github.com/explorience/know-your-human](https://github.com/explorience/know-your-human)

---

## Problem

AI agents and dApps increasingly need to verify human identity — for lending, governance, remittances, and compliance. Current KYC solutions are:

- **Fragmented** — each provider has its own API, credentials, and format
- **Expensive** — monthly minimums and enterprise contracts
- **Siloed** — verification results don't transfer between apps
- **Web2** — API keys, dashboards, manual sign-ups

There's no shared, reusable, on-chain credential for "this wallet belongs to a verified human."

## Solution

**Know Your Human** is a unified KYC gateway that:

1. **Aggregates multiple verification providers** — Self Protocol (ZK passport proofs), Human Passport (social + activity scoring), and Didit (biometric KYC + AML)
2. **Charges via x402 micropayments** — $0.001 to $0.75 in cUSD per verification. No API keys, no sign-ups. The wallet IS the identity.
3. **Issues EAS attestations on Celo** — valid for 90 days. Free to read forever by any agent or dApp. Pure public good.
4. **Uses ERC-8004 for agent identity** — agents identify themselves on-chain. KYH is Agent #24212.

**Verify once. Credential lives on-chain. Any agent reads it for free.**

## How It Uses Celo

- **x402 payments in cUSD** — Celo's stablecoin enables sub-cent micropayments ($0.001 per check)
- **EAS attestations on Celo mainnet** — identity credentials stored as on-chain attestations
- **Celo's low gas costs** — makes per-verification attestations economically viable
- **cUSD stability** — verification costs are predictable, not volatile

## Four Tiers

| Tier | Price | Provider | Method |
|------|-------|----------|--------|
| Starter | $0.001 | Human Passport | Phone + social presence scoring |
| Basic | $0.01 | Self Protocol | NFC passport chip → ZK-SNARK proof |
| Standard | $0.25 | Didit | Gov ID scan + liveness + face match |
| Enhanced | $0.75 | All three | Full biometric KYC + AML screening |

## What's Novel

- **Multi-provider aggregation** — one API, three verification backends, four tiers. Pick your assurance level.
- **x402 pay-per-verification** — no API keys, no accounts. Just an HTTP endpoint that returns 402 until you pay. Truly web3-native billing.
- **ERC-8004 agent identity** — requesting agents are identifiable on-chain. Builds trust and reputation.
- **Tiered public good** — low barrier ($0.001) for basic proof of humanity, higher assurance available. Credential is free to read once issued.
- **Your identity follows you to Celo** — verification data from any chain (HP activity scores, Self passport proofs) results in a Celo-native credential.

## Architecture

```
Agent/dApp (ERC-8004 or wallet)
        ↓ x402 payment in cUSD
    KYH Gateway
        ↓ routes to provider
Self Protocol / Human Passport / Didit
        ↓ ZK proof or score
    EAS Attestation on Celo
        ↓ free to read
    Any agent or dApp
```

## Tech Stack

- Next.js, TypeScript, Tailwind CSS
- Celo (mainnet), EAS, x402
- Self Protocol SDK (`@selfxyz/core`)
- Human Passport API (`passport.xyz`)
- Didit API v3 (`verification.didit.me`)
- ERC-8004 (Agent #24212 on Base)
- Vercel (deployment)

## Team

- **Heenal Rajani** — builder, [Reimagine Co](https://reimagineco.ca). Community tech, regenerative economics, web3.
- **Tej** — AI agent coordinator. ERC-8004 #24212. Built the gateway, wrote the code, debugged the APIs.

## Demo Video

_Link TBD_

---

Built for the **Celo "Build Agents for the Real World V2" Hackathon**, March 2026.
