import { Interface, ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.FAUCET_CHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY!, provider);

const faucetAbi = new Interface([
  "function usdToken() view returns (address)",
  "function fluenceToken() view returns (address)",
  "function multicall(bytes[] calldata data) returns (bytes[] memory results)",
  "function sendUSD(address addr, uint256 value)",
  "function sendFLT(address addr, uint256 value)",
]);

export { provider, wallet, faucetAbi };
