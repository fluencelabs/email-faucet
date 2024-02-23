import { Box, Center, HStack, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Tooltip } from "@chakra-ui/react";
import { Heading, Input, Select } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Countdown from "react-countdown";
import Head from "next/head";
import { Login } from "./components/login";
import { AddTokensToWallet } from "./components/addTokensToWallet";
import { AuthContainer } from "./components/authContainer";
import { sendPostTokenRq } from "@/backendApi";

export default function Home() {
  return (
    <>
      <Head>
        <title>Fluence Faucet</title>
      </Head>
      <Box textAlign="center" fontSize="xl">
        <Center h="100vh">
          <VStack spacing={8}>
            <Heading as="h1" size="2xl">
              Fluence Faucet
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

  const [receivePending, setReceivePending] = useState(false);

  useEffect(() => {
    setIsValidAddress(ethers.isAddress(address));
  }, [address]);

  const sendPostTokenRqButton = async () => {
    setReceivePending(true);
    try {
      const data = await sendPostTokenRq(address);

      console.log(data);
      console.log(Math.floor(new Date().getTime() / 1000));
      // @ts-ignore
      setTimeout(data.timeout * 1000);
      // @ts-ignore
      setTxHash(data.txHash);

    } finally {
      setReceivePending(false);
    }
  };

  return (
    <>
      <Input
        placeholder="address"
        width="500px"
        isInvalid={address.length > 0 && !isValidAddress}
        onChange={(e) => setAddress(e.target.value)}
      />
      {timeout > Math.floor(new Date().getTime() / 1000) ? (
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
        <Tooltip
          hasArrow
          label="Request Faucet to send both tokens: USD and FLT to your account on the supported chain."
        >
          <Button
            size={"lg"}
            colorScheme="blue"
            isDisabled={address.length == 0 || !isValidAddress || timeout != 0 || receivePending}
            onClick={() => sendPostTokenRqButton()}
          >
            Receive {process.env.NEXT_PUBLIC_NATIVE_CURRENCY} & tUSD
          </Button>
        </Tooltip>

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
