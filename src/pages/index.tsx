import { Box, Center, HStack, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Heading, Input, Select } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Countdown from "react-countdown";
import Head from "next/head";
import { Login } from "./components/login";
import { AddTokensToWallet } from "./components/addTokensToWallet";
import { AuthContainer } from "./components/authContainer";

export default function Home() {
  return (
    <>
      <Head>
        <title>Fluence Testnet Faucet</title>
      </Head>
      <Box textAlign="center" fontSize="xl">
        <Center h="100vh">
          <VStack spacing={8}>
            <Heading as="h1" size="2xl">
              Fluence Testnet Faucet
            </Heading>
            <AuthContainer beforeLogin={<Login />} afterLogin={<Faucet />} />
          </VStack>
        </Center>
      </Box>
    </>
  );
}

function Faucet() {
  const [address, setAddress] = useState<string>("");
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const [timeout, setTimeout] = useState<number>(0);

  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsValidAddress(ethers.isAddress(address));
  }, [address]);

  const sendGetTokenRq = async () => {
    const response = await fetch(`/api/faucet/get?address=${address}`, {
      method: "POST",
    });
    const data = await response.json();
    console.log(data);

    setTimeout(data.timeout * 1000);

    if (response.status != 200) {
      alert(data.error);
      return;
    }

    setTxHash(data.txHash);
  };

  return (
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
          <Countdown
            onComplete={() => {
              setTimeout(0);
            }}
            date={timeout}
          />
        </>
      ) : (
        <></>
      )}
      <HStack spacing={8}>
        <Button
          size={"lg"}
          colorScheme="blue"
          isDisabled={address.length == 0 || !isValidAddress || timeout != 0}
          onClick={() => sendGetTokenRq()}
        >
          Get testnet USD & tFLT
        </Button>

        <AddTokensToWallet />

        <Button
          size={"lg"}
          colorScheme="blue"
          onClick={() => window.open("/api/auth/logout", "_self")}
        >
          Logout
        </Button>
      </HStack>

      {txHash ? <Text fontSize="md">Transaction hash: {txHash}</Text> : <></>}
    </>
  );
}
