import { Box, Center, HStack, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Heading, Input } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Countdown from "react-countdown";

export default function Home() {
  const { user } = useUser();

  const [address, setAddress] = useState<string>("");
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [timeout, setTimeout] = useState<number>(0);

  useEffect(() => {
    setIsValidAddress(ethers.isAddress(address));
  }, [address]);

  const sendGetTokenRq = async () => {
    const response = await fetch(`/api/faucet/get?address=${address}`, {
      method: "POST",
    });
    const data = await response.json();
    console.log(data);

    if (response.status != 200) {
      alert(data.error);
      setTimeout(data.timeout * 1000);
      return;
    }

    setTxHash(data.txHash);
    setTimeout(data.timeout * 1000);
  };

  const addTokenToMetamask = async () => {
    if (typeof (window as any).ethereum === "undefined") {
      console.log("MetaMask is installed!");
    }

    const response = await fetch(`/api/faucet/token`, {
      method: "POST",
    });

    const data = await response.json();
    const ethereum = (window as any).ethereum;
    await ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: data.tokenAddress,
          symbol: "FakeUSD",
          decimals: 18,
        },
      },
    });
  };

  return (
    <Box textAlign="center" fontSize="xl">
      <Center h="100vh">
        <VStack spacing={8}>
          <Heading as="h1" size="2xl">
            Fluence faucet
          </Heading>

          {!user ? (
            <Button
              size={"lg"}
              colorScheme="blue"
              onClick={() => window.open("/api/auth/login", "_self")}
            >
              Login
            </Button>
          ) : (
            <>
              <Input
                placeholder="address"
                width="500px"
                isInvalid={address.length > 0 && !isValidAddress}
                onChange={(e) => setAddress(e.target.value)}
              />
              {timeout > Date.now() ? (
                <>
                  <Text>You can receive tokens again after: </Text>
                  <Countdown onComplete={() => setTimeout(0)} date={timeout} />
                </>
              ) : (
                <></>
              )}

              {txHash ? (
                <Text fontSize="md">Transaction hash: {txHash}</Text>
              ) : (
                <></>
              )}
              <HStack spacing={8}>
                <Button
                  size={"lg"}
                  colorScheme="blue"
                  isDisabled={
                    address.length == 0 || !isValidAddress || timeout != 0
                  }
                  onClick={() => sendGetTokenRq()}
                >
                  Get $FakeUSD
                </Button>

                <Button
                  size={"lg"}
                  colorScheme="blue"
                  onClick={() => addTokenToMetamask()}
                >
                  Add token to metamask
                </Button>

                <Button
                  size={"lg"}
                  colorScheme="blue"
                  onClick={() => window.open("/api/auth/logout", "_self")}
                >
                  Logout
                </Button>
              </HStack>
            </>
          )}
        </VStack>
      </Center>
    </Box>
  );
}
