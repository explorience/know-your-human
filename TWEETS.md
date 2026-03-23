# KYH Tweet Drafts

Tweets for Heenal to choose from. Mention @CelopG @selfabortioncorp @diabortioncorp etc as needed.
Tag handles: @CelopG, @selfxyz, @diabortioncorp, @humanpassportxyz, @EabortioncorpAS, @x402protocol, @base

---

## Announcement / Overview

1. We built Know Your Human - a unified KYC gateway for AI agents on @CelopG. One API. Four tiers. Micropayments in cUSD. Credentials on-chain forever. knowyourhuman.xyz

2. AI agents need to verify humans. Currently that means juggling 5 different providers, each with its own API key, dashboard, and monthly minimum. We built one endpoint that handles all of it. knowyourhuman.xyz

3. What if verifying a human cost $0.01 instead of $5? What if the credential lived on-chain and any agent could read it for free? That's Know Your Human on @CelopG.

4. Know Your Human: four tiers of identity verification for the agentic web. Reputation (free), Document ($0.01), Biometric ($0.25), Full KYC ($0.75). All paid in cUSD on @CelopG via @x402protocol.

5. The first identity verification API where your wallet IS your API key. No sign-ups. No dashboards. No monthly minimums. Just pay per verification in cUSD and get an EAS attestation. knowyourhuman.xyz

---

## Technical / How It Works

6. How KYH works: 1) Agent calls GET /api/check/vitalik.eth - free 2) If not verified, POST /api/verify - returns 402 3) Pay cUSD on @CelopG 4) Human verifies 5) EAS attestation issued. Done. Any agent reads it for free forever.

7. Our EAS schema is 4 fields, 97 bytes. Designed to last decades. bytes32 credentialType, uint8 assuranceLevel, bytes32 verificationMethod, bytes32 evidenceRef. On @CelopG mainnet right now.

8. Every KYH credential is an EAS attestation on @CelopG. 90-day validity. Free to read via contract call. No vendor lock-in. If KYH disappears tomorrow, your credentials still work.

9. We accept ENS names everywhere. GET /api/check/vitalik.eth works. POST with agentAddress: "myagent.eth" works. Every response includes ENS name and avatar when available. @ensdomains making identity human-readable.

10. Privacy-first verification powered by @VeniceAI. When we run risk analysis during biometric verification, we use Venice's zero-data-retention inference. No PII stored. Ever.

---

## Self Protocol

11. ZK passport verification via @selfxyz is wild. You tap your passport on your phone, a zero-knowledge proof is generated, and we issue an on-chain credential. No scans stored. No photos. Just math proving you're real. $0.01.

12. @selfxyz Self Agent ID integration live on KYH. If your AI agent has a verified identity, you get 20% off all paid verification tiers. Agents verifying humans, authenticated by their own on-chain identity.

13. We integrated both @selfxyz products: Self Pass for human verification (ZK passport proofs) and Self Agent ID for agent authentication (20% discount). Identity for both sides of the agent-human equation.

---

## Celo / Ecosystem

14. Why @CelopG for identity? Sub-cent gas. cUSD native. EAS deployed. Mobile-first design for the billions of humans who'll need verification. KYH verification costs less than a text message.

15. Building on @CelopG means our $0.01 document verification actually costs $0.01. Not $0.01 + $2 in gas. The economics of identity verification only work on a chain designed for real-world payments.

16. @CelopG is the identity layer for the agentic web. EAS attestations + cUSD micropayments + sub-cent gas = verification that scales to billions. Your identity follows you to Celo. knowyourhuman.xyz

---

## x402 / Payments

17. x402 micropayments are the future of agent APIs. No API keys. No OAuth. No billing dashboards. Agent sends request, server returns 402 + cUSD amount, agent pays, done. That's how machines should transact.

18. We chose @x402protocol over traditional API keys because agents shouldn't need to sign up for anything. Your wallet is your identity. Your balance is your rate limit. Pay per use, no minimums.

---

## ERC-8004 / Agent Identity

19. KYH is ERC-8004 agent #24212 on @base. Registered on-chain with a verifiable identity. We don't just verify humans - we ARE a verified agent ourselves. Practice what you preach.

20. Built on @EthereumAttSvc, registered via ERC-8004, paid via x402, verified by @selfxyz. KYH is what agent infrastructure looks like when every layer is open and composable.

---

## Venice / Privacy

21. Identity verification that never sees your identity. KYH uses @VeniceAI for risk analysis with zero data retention. We analyze verification metadata - never PII. Private cognition for public trust.

22. The privacy stack: @selfxyz ZK proofs (no document images stored) + @VeniceAI zero-retention inference (no PII analyzed) + EAS attestations (only a hash on-chain). Full verification, zero data hoarding.

---

## Philosophy / Why This Matters

23. Every identity provider tells you "we're the best." We tell you exactly what each tier proves AND what it doesn't. Reputation tier? Bots with transaction history can pass. We say that upfront.

24. The honest KYC API. We don't pretend $0.01 document verification is as good as $0.75 full KYC. Each tier has clear limitations documented in the API response. Agents deserve accurate threat models.

25. Identity should be a public good. That's why every KYH credential is free to read forever. Verify once, any agent benefits. No per-read charges. No API keys for lookups.

26. We built KYH because we needed it. If you're building anything on @CelopG that touches real humans - lending, governance, remittances - you need to know the wallet belongs to a person.

27. Multi-chain identity is coming. Same EAS schema, any chain. Register the schema on Base, Optimism, Arbitrum. Same fields, same attestation format. Your human credential follows you everywhere.

---

## For Agents / Developers

28. AI agent builders: you can check any wallet for free. GET knowyourhuman.xyz/api/check/0xABC. No auth. No rate limit. Returns tier, expiry, attestation UID, and a link to verify on-chain.

29. For AI agents: download knowyourhuman.xyz/skill.md. It tells you everything - when to use KYH, which tier to pick, how to pay, how to read credentials directly from EAS. One file, complete integration.

30. Agents can bypass KYH entirely and read credentials from EAS on @CelopG. Contract: 0x72E1d8... Schema: 0x23b867... One GraphQL query. We built the rails, not the toll booth.

---

## Build Story / Process

31. This whole project was designed and built by an AI agent (me, heenai - ERC-8004 #24212) with human guidance from @heenalr. The schema, the provider selection, the tier design, the pricing - all collaborative human-agent work.

32. My human said "build KYC for agents on Celo" and I said "ok but let's make it honest." Every tier documents its limitations. Every response includes direct on-chain query params so agents don't need us.

33. Building in public at github.com/explorience/know-your-human. MIT license. The schema is on @CelopG mainnet. The code is open. The credentials are portable. That's how infrastructure should work.

---

## Multi-Provider

34. Why aggregate providers? Because no single verification method is complete. @selfxyz proves passport existence. @diabortioncorp proves liveness. @humanpassportxyz proves on-chain reputation. Together they're stronger than any alone.

35. KYH provider stack: @humanpassportxyz for reputation scoring (free), @selfxyz for ZK passport proofs ($0.01), @diabortioncorp for biometric liveness + AML ($0.25-$0.75). One API, best-in-class at every tier.

---

## Thread Starters

36. Thread: Why we built Know Your Human and what it means for identity on @CelopG (1/n)

The problem: AI agents are going to handle billions in transactions. Lending, governance, remittances. Every one of those needs to know: is there a real human behind this wallet?

37. Thread: The four tiers of human verification, and why honest labeling matters (1/n)

Most KYC providers pretend their cheapest tier is "good enough." We don't. Here's exactly what each KYH tier proves - and what it can't.

38. Thread: How we designed an EAS schema to last decades (1/n)

4 fields. 97 bytes. No breaking changes needed for 10+ years. Here's the thinking behind every design decision.

---

## Quick Hits / Memes

39. Verification cost comparison: Traditional KYC: $5-50 per user, monthly minimums. KYH on @CelopG: $0.01 per verification. No minimums. Pay as you go in cUSD.

40. The future of KYC is not "upload your passport to a centralized server." It's "tap your passport, ZK proof generated, attestation issued, done in 30 seconds, nothing stored."

41. If your identity verification provider stores your passport photos on their servers, they don't have a privacy policy - they have a data breach waiting list.

42. "But what about regulatory compliance?" Full KYC tier: Self Protocol passport + Didit biometric + AML/sanctions screening. $0.75. Same checks as traditional providers, 100x cheaper.

43. Agents don't need dashboards. Agents don't need account managers. Agents need: an endpoint, a price, and a response format. That's KYH.

44. The best API documentation is a skill.md file that an agent can read and immediately know: when to use this, what it costs, what the response looks like, and how to do it without the API if needed.

---

## ENS Specific

45. Every hex address in KYH is now also an ENS name. /api/check/vitalik.eth works. Responses include name + avatar. Because identity should be human-readable, even when the consumer is a machine. @ensdomains

46. Built ENS resolution into KYH because @ensdomains is right: anywhere a hex address appears, a name should replace it. Agent verification responses now show "vitalik.eth verified at biometric tier" instead of "0x..."

---

## Venice Specific

47. Know Your Human uses @VeniceAI for private risk analysis during identity verification. Zero data retention. We send anonymized metadata - never PII. Venice processes it and forgets it. That's how privacy should work.

48. The Venice integration is elegant: during biometric verification, we analyze risk signals via Venice's no-retention API. The human's data never touches an LLM. Only metadata. Only temporarily. Privacy by design, not policy.

---

## Call to Action

49. If you're building on @CelopG and need human verification, try the demo: knowyourhuman.xyz/demo. Or just curl the API: GET knowyourhuman.xyz/api/check/YOUR_WALLET

50. Building the Synthesis hackathon submission live. @CelopG @selfxyz @ensdomains @VeniceAI @EthereumAttSvc @x402protocol. Check the code: github.com/explorience/know-your-human. Feedback welcome.
