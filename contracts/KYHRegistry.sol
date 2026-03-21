// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title KYHRegistry
 * @notice Know Your Human — self-funding credential layer on Celo
 *
 * The core economic innovation: agents pay once to verify a human.
 * That verification is recorded as an EAS attestation on Celo.
 * Subsequent agents pay a small read fee to check the credential.
 * The original sponsor (first verifier) earns back up to 2x their cost,
 * then continues earning 10% of read fees forever.
 *
 * This creates aligned incentives: the first agent to verify a human
 * is rewarded for taking the cost and risk, while all subsequent
 * agents get cheap access to trusted credentials.
 *
 * Sponsor earnings model:
 *   - Phase 1 (earned < 2x original cost): 40% of read fee → sponsor
 *   - Phase 2 (earned >= 2x original cost): 10% of read fee → sponsor (perpetual)
 *   - Remainder always goes to KYH protocol treasury
 */

/// @dev Minimal EAS interface for reading attestations
interface IEAS {
    struct Attestation {
        bytes32 uid;
        bytes32 schema;
        uint64 time;
        uint64 expirationTime;
        uint64 revocationTime;
        bytes32 refUID;
        address recipient;
        address attester;
        bool revocable;
        bytes data;
    }

    function getAttestation(bytes32 uid) external view returns (Attestation memory);
}

/// @dev Minimal ERC20 interface for cUSD payments
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract KYHRegistry {
    // ─── Storage ───────────────────────────────────────────────────────────────

    address public owner;
    address public easContract;
    bytes32 public schemaId;
    address public paymentToken;   // cUSD on Celo
    uint256 public readFee;        // in token units (6 decimals): 5000 = $0.005

    // Per-attestation sponsor tracking
    mapping(bytes32 => address)  public attestationSponsor;
    mapping(bytes32 => uint256)  public attestationOriginalCost;
    mapping(bytes32 => uint256)  public sponsorEarned;

    // Claimable earnings per sponsor address
    mapping(address => uint256)  public pendingEarnings;

    // Protocol treasury (accumulated non-sponsor fees)
    uint256 public protocolBalance;

    // ─── Events ────────────────────────────────────────────────────────────────

    event VerificationRegistered(
        bytes32 indexed uid,
        address indexed sponsor,
        uint256 cost,
        uint8   level
    );

    event CredentialRead(
        bytes32 indexed uid,
        address indexed reader,
        uint256 fee,
        uint256 sponsorShare,
        uint256 protocolShare
    );

    event EarningsClaimed(address indexed sponsor, uint256 amount);
    event ProtocolFeesWithdrawn(address indexed to, uint256 amount);
    event ReadFeeUpdated(uint256 oldFee, uint256 newFee);
    event SchemaUpdated(bytes32 oldSchema, bytes32 newSchema);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "KYHRegistry: not owner");
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────────────

    /**
     * @param _easContract  EAS contract on Celo (0x72E1d8ccf5299fb36fEfD8CC4394B8ef7e98Af92)
     * @param _schemaId     KYH schema UID (register via EAS SchemaRegistry first)
     * @param _paymentToken cUSD on Celo (0x765DE816845861e75A25fCA122bb6898B8B1282a)
     * @param _readFee      Fee in token units. E.g. 5000 = $0.005 cUSD (6 decimals)
     */
    constructor(
        address _easContract,
        bytes32 _schemaId,
        address _paymentToken,
        uint256 _readFee
    ) {
        owner        = msg.sender;
        easContract  = _easContract;
        schemaId     = _schemaId;
        paymentToken = _paymentToken;
        readFee      = _readFee;
    }

    // ─── Core Functions ────────────────────────────────────────────────────────

    /**
     * @notice Register a new verification. Called by KYH backend after issuing EAS attestation.
     * @param attestationUID  The EAS attestation UID returned from attest()
     * @param sponsor         The agent/dApp address that paid for verification
     * @param costPaid        Amount paid in payment token units
     * @param level           Verification level (1=Starter, 2=Basic, 3=Standard, 4=Enhanced)
     */
    function registerVerification(
        bytes32 attestationUID,
        address sponsor,
        uint256 costPaid,
        uint8   level
    ) external onlyOwner {
        require(attestationSponsor[attestationUID] == address(0), "KYHRegistry: already registered");
        require(sponsor != address(0), "KYHRegistry: zero sponsor");
        require(costPaid > 0, "KYHRegistry: zero cost");

        attestationSponsor[attestationUID]     = sponsor;
        attestationOriginalCost[attestationUID] = costPaid;

        emit VerificationRegistered(attestationUID, sponsor, costPaid, level);
    }

    /**
     * @notice Read a credential. Caller pays readFee in cUSD.
     *         Splits fee between sponsor (who originally verified this human)
     *         and KYH protocol treasury.
     *
     * @param attestationUID  The EAS attestation UID to check
     * @return valid          True if attestation exists, is not expired, and not revoked
     * @return level          Verification level decoded from attestation data
     * @return expiresAt      Expiry timestamp (unix seconds)
     */
    function readCredential(bytes32 attestationUID)
        external
        returns (bool valid, uint8 level, uint64 expiresAt)
    {
        // Collect read fee from caller
        require(
            IERC20(paymentToken).transferFrom(msg.sender, address(this), readFee),
            "KYHRegistry: fee transfer failed"
        );

        // Calculate sponsor/protocol split
        address sponsor      = attestationSponsor[attestationUID];
        uint256 sponsorShare = 0;

        if (sponsor != address(0)) {
            uint256 originalCost = attestationOriginalCost[attestationUID];
            uint256 earned       = sponsorEarned[attestationUID];
            uint256 cap          = originalCost * 2; // 2x recoup cap

            // 40% to sponsor until 2x recouped, then 10% perpetually
            uint256 sponsorRate  = (earned < cap) ? 40 : 10;
            sponsorShare         = (readFee * sponsorRate) / 100;

            sponsorEarned[attestationUID] += sponsorShare;
            pendingEarnings[sponsor]      += sponsorShare;
        }

        uint256 protocolShare = readFee - sponsorShare;
        protocolBalance      += protocolShare;

        // Fetch attestation from EAS
        IEAS.Attestation memory attestation = IEAS(easContract).getAttestation(attestationUID);

        // Validate: exists, correct schema, not revoked, not expired
        valid = (
            attestation.uid      != bytes32(0)    &&
            attestation.schema   == schemaId      &&
            attestation.revocationTime == 0       &&
            (attestation.expirationTime == 0 || attestation.expirationTime > block.timestamp)
        );

        expiresAt = attestation.expirationTime;

        // Decode level from first 32 bytes of attestation data
        // Schema: (uint8 level, string provider, bool demoMode)
        if (valid && attestation.data.length >= 32) {
            level = uint8(uint256(bytes32(attestation.data[0:32])));
        }

        emit CredentialRead(attestationUID, msg.sender, readFee, sponsorShare, protocolShare);

        return (valid, level, expiresAt);
    }

    /**
     * @notice Check credential without paying a fee (view function).
     *         Use this for free checks; does not distribute earnings.
     *         Intended for smart contracts doing access control.
     */
    function checkCredentialFree(bytes32 attestationUID)
        external
        view
        returns (bool valid, uint8 level, uint64 expiresAt)
    {
        IEAS.Attestation memory attestation = IEAS(easContract).getAttestation(attestationUID);

        valid = (
            attestation.uid      != bytes32(0)    &&
            attestation.schema   == schemaId      &&
            attestation.revocationTime == 0       &&
            (attestation.expirationTime == 0 || attestation.expirationTime > block.timestamp)
        );

        expiresAt = attestation.expirationTime;

        if (valid && attestation.data.length >= 32) {
            level = uint8(uint256(bytes32(attestation.data[0:32])));
        }
    }

    /**
     * @notice Claim accumulated sponsor earnings in cUSD.
     */
    function claimEarnings() external {
        uint256 amount = pendingEarnings[msg.sender];
        require(amount > 0, "KYHRegistry: nothing to claim");
        pendingEarnings[msg.sender] = 0;
        require(
            IERC20(paymentToken).transfer(msg.sender, amount),
            "KYHRegistry: claim transfer failed"
        );
        emit EarningsClaimed(msg.sender, amount);
    }

    /**
     * @notice Get sponsor info for a given attestation.
     */
    function getSponsorInfo(bytes32 attestationUID)
        external
        view
        returns (
            address sponsor,
            uint256 originalCost,
            uint256 earned,
            uint256 cap,
            bool    fullyRecouped,
            uint256 currentRate
        )
    {
        sponsor      = attestationSponsor[attestationUID];
        originalCost = attestationOriginalCost[attestationUID];
        earned       = sponsorEarned[attestationUID];
        cap          = originalCost * 2;
        fullyRecouped = earned >= cap;
        currentRate  = fullyRecouped ? 10 : 40;
    }

    // ─── Owner Functions ───────────────────────────────────────────────────────

    /// @notice Withdraw accumulated protocol fees
    function withdrawProtocolFees(address to, uint256 amount) external onlyOwner {
        require(amount <= protocolBalance, "KYHRegistry: insufficient balance");
        protocolBalance -= amount;
        require(IERC20(paymentToken).transfer(to, amount), "KYHRegistry: withdraw failed");
        emit ProtocolFeesWithdrawn(to, amount);
    }

    /// @notice Update the read fee
    function updateReadFee(uint256 newFee) external onlyOwner {
        emit ReadFeeUpdated(readFee, newFee);
        readFee = newFee;
    }

    /// @notice Update the EAS schema ID (e.g. after re-registration)
    function updateSchema(bytes32 newSchemaId) external onlyOwner {
        emit SchemaUpdated(schemaId, newSchemaId);
        schemaId = newSchemaId;
    }

    /// @notice Transfer ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "KYHRegistry: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
