import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>
          Prices.tf - Automatically generated prices for Team Fortress 2
        </title>
        <meta
          name="description"
          content="
          Prices.tf
          Automatically and reliably pricing Team Fortress 2 items"
        />
      </Head>
      <div className="container mx-auto mt-10">
        <div className="text-center">
          <h1 className="text-xl">Nothing here yet</h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
