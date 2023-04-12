import { ethers } from "ethers";
import { Interface } from "ethers/lib/utils";

const FAUCET_ADDRESS = process.env.FAUCET_CONTRACT_ADDRESS!;
const provider = new ethers.providers.JsonRpcProvider(
  process.env.FAUCET_CHAIN_RPC_URL
);
const wallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY!, provider);

const faucetAbi = new Interface([
  "function usdToken() view returns (address)",
  "function sendUSD(address addr, uint256 value)",
  "function lastTransactionTimestamp(address addr) view returns (uint256)",
]);

export { provider, wallet, faucetAbi, FAUCET_ADDRESS };
