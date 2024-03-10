import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  process.env.FAUCET_CHAIN_RPC_URL
);
const wallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY!, provider);

export const BALANCE_OF_SELECTOR = "0x70a08231";

export { provider, wallet };
