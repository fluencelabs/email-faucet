import { Box, Center, HStack, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Spinner, Tooltip } from "@chakra-ui/react";
import { Heading, Input, Select } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import { ethers } from "ethers";
import Countdown from "react-countdown";
import Head from "next/head";
import { Login } from "./components/login";
import { AddTokensToWallet } from "./components/addTokensToWallet";
import { AuthContainer } from "./components/authContainer";
import { sendGetArtifactsRq, sendPostTokenRq } from "@/backendApi";
import { Artifacts } from "./api/faucet/artifacts";
import { INSUFFICIENT_FLT_ERROR, INSUFFICIENT_USD_ERROR } from "@/common";

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
  const [artifacts, setArtifacts] = useState<Artifacts | null>(null);

  const [error, setError] = useState<ReactNode>(<></>);

  useEffect(() => {
    sendGetArtifactsRq().then((_artifacts) => {
      setArtifacts(_artifacts);
    });
  }, []);

  useEffect(() => {
    setIsValidAddress(ethers.isAddress(address));
    setError('');
  }, [address]);

  const sendPostTokenRqButton = async () => {
    setError('');
    setReceivePending(true);
    try {
      const data = await sendPostTokenRq(address);

      console.log(data);
      console.log(Math.floor(new Date().getTime() / 1000));
      // @ts-ignore
      setTimeout(data.timeout * 1000);
      // @ts-ignore
      setTxHash(data.txHash);

    } catch (e: any) {
      if (e.message === INSUFFICIENT_FLT_ERROR || e.message === INSUFFICIENT_USD_ERROR) {
        setError(<>
          Sorry! Faucet has insufficient {e.message === INSUFFICIENT_FLT_ERROR ? 'tFLT' : 'tUSDC'} balance.
          Please contact administrators via <a style={{ color: 'blue' }} href="https://fluence.chat" target="_blank">
            fluence.chat
          </a>
        </>);
      } else {
        setError(e.message);
      }
    } finally {
      setReceivePending(false);
    }
  };

  return (
    <>
      {artifacts === null && <Spinner
        thickness='4px'
        speed='0.65s'
        emptyColor='gray.200'
        color='blue.500'
        size='xl'
        mb={10} mt={10}
      />}
      {artifacts && <>
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
            label={`Request Faucet to send both tokens: tUSDC and ${artifacts.nativeTicker} to your account on the supported chain.`}
          >
            <Button
              size={"lg"}
              colorScheme="blue"
              isDisabled={address.length == 0 || !isValidAddress || timeout != 0 || receivePending}
              onClick={() => sendPostTokenRqButton()}
            >
              Receive {artifacts.nativeTicker} & tUSDC
            </Button>
          </Tooltip>

          <AddTokensToWallet chainName={artifacts.chainName} />

          <Button
            size={"lg"}
            colorScheme="blue"
            onClick={() => window.open("/api/auth/logout", "_self")}
          >
            Logout
          </Button>
        </HStack>

        {txHash ? <Text fontSize="md">Transaction hash: {txHash}</Text> : <></>}
        {error && <Text fontSize="md" color="red">
          {error}
        </Text>}
      </>}
    </>
  );
}
