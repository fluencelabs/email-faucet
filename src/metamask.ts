// Ethereum is from windows (metamask engine).
export async function switchChainToMumbai(ethereum: any) {
  console.log("Switch to chainId 80001...")
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13881' }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '80001',
                chainName: 'Matic Mumbai Testnet',
                rpcUrls: ['https://mumbai.polygonscan.com/'],
              },
            ],
          });
        } catch (addError) {
          console.log('Error on adding Mumbai chain.')
        }
      }
      // TODO: handle other "switch" errors
    }
}
