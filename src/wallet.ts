import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_FAUCET_CHAIN_RPC_URL
);
const wallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY!, provider);

export { provider, wallet };
