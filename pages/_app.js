import "../styles/globals.css";
import Head from "next/head";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  return (
    <main className={inter.className}>
        <Head>
        <title>SP Portal</title>
        <link rel="icon" sizes="25x25" href="/logo-sp.jpeg" />
      </Head>
      <Component {...pageProps} />
    </main>
  );
}