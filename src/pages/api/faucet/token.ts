// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { getLastTimeByUser, setLastTimestampToUser } from "@/db";
import { faucetAbi, FAUCET_ADDRESS, wallet } from "@/web3";

type GetTokenRes = {
  fltTokenAddress: string;
  usdTokenAddress: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetTokenRes>
) {
  const usdTokenAddress = await wallet.call({
    to: FAUCET_ADDRESS,
    data: faucetAbi.encodeFunctionData("usdToken"),
    value: 0,
  });

  const fltTokenAddress = await wallet.call({
    to: FAUCET_ADDRESS,
    data: faucetAbi.encodeFunctionData("fluenceToken"),
    value: 0,
  });

  console.log("usdTokenAddress", usdTokenAddress);
  console.log("fltTokenAddress", fltTokenAddress);

  res.status(200).json({
    usdTokenAddress: ethers.utils.hexStripZeros(usdTokenAddress),
    fltTokenAddress: ethers.utils.hexStripZeros(fltTokenAddress),
  });
}
