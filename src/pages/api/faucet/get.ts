// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { getLastTimeByUser, setLastTimestampToUser } from "@/db";
import { faucetAbi, FAUCET_ADDRESS, wallet } from "@/web3";

const FAUCET_TIMEOUT = Number(process.env.FAUCET_TIMEOUT!);
const FAUCET_VALUE = ethers.utils.parseEther(process.env.FAUCET_VALUE!);

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

    const lastTimestamp = await getLastTimeByUser(email);
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

    if (!ethers.utils.isAddress(address)) {
      res.status(404).json({
        txHash: "",
        error: "Invalid address",
        timeout: 0,
      });
      return;
    }

    const createReceipt = await wallet.sendTransaction({
      to: FAUCET_ADDRESS,
      data: faucetAbi.encodeFunctionData("sendUSD", [address, FAUCET_VALUE]),
      value: 0,
    });

    await setLastTimestampToUser(email, currentTimestamp);
    res.status(200).json({
      txHash: createReceipt.hash,
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
