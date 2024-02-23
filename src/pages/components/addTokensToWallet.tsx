import { Button } from "@chakra-ui/button";
import { Tooltip } from '@chakra-ui/react'
import { ethers } from "ethers";
import { faucetAbi } from "../../web3";
import { sendGetArtifactsRq } from "../../backendApi";
import { switchChain } from "@/metamask";


// Did some metamask related and backend related checks.
//  Returns ethers.JsonRpcProvider, window.ethereum (metamask).
async function _returnProvidersAndArtifacts() {
  if (typeof (window as any).ethereum === "undefined") {
      console.log("MetaMask is installed!");
    }
    const ethereum = (window as any).ethereum;
    await switchChain();

    const artifacts = await sendGetArtifactsRq();

    if (!artifacts) {
      const _msg = "No info about contract artifacts from the backend!"
      alert(_msg)
      throw Error(_msg)
    }
    const contractAddress = artifacts.contractAddress;

    const provider = new ethers.BrowserProvider(ethereum);
    return { provider, ethereum, contractAddress };
}

export default function AddTokensToWallet({ chainName }: { chainName: string }) {
  const addUSDToken = async () => {
    const {provider, ethereum, contractAddress} = await _returnProvidersAndArtifacts();

    const usdAddressRaw = await provider.call({
      to: contractAddress,
      data: faucetAbi.encodeFunctionData("usdToken"),
    });

    const usdAddress = "0x" + usdAddressRaw.substring(26);

    let decimals = 6;
    let symbol = "tUSDC"; // shall be same as in token
    try {
      const decimalsRaw = await provider.call({
        to: usdAddress,
        data: "0x313ce567", // decimals()
      });
      decimals = parseInt(decimalsRaw);

      const symbolRaw = await provider.call({
        to: usdAddress,
        data: "0x95d89b41", // symbol()
      });
      symbol = (new ethers.AbiCoder).decode(["string"], symbolRaw).toString();
    } catch (e: any) {
      console.error(e);
    }

    await ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: usdAddress,
          symbol,
          decimals,
        },
      },
    });
  };

  return (
    <>
      <Tooltip hasArrow label={`Switch to ${chainName} in your Metamask`}>
        <Button size={"lg"} colorScheme="blue" onClick={() => switchChain()} >
          Switch chain
        </Button>
      </Tooltip>
      <Tooltip hasArrow label='Populate your Metamask with test tUSDC token'>
        <Button size={"lg"} colorScheme="blue" onClick={() => addUSDToken()} >
          Import tUSDC to Metamask
        </Button>
      </Tooltip>
    </>
  );
}

export { AddTokensToWallet };
