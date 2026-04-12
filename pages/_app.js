import "../styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <main>
        <Head>
        <title>SP Portal</title>
        <link rel="icon" sizes="25x25" href="/logo-sp.jpeg" />
      </Head>
      <Component {...pageProps} />
    </main>
  );
}