import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedDiagram from "@/components/AnimatedDiagram";
import VerificationCard from "@/components/VerificationCard";

const howItWorks = [
  {
    step: "01",
    title: "Agent Requests Verification",
    desc: "An AI agent calls the KYC Gateway API with user address and desired verification level. Payment is made automatically via x402 protocol.",
    icon: "🤖",
  },
  {
    step: "02",
    title: "x402 Micropayment",
    desc: "The gateway issues a 402 Payment Required response. The agent pays in cUSD on Celo — as low as $0.25 per verification.",
    icon: "💳",
  },
  {
    step: "03",
    title: "User Scans Passport",
    desc: "User receives a verification link and scans their passport NFC chip with the Self Protocol app. All processing happens locally.",
    icon: "📱",
  },
  {
    step: "04",
    title: "ZK Proof → On-Chain Attestation",
    desc: "Self Protocol generates a ZK-SNARK proof. The gateway verifies it and registers an attestation on Celo — no PII stored anywhere.",
    icon: "⛓️",
  },
];

const techBadges = [
  { label: "Celo", color: "badge-green", icon: "🟡" },
  { label: "Self Protocol", color: "badge-blue", icon: "🔐" },
  { label: "x402", color: "badge-yellow", icon: "💸" },
  { label: "ZK-SNARKs", color: "badge-green", icon: "⚡" },
  { label: "FederatedAttestations", color: "badge-blue", icon: "📜" },
  { label: "ERC-8004", color: "badge-yellow", icon: "🤖" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      {/* Hero section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background gradient blobs */}
        <div
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #35D07F 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-40 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #FCFF52 0%, transparent 70%)",
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="badge badge-green text-xs">
              🏆 Celo Hackathon 2026
            </span>
            <span className="badge badge-blue text-xs">
              Testnet Live
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            Privacy-Preserving
            <br />
            <span className="gradient-text">KYC for AI Agents</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            The first identity verification gateway built for the agentic web.
            AI agents pay $0.25 cUSD via <strong className="text-white">x402</strong>,
            users verify with <strong className="text-white">Self Protocol</strong> ZK proofs,
            attestations land on <strong className="text-[#35D07F]">Celo</strong> — zero PII stored.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/demo" className="btn-primary text-base px-6 py-3">
              🚀 Try Live Demo
            </Link>
            <Link href="/docs" className="btn-secondary text-base px-6 py-3">
              View API Docs
            </Link>
          </div>

          {/* Architecture diagram */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 text-center font-semibold">
              Verification Flow
            </p>
            <AnimatedDiagram />
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="py-20 px-4" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Simple, Transparent{" "}
              <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Pay per verification in cUSD on Celo. No subscriptions, no
              minimums. AI agents pay automatically via x402.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <VerificationCard
              tier="basic"
              price="$0.25"
              features={[
                "Phone number verification",
                "Humanity proof",
                "Basic KYC compliance",
                "On-chain attestation",
                "< 5 min verification",
              ]}
            />
            <VerificationCard
              tier="standard"
              price="$1.50"
              features={[
                "Government ID document",
                "Nationality check",
                "Age 18+ verification",
                "ZK proof (no PII stored)",
                "FederatedAttestation on Celo",
                "< 10 min verification",
              ]}
              highlighted={true}
            />
            <VerificationCard
              tier="enhanced"
              price="$5.00"
              features={[
                "Biometric verification",
                "Sanctions list screening",
                "Full AML compliance",
                "Passport NFC scan",
                "Highest trust level",
                "Priority processing",
              ]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-[#0d1117]/50" id="how">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              End-to-end privacy-preserving KYC in four steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="glass-card rounded-2xl p-6 flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-[#35D07F]/10 border border-[#35D07F]/30 flex items-center justify-center text-xl flex-shrink-0">
                    {step.icon}
                  </div>
                  <div className="text-xs font-mono text-[#35D07F] mt-2 opacity-60">
                    {step.step}
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-6 font-semibold">
            Powered By
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {techBadges.map((badge) => (
              <span key={badge.label} className={`badge ${badge.color} text-sm px-4 py-2`}>
                {badge.icon} {badge.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(53, 208, 127, 0.15) 0%, rgba(252, 255, 82, 0.05) 100%)",
              border: "1px solid rgba(53, 208, 127, 0.3)",
            }}
          >
            <div className="text-5xl mb-6 animate-float">🤖</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Built for the Agentic Web
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
              As AI agents gain autonomy and handle real-world transactions,
              identity verification becomes critical infrastructure. KYCGateway
              makes this seamless, private, and cheap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo" className="btn-primary text-base px-6 py-3">
                🚀 Try the Demo
              </Link>
              <a
                href="https://github.com/explorience/agent-kyc-gateway"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-base px-6 py-3"
              >
                ⭐ Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
