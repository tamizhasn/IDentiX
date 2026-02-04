// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Identix {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    struct Credential {
        address issuer;
        bytes32 dataHash;
        bool valid;
        uint256 issuedAt;
    }

    // studentIdHash => credentialId => Credential
    mapping(bytes32 => mapping(uint256 => Credential)) private credentials;
    mapping(bytes32 => uint256) public credentialCount;

    event CredentialIssued(bytes32 indexed studentIdHash, uint256 credentialId);
    event CredentialRevoked(bytes32 indexed studentIdHash, uint256 credentialId);

    /// Issue credential
    function issueCredential(
        bytes32 studentIdHash,
        bytes32 dataHash
    ) external {
        uint256 id = credentialCount[studentIdHash];

        credentials[studentIdHash][id] = Credential({
            issuer: msg.sender,
            dataHash: dataHash,
            valid: true,
            issuedAt: block.timestamp
        });

        credentialCount[studentIdHash]++;
        emit CredentialIssued(studentIdHash, id);
    }

    /// Verify credential
    function verifyCredential(
        bytes32 studentIdHash,
        uint256 credentialId,
        bytes32 dataHash
    ) external view returns (bool) {
        Credential memory cred = credentials[studentIdHash][credentialId];
        return cred.valid && cred.dataHash == dataHash;
    }

    /// Revoke credential
    function revokeCredential(
        bytes32 studentIdHash,
        uint256 credentialId
    ) external {
        Credential storage cred = credentials[studentIdHash][credentialId];
        require(msg.sender == cred.issuer || msg.sender == owner, "Not allowed");
        cred.valid = false;
        emit CredentialRevoked(studentIdHash, credentialId);
    }
}
