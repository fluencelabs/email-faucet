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
import { ChainNetwork } from "@fluencelabs/deal-aurora/dist/client/config";

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
  const [network, setNetwork] = useState<ChainNetwork>("kras");
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const [timeout, setTimeout] = useState<Record<ChainNetwork, number>>({
    kras: 0,
    stage: 0,
    testnet: 0,
    local: 0,
  });
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsValidAddress(ethers.isAddress(address));
  }, [address]);

  const sendGetTokenRq = async () => {
    const response = await fetch(
      `/api/faucet/get?address=${address}&network=${network}`,
      {
        method: "POST",
      }
    );
    const data = await response.json();
    console.log(data);

    const newTimeout: Record<string, number> = {
      ...timeout,
    };
    newTimeout[network] = data.timeout * 1000;
    setTimeout(newTimeout);

    if (response.status != 200) {
      alert(data.error);
      return;
    }

    setTxHash(data.txHash);
  };

  return (
    <>
      <VStack position={"absolute"} top={"50px"} width={"100%"}>
        <Text fontSize="md">Select network:</Text>
        <Select
          width={"20%"}
          onChange={(e) => setNetwork(e.target.value as ChainNetwork)}
          defaultValue={network}
        >
          <option value="kras">Kras</option>
          <option value="stage">Stage</option>
          <option value="testnet">Testnet</option>
        </Select>
      </VStack>
      <Input
        placeholder="address"
        width="500px"
        isInvalid={address.length > 0 && !isValidAddress}
        onChange={(e) => setAddress(e.target.value)}
      />
      {timeout![network] > Date.now() ? (
        <>
          <Text>You can receive tokens again after: </Text>
          <Countdown
            onComplete={() => {
              const newTimeout: Record<string, number> = {
                ...timeout,
              };
              newTimeout[network] = 0;
              setTimeout(newTimeout);
            }}
            date={timeout[network]}
          />
        </>
      ) : (
        <></>
      )}
      <HStack spacing={8}>
        <Button
          size={"lg"}
          colorScheme="blue"
          isDisabled={
            address.length == 0 || !isValidAddress || timeout[network] != 0
          }
          onClick={() => sendGetTokenRq()}
        >
          Get testnet USD & tFLT
        </Button>

        <AddTokensToWallet network={network} />

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
