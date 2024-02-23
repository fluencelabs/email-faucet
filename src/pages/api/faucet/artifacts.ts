import type { NextApiRequest, NextApiResponse } from "next";

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID!;
const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS!;
const FAUCET_CHAIN_RPC_URL = process.env.NEXT_PUBLIC_FAUCET_CHAIN_RPC_URL!;
const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME!;
const BLOCK_EXPLORER = process.env.NEXT_PUBLIC_BLOCK_EXPLORER!;
const NATIVE_TICKER = process.env.NEXT_PUBLIC_NATIVE_CURRENCY!;

export type Artifacts = {
  chainId: string;
  contractAddress: string;
  rpcUrl: string;
  chainName: string;
  blockExplorer: string;
  nativeTicker: string;
};

// TODO: deprecate the handler: use in-frontend mapping instead.
// Currently, this handler used for frontend inject meta of faucet tokens.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Artifacts>
) {
  try {
    res.status(200).json({
      chainId: CHAIN_ID,
      contractAddress: FAUCET_ADDRESS,
      rpcUrl: FAUCET_CHAIN_RPC_URL,
      chainName: CHAIN_NAME,
      blockExplorer: BLOCK_EXPLORER,
      nativeTicker: NATIVE_TICKER,
    });
  } catch (error) {
    console.log(error);
    res.status(500).end({
      txHash: "",
      error: "Internal server error",
    });
  }
}
