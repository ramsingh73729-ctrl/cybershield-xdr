// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal append-only evidence anchor for CyberShield XDR.
/// Deploy behind a multisig and restrict verifier rotation in production.
contract AuditLedger {
    struct ScanReport { bytes32 reportHash; uint64 timestamp; bytes16 projectId; address verifier; }

    address public owner;
    mapping(address => bool) public verifiers;
    mapping(bytes32 => ScanReport) public reports;

    event ScanReportAnchored(bytes32 indexed reportHash, bytes16 indexed projectId, uint64 timestamp, address indexed verifier);
    event DomainOwnershipVerified(bytes32 indexed domainHash, bytes16 indexed projectId, address indexed verifier, uint64 timestamp);
    event CriticalRemediationRecorded(bytes32 indexed incidentHash, bytes32 indexed reportHash, address indexed verifier, uint64 timestamp);

    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }
    modifier onlyVerifier() { require(verifiers[msg.sender], "not verifier"); _; }

    constructor() { owner = msg.sender; verifiers[msg.sender] = true; }
    function setVerifier(address verifier, bool allowed) external onlyOwner { verifiers[verifier] = allowed; }

    function anchorScanReport(bytes32 reportHash, bytes16 projectId) external onlyVerifier {
        require(reports[reportHash].timestamp == 0, "report already anchored");
        reports[reportHash] = ScanReport(reportHash, uint64(block.timestamp), projectId, msg.sender);
        emit ScanReportAnchored(reportHash, projectId, uint64(block.timestamp), msg.sender);
    }

    function recordDomainProof(bytes32 domainHash, bytes16 projectId) external onlyVerifier {
        emit DomainOwnershipVerified(domainHash, projectId, msg.sender, uint64(block.timestamp));
    }

    function recordCriticalRemediation(bytes32 incidentHash, bytes32 reportHash) external onlyVerifier {
        require(reports[reportHash].timestamp != 0, "report not anchored");
        emit CriticalRemediationRecorded(incidentHash, reportHash, msg.sender, uint64(block.timestamp));
    }
}
