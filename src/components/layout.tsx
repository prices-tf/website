import Head from 'next/head';
import { ReactNode } from 'react';

import Footer from './footer';
import Navbar from './navbar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  );
}
