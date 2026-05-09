import "../styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <main>
        <Head>
            <meta name="google-site-verification" content="yLlKvA-YZ6bIEcgI6CA4f1qCPrZ6SGWzRl5TEfz17fk" />
        <title>SP Portal</title>
        <link rel="icon" sizes="25x25" href="/logo-sp.jpeg" />

        <meta
    name="description"
    content="SP Architects & Constructions - villa design, floor plans, construction services."
  />

  <meta
    name="keywords"
    content="architecture, villa design, construction, SP Architects"
  />
      </Head>
      <Component {...pageProps} />
    </main>
  );
}