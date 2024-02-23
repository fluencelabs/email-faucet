// Ethereum is from windows (metamask engine).
export async function switchChain() {
    const ethereum = (window as any).ethereum;
    console.log("Switching...")
    const chainId = '0x' + parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '0').toString(16);
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
                chainName: process.env.NEXT_PUBLIC_CHAIN_NAME,
                rpcUrls: [process.env.NEXT_PUBLIC_FAUCET_CHAIN_RPC_URL],
                nativeCurrency: {
                  name: process.env.NEXT_PUBLIC_NATIVE_CURRENCY,
                  symbol: process.env.NEXT_PUBLIC_NATIVE_CURRENCY,
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.log(`Error on adding ${process.env.NEXT_PUBLIC_CHAIN_NAME} chain.`);
        }
      } else {
        // TODO: handle other "switch" errors
        console.error(switchError);
      }
    }
}
