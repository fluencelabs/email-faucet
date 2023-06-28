import { Button } from "@chakra-ui/button";
import {
  ChainNetwork,
  DEAL_CONFIG,
} from "@fluencelabs/deal-aurora/dist/client/config";

export default function AddTokensToWallet(props: { network: ChainNetwork }) {
  const addUSDToken = async () => {
    if (typeof (window as any).ethereum === "undefined") {
      console.log("MetaMask is installed!");
    }

    const ethereum = (window as any).ethereum;
    await ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: DEAL_CONFIG[props.network].testUSDToken,
          symbol: `${props.network}USD`,
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
    await ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: DEAL_CONFIG[props.network].fltToken,
          symbol: `${props.network}FLT`,
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
