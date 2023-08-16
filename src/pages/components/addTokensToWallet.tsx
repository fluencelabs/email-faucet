import { Button } from "@chakra-ui/button";
import { ethers } from "ethers";
import { faucetAbi } from "../../web3";

const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS!;
const FAUCET_CHAIN_RPC_URL = process.env.NEXT_PUBLIC_FAUCET_CHAIN_RPC_URL;

const provider = new ethers.JsonRpcProvider(FAUCET_CHAIN_RPC_URL);
export default function AddTokensToWallet() {
  const addUSDToken = async () => {
    if (typeof (window as any).ethereum === "undefined") {
      console.log("MetaMask is installed!");
    }

    const usdAddress = await provider.call({
      to: FAUCET_ADDRESS,
      data: faucetAbi.encodeFunctionData("usdToken"),
    });

    const ethereum = (window as any).ethereum;
    await ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: "0x" + usdAddress.substring(26),
          symbol: `tUSD`,
          decimals: 18,
        },
      },
    });
  };

  const addFLTToken = async () => {
    if (typeof (window as any).ethereum === "undefined") {
      console.log("MetaMask is installed!");
    }

    const ethereum = (window as any).ethereum;

    const fltAddress = await provider.call({
      to: FAUCET_ADDRESS,
      data: faucetAbi.encodeFunctionData("fluenceToken"),
    });

    await ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: "0x" + fltAddress.substring(26),
          symbol: `tFLT`,
          decimals: 18,
        },
      },
    });
  };

  return (
    <>
      <Button size={"lg"} colorScheme="blue" onClick={() => addUSDToken()}>
        Add test USD to metamask
      </Button>
      <Button size={"lg"} colorScheme="blue" onClick={() => addFLTToken()}>
        Add test FLT to metamask
      </Button>
    </>
  );
}

export { AddTokensToWallet };
