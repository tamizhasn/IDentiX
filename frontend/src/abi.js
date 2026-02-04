export const CONTRACT_ADDRESS = "0x6Cd4fd270f2672f543Bfe3A3A354ad2B9E80Baf3";

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