"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import AttestationBadge from "@/components/AttestationBadge";

interface VerificationStatus {
  verificationId: string;
  status: "pending" | "completed" | "failed";
  level: string;
  attestationHash?: string;
  createdAt: string;
  expiresAt: string;
}

// Self Protocol redirect URL from their SDK
const SELF_REDIRECT_URL = "https://app.self.xyz/verify";

export default function VerifyPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollCount, setPollCount] = useState(0);
  const [selfQrData, setSelfQrData] = useState<string | null>(null);
  const [selfDeeplink, setSelfDeeplink] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  // Detect mobile
  useEffect(() => {
    const ua = navigator.userAgent || "";
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(ua));
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/verification/${sessionId}/callback`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        return data.status;
      }
    } catch {
      // ignore
    }
    return null;
  }, [sessionId]);

  // Load session data and Self QR
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      
      // Fetch verification status
      const currentStatus = await fetchStatus();
      
      // If not completed, try to get the QR data from the session
      if (currentStatus !== "completed" && currentStatus !== "failed") {
        try {
          // The QR data is stored in the verification request - fetch it
          const res = await fetch(`/api/verification/${sessionId}/callback`);
          if (res.ok) {
            const data = await res.json();
            // Check if qrData exists in response (we'll add this to the GET endpoint)
            if (data.selfQrData) {
              setSelfQrData(data.selfQrData);
              const deeplink = `${SELF_REDIRECT_URL}?selfApp=${encodeURIComponent(data.selfQrData)}`;
              setSelfDeeplink(deeplink);
              // Generate QR code image using a free API
              setQrImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(deeplink)}`);
            }
          }
        } catch {
          // QR data not available, show fallback
        }
      }
      
      setLoading(false);
    };
    load();
  }, [sessionId, fetchStatus]);

  // Poll for status
  useEffect(() => {
    if (status?.status === "completed" || status?.status === "failed") return;

    const interval = setInterval(async () => {
      const s = await fetchStatus();
      setPollCount((c) => c + 1);
      if (s === "completed" || s === "failed") {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status?.status, fetchStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#35D07F] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#35D07F]/10 border border-[#35D07F]/30 flex items-center justify-center text-3xl mx-auto mb-4">
              📱
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Identity Verification
            </h1>
            <p className="text-gray-400 text-sm">
              Verify your identity with Self Protocol - your data never leaves your device
            </p>
          </div>

          {/* Status card */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 mb-6">
            {status?.status === "completed" ? (
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Verification Complete!
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Your identity has been verified and attestation recorded on Celo.
                </p>
                <AttestationBadge
                  level={(status.level as "basic" | "standard" | "enhanced") || "basic"}
                  issuedAt={status.createdAt}
                  txHash={status.attestationHash}
                />
                {status.attestationHash && (
                  <a
                    href={`https://celo.blockscout.com/tx/${status.attestationHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-[#35D07F] text-sm hover:underline"
                  >
                    View on CeloScan ↗
                  </a>
                )}
              </div>
            ) : status?.status === "failed" ? (
              <div className="text-center">
                <div className="text-5xl mb-4">❌</div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-400 text-sm">
                  The verification could not be completed. Please try again.
                </p>
              </div>
            ) : (
              <div>
                {/* Pending state */}
                <div className="text-center mb-4">
                  <div className="w-8 h-8 border-2 border-[#35D07F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    Waiting for verification...{" "}
                    {pollCount > 0 && (
                      <span className="text-gray-600">(checked {pollCount}x)</span>
                    )}
                  </p>
                </div>

                {isMobile && selfDeeplink ? (
                  /* Mobile: Show direct link to Self app */
                  <div className="space-y-4">
                    <a
                      href={selfDeeplink}
                      className="w-full py-4 bg-[#35D07F] text-[#0a0a0a] font-semibold rounded-xl hover:bg-[#2db86e] transition-colors flex items-center justify-center gap-2 text-lg"
                    >
                      📲 Open Self App to Verify
                    </a>
                    <p className="text-xs text-gray-500 text-center">
                      Opens the Self app where you&apos;ll scan your passport via NFC.
                      ZK proof generated on your device - no data leaves your phone.
                    </p>
                    <p className="text-xs text-gray-600 text-center">
                      Don&apos;t have the Self app?{" "}
                      <a href="https://self.xyz" target="_blank" rel="noopener noreferrer" className="text-[#35D07F] underline">
                        Download it here
                      </a>
                    </p>
                  </div>
                ) : qrImageUrl ? (
                  /* Desktop: Show QR code */
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 mx-auto w-fit">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={qrImageUrl} 
                        alt="Scan with Self app" 
                        width={250} 
                        height={250}
                        className="rounded"
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Scan this QR code with the Self app on your phone.
                      You&apos;ll tap your NFC passport and a ZK proof will be generated automatically.
                    </p>
                    <p className="text-xs text-gray-600 text-center">
                      Session: {sessionId.slice(0, 16)}...
                    </p>
                  </div>
                ) : (
                  /* Fallback: No QR data available */
                  <div className="text-center space-y-4">
                    <p className="text-gray-400 text-sm">
                      This verification session is waiting for a Self Protocol passport scan.
                    </p>
                    <p className="text-xs text-gray-600">
                      Session: {sessionId}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Privacy note */}
          <div className="text-center">
            <p className="text-xs text-gray-600">
              🔒 Your personal data is never stored or transmitted - only a ZK
              proof that you meet the verification criteria.
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-800/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
