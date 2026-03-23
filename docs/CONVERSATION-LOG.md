# Conversation Log - Know Your Human (KYH)

Human-agent collaboration log for Know Your Human (KYH).
Built by Heenal Rajani (human) and Tej/heenai (AI agent, ERC-8004 #24212) using OpenClaw with Claude Opus 4.6.

## Session 1: Architecture & Schema Design

Human asked for a KYC gateway for Celo. Agent proposed a claims-aware EAS schema with boolean on-chain fields (over18, uniqueHuman, notSanctioned). Human pushed back hard: "choosing fields makes the schema opinionated, which we don't want." This was the breakthrough moment. Redesigned to a two-layer system: lean on-chain attestation (3 fields: level, provider, demoMode) that never needs migration, plus an extensible off-chain claims layer as versioned JSON. Human's architectural instinct was correct and shaped the entire project.

## Session 2: Venice AI Integration

Agent proposed using Venice AI as the core reasoning engine instead of hard-coded if/else scoring logic. Built lib/venice.ts (10.6KB) with direct Venice API calls to llama-3.3-70b. Venice receives anonymized provider signals and makes holistic pass/fail decisions. It catches patterns threshold logic misses: "liveness passed but wallet is 2 hours old." Human approved after seeing Venice correctly flag edge cases in testing. Added deterministic fallback for when Venice is unreachable.

## Session 3: Provider Integration

Integrated Self Protocol for ZK passport proofs, Human Passport for onchain reputation, and Didit for biometric verification. Agent initially had Didit as stub code. Found the real API through their GitHub demo repo (verification.didit.me with X-API-Key header, not the documented apx.didit.me). Human completed a real Didit verification session - passport scan, liveness check, face match. All approved: face match 97%, liveness 82%.

## Session 4: Claims Layer & IPFS

Human asked "is it easy to write to IPFS?" Agent integrated Pinata in 15 minutes. Evidence JSON blobs now pinned automatically on every verification. Each claim (uniqueHuman, over18, livenessConfirmed, faceMatch, notSanctioned) traces back to which provider verified it. Evidence hash stored as evidenceRef in the EAS attestation. Free /api/check/:address endpoint returns claims directly.

## Session 5: Honest Tier Design

Human insisted every tier documents what it CAN'T prove, not just strengths. "Bots with history can pass" for the reputation tier. This became a core design principle. Four tiers: reputation (free), document ($0.01), biometric ($0.25), full KYC ($0.75). Each tier's limitations are documented alongside its guarantees.

## Session 6: ENS Integration

Agent added ENS name resolution across all API endpoints. Accepts vitalik.eth, returns address + avatar. Fixed dead RPC (eth.llamarpc.com blocked by Cloudflare, switched to ethereum-rpc.publicnode.com). Explorer page updated to query live API and display ENS names.

## Session 7: Site Design & Branding

Human provided logo options via Discord. Agent integrated chosen design (human silhouette with blockchain nodes). Removed all AI tropes from copy ("seamless", "cutting-edge", "revolutionary" - all gone). Human reviewed full submission text and caught: description sounding like agent identity instead of human identity, unnecessary ERC-8004 mentions, need for Self Protocol emphasis. All fixed. Copy style: first person, humble, curious, honest about limitations.

## Session 8: Submission & Polish

Agent handled Synthesis API registration, Karma Gap submission, track selection (8 tracks). Human guided strategic decisions. GitHub cleaned up: stale docs moved to /docs, merged branch deleted, completed issues closed. Real Didit v3 API wired up with webhook callback. All 4 verification tiers tested end-to-end with live EAS attestations on Celo mainnet and IPFS pinning.

## Key Technical Decisions

- **Two-layer credential design**: On-chain EAS attestation is lean (3 fields). Off-chain claims layer is extensible JSON pinned to IPFS. New claims added as JSON keys, no schema migration needed.
- **Venice as reasoning engine**: Replaces hard-coded scoring with contextual AI decisions. Zero data retention. Deterministic fallback.
- **x402 micropayments**: Pay-per-verification in cUSD. No API keys, no subscriptions. HTTP 402 flow.
- **Self Agent ID discount**: Verified agents (checked against Celo mainnet registry) get 20% off.
- **Credential validity**: 90 days. Read forever for free via GET /api/check/:address.

## Tools Used

OpenClaw (harness), Claude Opus 4.6 (model), GitHub, Vercel, Celo mainnet, Venice AI API, Self Protocol SDK, Didit v3 API, Human Passport API, EAS SDK, IPFS/Pinata, ENS/viem, x402, ERC-8004 registry.

## Stats

- Total collaboration: ~50 turns across 8 sessions over 2 days
- 15+ commits on main
- 4 identity providers integrated
- 1 real KYC verification completed (Didit, approved)
- 1 EAS schema registered on Celo mainnet
- 8 hackathon tracks submitted
