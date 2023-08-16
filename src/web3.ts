import { Interface, ethers } from "ethers";

const faucetAbi = new Interface([
  "function usdToken() view returns (address)",
  "function fluenceToken() view returns (address)",
  "function multicall(bytes[] calldata data) returns (bytes[] memory results)",
  "function sendUSD(address addr, uint256 value)",
  "function sendFLT(address addr, uint256 value)",
]);

export { faucetAbi };
