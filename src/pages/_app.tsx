import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import Countly from "countly-sdk-web";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    (window as any).Countly = Countly;
    Countly.init({
      app_key: "be868bb6ca20aa725aba9a757e8eebb3ae05fb82",
      url: "https://countly.fluence.dev/",
    });
    Countly.q.push(["track_sessions"]);
    Countly.q.push(["track_pageview"]);
  }, []);

  return (
    <ChakraProvider>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </ChakraProvider>
  );
}
