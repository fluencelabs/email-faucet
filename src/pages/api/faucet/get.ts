// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { getLastTimeByUser, setLastTimestampToUser } from "@/db";
import { faucetAbi, wallet } from "@/web3";
import {
  ChainNetwork,
  DEAL_CONFIG,
} from "@fluencelabs/deal-aurora/dist/client/config";

const FAUCET_TIMEOUT = Number(process.env.FAUCET_TIMEOUT!);
const FAUCET_USD_VALUE = ethers.parseEther(process.env.FAUCET_USD_VALUE!);
const FAUCET_FLT_VALUE = ethers.parseEther(process.env.FAUCET_FLT_VALUE!);

type GetTokenRes = {
  txHash: string;
  error: string;
  timeout: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetTokenRes>
) {
  try {
    const session = await getSession(req, res);
    const email = session!.user.email;
    const address: string = req.query.address as string;
    const network: ChainNetwork = req.query.network as ChainNetwork;

    const lastTimestamp = await getLastTimeByUser(email, network);
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);

    if (lastTimestamp + FAUCET_TIMEOUT > currentTimestamp) {
      const left = lastTimestamp + FAUCET_TIMEOUT - currentTimestamp;
      res.status(403).json({
        txHash: "",
        error: `Wait for timeout (${left} seconds)`,
        timeout: lastTimestamp + FAUCET_TIMEOUT,
      });
      return;
    }

    if (!ethers.isAddress(address)) {
      res.status(404).json({
        txHash: "",
        error: "Invalid address",
        timeout: 0,
      });
      return;
    }

    const tx = await wallet.sendTransaction({
      to: DEAL_CONFIG[network].faucet,
      data: faucetAbi.encodeFunctionData("multicall", [
        [
          faucetAbi.encodeFunctionData("sendUSD", [address, FAUCET_USD_VALUE]),
          faucetAbi.encodeFunctionData("sendFLT", [address, FAUCET_FLT_VALUE]),
        ],
      ]),
    });

    await setLastTimestampToUser(email, network, currentTimestamp);
    res.status(200).json({
      txHash: tx.hash,
      error: "",
      timeout: currentTimestamp + FAUCET_TIMEOUT,
    });
  } catch (error) {
    console.log(error);
    res.status(500).end({
      txHash: "",
      error: "Internal server error",
    });
  }
}
