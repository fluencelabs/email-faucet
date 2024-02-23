import { sendGetArtifactsRq } from "./backendApi";

// Ethereum is from windows (metamask engine).
export async function switchChain() {
    const ethereum = (window as any).ethereum;
    console.log("Switching...");
    const artifacts = await sendGetArtifactsRq();

    if (!artifacts) {
      const _msg = "No info about contract artifacts from the backend!"
      alert(_msg)
      throw Error(_msg)
    }
    const chainId = '0x' + parseInt(artifacts.chainId).toString(16);
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId,
                chainName: artifacts.chainName,
                rpcUrls: [artifacts.rpcUrl],
                nativeCurrency: {
                  name: artifacts.nativeTicker,
                  symbol: artifacts.nativeTicker,
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.log(`Error on adding ${artifacts.chainName} chain.`);
        }
      } else {
        // TODO: handle other "switch" errors
        console.error(switchError);
      }
    }
}
