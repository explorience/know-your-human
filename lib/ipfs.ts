/**
 * IPFS Pinning via Pinata
 *
 * Pins evidence JSON blobs to IPFS for permanent, decentralized storage.
 * The CID becomes the evidenceRef in the EAS attestation.
 *
 * Free tier: 1GB storage, more than enough for evidence blobs (~500 bytes each).
 * Fallback: if Pinata is unavailable, evidence stays in-memory only.
 */

const PINATA_API = "https://api.pinata.cloud";

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Pin JSON to IPFS via Pinata.
 * Returns the IPFS CID (content identifier).
 */
export async function pinToIPFS(
  data: Record<string, unknown>,
  name?: string
): Promise<{ cid: string; url: string } | null> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    console.warn("PINATA_JWT not set, skipping IPFS pin");
    return null;
  }

  try {
    const response = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: name || `kyh-evidence-${Date.now()}`,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Pinata error ${response.status}: ${text}`);
      return null;
    }

    const result: PinataResponse = await response.json();
    return {
      cid: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    };
  } catch (error) {
    console.error("IPFS pin failed:", error);
    return null;
  }
}

/**
 * Check if IPFS pinning is configured.
 */
export function isIPFSConfigured(): boolean {
  return !!process.env.PINATA_JWT;
}
