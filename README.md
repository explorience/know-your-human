# Know Your Human (KYH)

**Your identity follows you to Celo.**

An identity verification gateway for AI agents and dApps on Celo. Verify a human once — the credential lives on-chain for 90 days. Any agent or dApp reads it for free.

🌐 **Live:** [knowyourhuman.xyz](https://knowyourhuman.xyz)

## How It Works

1. **Agent or dApp requests verification** — identified via ERC-8004 or wallet address. No API keys needed.
2. **x402 micropayment in cUSD** — the caller pays $0.001–$0.75 depending on tier. No invoices, no sign-ups.
3. **Human verifies once** — scan passport NFC (Self Protocol), complete liveness check (Didit), or confirm social presence (Human Passport).
4. **EAS attestation issued on Celo** — valid for 90 days. Free to read forever. Pure public good.

## Four Tiers

| Tier | Price | Provider | What's Verified |
|------|-------|----------|----------------|
| **Starter** | $0.001 | Human Passport | Phone + social presence |
| **Basic** | $0.01 | Self Protocol | NFC passport, ZK-SNARK proof |
| **Standard** | $0.25 | Didit | Gov ID + liveness + face match |
| **Enhanced** | $0.75 | Self + Didit + HP | Full biometric KYC + AML screening |

All tiers produce a 90-day EAS credential on Celo.

## Tech Stack

- **Celo** — L2 blockchain for payments and attestations
- **EAS** (Ethereum Attestation Service) — on-chain credential storage
- **Self Protocol** — ZK passport proofs (NFC chip scan, no PII shared)
- **Human Passport** — social + activity scoring (formerly Gitcoin Passport)
- **Didit** — biometric KYC, liveness detection, AML screening
- **x402** — HTTP payment protocol for micropayments in cUSD
- **ERC-8004** — on-chain agent registry (KYH is Agent #24212)
- **Next.js** — frontend framework
- **Vercel** — deployment

## Getting Started

```bash
git clone https://github.com/explorience/know-your-human.git
cd know-your-human
npm install
cp .env.example .env.local
# Fill in your provider credentials
npm run dev
```

### Environment Variables

```
CELO_RPC=https://forno.celo.org
EAS_CONTRACT=0x72E1d8ccf5299fb36fEfD8CC4394B8ef7e98Af92
SCHEMA_REGISTRY=0x5ece93bE4BDCF293Ed61FA78698B594F2135AF34
ISSUER_PRIVATE_KEY=your_key
HP_API_KEY=your_key
HP_SCORER_ID=your_id
DIDIT_APP_ID=your_id
DIDIT_API_KEY=your_key
SELF_APP_ID=kyh-gateway
```

## Architecture

```
Agent/dApp → (x402 payment) → KYH Gateway → Verification Provider
                                                    ↓
                                              ZK Proof / Score
                                                    ↓
                                        EAS Attestation on Celo
                                                    ↓
                                    Any agent reads credential (free)
```

## Key Design Decisions

- **No API keys** — wallets are the identity. Agents use ERC-8004, dApps use wallet addresses.
- **x402 payments** — HTTP-native micropayments. No invoices, no accounts.
- **90-day validity** — all tiers, same validity. Tier determines assurance level, not duration.
- **Verify once, read forever** — first verification costs money. Every subsequent read is free.
- **Zero PII stored** — ZK proofs verify without revealing personal data.

## License

MIT

## Team

- **Heenal Rajani** ([@explorience](https://github.com/explorience))
- **Tej** — AI agent coordinator (ERC-8004 #24212)

Built for the [Celo "Build Agents for the Real World V2" Hackathon](https://celo.org), March 2026.
