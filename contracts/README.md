# KYH Smart Contracts

## KYHRegistry.sol

The core economic primitive of Know Your Human — a self-funding credential layer on Celo.

### What it does

When an agent verifies a human through KYH, an EAS attestation is issued to the human's wallet. KYHRegistry tracks who paid for that verification (the **sponsor**) and distributes earnings when other agents subsequently check that credential.

### Sponsor Economics

```
First verification: Agent A pays $0.75 → KYH verifies human → EAS attestation issued
                    KYHRegistry records: attestation → Agent A (sponsor), cost = $0.75

Read fee (0.005 cUSD each time an agent checks the credential):
  Phase 1 (until sponsor earns 2x = $1.50):
    → 40% ($0.002) to Agent A
    → 60% ($0.003) to KYH protocol

  Phase 2 (after 2x recouped, forever):
    → 10% ($0.0005) to Agent A  
    → 90% ($0.0045) to KYH protocol

Agent A claims earnings anytime with claimEarnings()
```

This creates aligned incentives: first movers take the cost and risk, but get rewarded as the credential gains utility across the ecosystem.

### Celo Addresses

| Contract | Address |
|----------|---------|
| EAS | `0x72E1d8ccf5299fb36fEfD8CC4394B8ef7e98Af92` |
| EAS SchemaRegistry | `0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0` |
| cUSD | `0x765DE816845861e75A25fCA122bb6898B8B1282a` |
| cUSD (Alfajores) | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` |

### KYH Schema

Register this schema on EAS before deploying:

```
uint8 level, string provider, bool demoMode
```

Level values:
- `1` = Starter (phone + social proof)
- `2` = Basic (Self Protocol ZK passport)
- `3` = Standard (HP Individual Verifications)
- `4` = Enhanced (Self + Didit + HP Clean Hands)

### Credential Validity Windows

| Level | Duration |
|-------|----------|
| Starter | 7 days |
| Basic | 30 days |
| Standard | 60 days |
| Enhanced | 90 days |

### Deployment

```bash
# Install Hardhat (or use Foundry)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Deploy to Celo Alfajores testnet
npx hardhat run contracts/deploy.ts --network alfajores

# Deploy to Celo mainnet
npx hardhat run contracts/deploy.ts --network celo
```

### Key Functions

```solidity
// Register a new verification (called by KYH backend after EAS attestation)
registerVerification(bytes32 uid, address sponsor, uint256 costPaid, uint8 level)

// Read a credential and pay the fee (distributes to sponsor + protocol)
readCredential(bytes32 uid) returns (bool valid, uint8 level, uint64 expiresAt)

// Free credential check for smart contract access control (no fee, no earnings)
checkCredentialFree(bytes32 uid) returns (bool valid, uint8 level, uint64 expiresAt)

// Claim accumulated sponsor earnings
claimEarnings()

// Check sponsor info for an attestation
getSponsorInfo(bytes32 uid) returns (address, uint256, uint256, uint256, bool, uint256)
```

### Query Example (ethers.js)

```typescript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
const registry = new ethers.Contract(KYH_REGISTRY_ADDRESS, KYH_ABI, provider);

// Free check (for smart contracts doing access control)
const [valid, level, expiresAt] = await registry.checkCredentialFree(attestationUID);
console.log(`Valid: ${valid}, Level: ${level}, Expires: ${new Date(Number(expiresAt) * 1000)}`);

// Paid check (distributes earnings)
const signer = new ethers.Wallet(privateKey, provider);
const registryWithSigner = registry.connect(signer);
// First approve cUSD spend
await cusdContract.connect(signer).approve(KYH_REGISTRY_ADDRESS, readFee);
// Then read
await registryWithSigner.readCredential(attestationUID);
```
