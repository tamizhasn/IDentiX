import { ethers } from "ethers";
import fs from "fs";
import "dotenv/config";

const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const artifact = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/Identix.sol/Identix.json",
      "utf8"
    )
  );

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("✅ Counter deployed to:", await contract.getAddress());
}

main().catch(console.error);
