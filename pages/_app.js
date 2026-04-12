import "../styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <main>
        <Head>
            <meta name="google-site-verification" content="google87adc8f0f582e95a.html" />
        <title>SP Portal</title>
        <link rel="icon" sizes="25x25" href="/logo-sp.jpeg" />
      </Head>
      <Component {...pageProps} />
    </main>
  );
}