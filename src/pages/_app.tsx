// src/pages/_app.tsx
import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import { NextUIProvider } from '@nextui-org/react';
import '../app/globals.css';


function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <NextUIProvider>
        <Component {...pageProps} />
      </NextUIProvider>
    </SessionProvider>
  );
}

export default MyApp;
