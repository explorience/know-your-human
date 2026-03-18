"use client";

import { useEffect, useState } from "react";

const nodes = [
  { id: "agent", label: "AI Agent", icon: "🤖", desc: "Requests KYC" },
  { id: "gateway", label: "KYC Gateway", icon: "🔐", desc: "Validates & routes" },
  { id: "self", label: "Self Protocol", icon: "📱", desc: "Scans passport NFC" },
  { id: "zk", label: "ZK Proof", icon: "⚡", desc: "Generates proof" },
  { id: "celo", label: "Celo Chain", icon: "⛓️", desc: "Records attestation" },
];

export default function AnimatedDiagram() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % nodes.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full py-8">
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex items-center justify-center gap-0">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center">
            {/* Node */}
            <div
              className={`relative flex flex-col items-center transition-all duration-500 ${
                activeStep === i ? "scale-110" : "scale-100 opacity-70"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${
                  activeStep === i
                    ? "bg-[#35D07F]/20 border-2 border-[#35D07F] shadow-[0_0_20px_rgba(53,208,127,0.4)]"
                    : "bg-gray-900 border border-gray-700"
                }`}
                style={
                  activeStep === i
                    ? { animation: "nodePulse 2s ease-in-out infinite" }
                    : {}
                }
              >
                {node.icon}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`text-xs font-semibold ${
                    activeStep === i ? "text-[#35D07F]" : "text-gray-400"
                  }`}
                >
                  {node.label}
                </div>
                <div className="text-xs text-gray-600 mt-0.5 w-20 text-center">
                  {node.desc}
                </div>
              </div>
            </div>

            {/* Arrow */}
            {i < nodes.length - 1 && (
              <div className="flex items-center mx-1 mb-6">
                <div
                  className={`h-0.5 w-8 transition-all duration-500 ${
                    activeStep > i ? "bg-[#35D07F]" : "bg-gray-700"
                  }`}
                  style={
                    activeStep === i
                      ? { animation: "flowPulse 1s ease-in-out infinite" }
                      : {}
                  }
                />
                <svg
                  className={`w-3 h-3 flex-shrink-0 transition-colors duration-500 ${
                    activeStep > i ? "text-[#35D07F]" : "text-gray-700"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical flow */}
      <div className="flex md:hidden flex-col items-center gap-0">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex flex-col items-center">
            <div
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                activeStep === i
                  ? "bg-[#35D07F]/10 border border-[#35D07F]/40"
                  : "opacity-60"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  activeStep === i
                    ? "bg-[#35D07F]/20"
                    : "bg-gray-800"
                }`}
              >
                {node.icon}
              </div>
              <div>
                <div
                  className={`text-sm font-semibold ${
                    activeStep === i ? "text-[#35D07F]" : "text-gray-400"
                  }`}
                >
                  {node.label}
                </div>
                <div className="text-xs text-gray-500">{node.desc}</div>
              </div>
            </div>
            {i < nodes.length - 1 && (
              <div
                className={`w-0.5 h-6 transition-colors duration-500 ${
                  activeStep > i ? "bg-[#35D07F]" : "bg-gray-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step label */}
      <div className="text-center mt-6">
        <span className="text-xs text-gray-500 font-mono">
          Step {activeStep + 1}/{nodes.length} ·{" "}
          <span className="text-[#35D07F]">{nodes[activeStep].label}</span>
        </span>
      </div>
    </div>
  );
}
