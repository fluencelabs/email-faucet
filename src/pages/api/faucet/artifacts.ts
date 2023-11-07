import type { NextApiRequest, NextApiResponse } from "next";

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID!;
const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS!;

type GetArtifactsRes = {
  chainId: string;
  contractAddress: string;
};

// TODO: deprecate the handler: use in-frontend mapping instead.
// Currently, this handler used for frontend inject meta of faucet tokens.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetArtifactsRes>
) {
  try {
    res.status(200).json({
      chainId: CHAIN_ID,
      contractAddress: FAUCET_ADDRESS,
    });
  } catch (error) {
    console.log(error);
    res.status(500).end({
      txHash: "",
      error: "Internal server error",
    });
  }
}
