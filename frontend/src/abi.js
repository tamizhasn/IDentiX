export const CONTRACT_ADDRESS = "0x31d72eAf17ed86e830fCFF5b5378AD2Fe9B1279a";

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "studentIdHash", "type": "bytes32" },
      { "internalType": "bytes32", "name": "dataHash", "type": "bytes32" }
    ],
    "name": "issueCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "studentIdHash", "type": "bytes32" },
      { "internalType": "uint256", "name": "credentialId", "type": "uint256" },
      { "internalType": "bytes32", "name": "dataHash", "type": "bytes32" }
    ],
    "name": "verifyCredential",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "studentIdHash", "type": "bytes32" },
      { "internalType": "uint256", "name": "credentialId", "type": "uint256" }
    ],
    "name": "revokeCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];