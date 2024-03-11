// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { getLastTimeByUser, setLastTimestampToUser } from "@/db";
import { faucetAbi } from "@/web3";
import { BALANCE_OF_SELECTOR, provider, wallet } from "@/wallet";
import { INSUFFICIENT_FLT_ERROR, INSUFFICIENT_USD_ERROR } from "@/common";

const FAUCET_TIMEOUT = Number(process.env.FAUCET_TIMEOUT!);
const FAUCET_USD_VALUE = ethers.parseUnits(process.env.FAUCET_USD_VALUE!, 6); // TODO fetch or set in env
const FAUCET_FLT_VALUE = ethers.parseEther(process.env.FAUCET_FLT_VALUE!);
const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS!;

type PostTokens = {
  txHash: string;
  error: string;
  timeout: number;
};

let usdTokenAddress = '';
const getUsdTokenAddress = async (): Promise<string> => {
  if (!usdTokenAddress) {
    const usdToken = await wallet.call({
      to: FAUCET_ADDRESS,
      data: faucetAbi.encodeFunctionData("usdToken", []),
    });
    if (usdToken === "0x") {
      throw new Error("Failed to get tUSDC token address");
    }
    usdTokenAddress = (new ethers.AbiCoder).decode(["address"], usdToken)[0];
  }
  return usdTokenAddress;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostTokens>
) {
  try {
    const session = await getSession(req, res);
    const email = session!.user.email;
    const address: string = req.query.address as string;

    const lastTimestamp = await getLastTimeByUser(email, "testnet");
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

    const balance = await provider.getBalance(address);
    const usdBalance = await wallet.call({
      to: await getUsdTokenAddress(),
      data: BALANCE_OF_SELECTOR + (new ethers.AbiCoder).encode(["address"], [address]).slice(2),
    });

    if (BigInt(usdBalance) < FAUCET_USD_VALUE) {
      res.status(403).json({
        txHash: "",
        error: INSUFFICIENT_USD_ERROR,
        timeout: 0,
      });
      return;
    }

    if (balance < FAUCET_FLT_VALUE) {
      res.status(403).json({
        txHash: "",
        error: INSUFFICIENT_FLT_ERROR,
        timeout: 0,
      });
      return;
    }

    const tx = await wallet.sendTransaction({
      to: FAUCET_ADDRESS,
      data: faucetAbi.encodeFunctionData("multicall", [
        [
          faucetAbi.encodeFunctionData("sendUSD", [address, FAUCET_USD_VALUE]),
          faucetAbi.encodeFunctionData("sendFLT", [address, FAUCET_FLT_VALUE]),
        ],
      ]),
    });

    await setLastTimestampToUser(email, "testnet", currentTimestamp);
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
