import { Button } from "@chakra-ui/button";
import { Tooltip } from '@chakra-ui/react'
import { ethers } from "ethers";
import { faucetAbi } from "../../web3";
import {sendGetArtifactsRq} from "@/pages/components/backendApi";


// Did some metamask related and backend related checks.
//  Returns ethers.JsonRpcProvider, window.ethereum (metamask).
async function _returnProvidersAndArtifacts() {
  if (typeof (window as any).ethereum === "undefined") {
      console.log("MetaMask is installed!");
    }
    const ethereum = (window as any).ethereum;
    const artifacts = await sendGetArtifactsRq()

    if (!artifacts) {
      const _msg = "No info about contract artifacts from the backend!"
      alert(_msg)
      throw Error(_msg)
    }
    const connectedNetwork = ethereum.networkVersion
    const faucetNetwork = artifacts.chainId.toString()
    if (faucetNetwork !== connectedNetwork) {
      const _msg = "Your metamask connected to the network ID: " + connectedNetwork + "Faucet use " + faucetNetwork + " instead."
      alert(_msg)
      throw Error(_msg)
    }
    const contractAddress = artifacts.contractAddress

    const provider = new ethers.BrowserProvider(ethereum);
    return {provider, ethereum, contractAddress}
}

export default function AddTokensToWallet() {
  const addUSDToken = async () => {
    const {provider, ethereum, contractAddress} = await _returnProvidersAndArtifacts();

    const usdAddress = await provider.call({
      to: contractAddress,
      data: faucetAbi.encodeFunctionData("usdToken"),
    });

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
    const {provider, ethereum, contractAddress} = await _returnProvidersAndArtifacts();

    const fltAddress = await provider.call({
      to: contractAddress,
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
      <Tooltip hasArrow label='Populate your Metamask with token name.'>
        <Button size={"lg"} colorScheme="blue" onClick={() => addUSDToken()} >
          Import USD to Metamask
        </Button>
      </Tooltip>
      <Tooltip hasArrow label='Populate your Metamask with token name.'>
        <Button size={"lg"} colorScheme="blue" onClick={() => addFLTToken()}>
          Import FLT to Metamask
        </Button>
      </Tooltip>
    </>
  );
}

export { AddTokensToWallet };
