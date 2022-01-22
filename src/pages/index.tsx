import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReactTimeago from 'react-timeago';
import useWebSocket from 'react-use-websocket';

import {
  AuthMessage,
  PriceChangedMessage,
  WebsocketMessage,
} from '../shared/interfaces/ws.interface';
import { refreshAccessToken } from '../utils/api';

const Home: NextPage = () => {
  const [priceChangeHistory, setPriceChangeHistory] = useState<
    PriceChangedMessage[]
  >([]);
  const { sendMessage, lastMessage } = useWebSocket('wss://ws.prices.tf');

  useEffect(() => {
    if (lastMessage !== null) {
      let parsed: WebsocketMessage<string, unknown> | null = null;
      try {
        parsed = JSON.parse(lastMessage.data);
      } catch (err) {
        // ignore error
      }

      if (parsed === null) {
        return;
      }

      if (parsed.type === 'AUTH_REQUIRED') {
        refreshAccessToken().then((token) => {
          localStorage.setItem('token', token);
          const message: AuthMessage = {
            type: 'AUTH',
            data: {
              accessToken: token,
            },
          };

          sendMessage(JSON.stringify(message));
        });
      } else if (parsed.type === 'PRICE_CHANGED') {
        setPriceChangeHistory((prev) => {
          const copy = prev.concat([]);

          copy.unshift(parsed as PriceChangedMessage);

          if (copy.length > 4) {
            copy.pop();
          }

          return copy;
        });
      }
    }
  }, [lastMessage, sendMessage, setPriceChangeHistory]);

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
          <h1 className="text-2xl">
            An open-source project for automatically and reliably pricing Team
            Fortress 2 items
          </h1>
        </div>

        <div className="mt-10">
          <div className="text-center">
            <h1 className="text-xl">Recently priced items will appear below</h1>
          </div>
          <div className="mt-2 mx-auto bg-white rounded-xl shadow-md overflow-hidden max-w-sm">
            {priceChangeHistory.map((message, idx) => (
              <div className="md:flex" key={idx}>
                <div className="p-8">
                  <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                    {message.data.sku}
                  </div>
                  <Link href={'/items/' + message.data.sku}>
                    <a className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">
                      Click here to see price history
                    </a>
                  </Link>
                  <p className="mt-2 text-slate-500">
                    Updated{' '}
                    <ReactTimeago
                      date={message.data.createdAt}
                      formatter={(
                        value: number,
                        unit: ReactTimeago.Unit,
                        suffix: ReactTimeago.Suffix,
                      ) => {
                        if (
                          suffix == 'from now' ||
                          (unit === 'second' && value <= 0)
                        )
                          return 'just now';
                        const plural: string = value !== 1 ? 's' : '';
                        return `${value} ${unit}${plural} ${suffix}`;
                      }}
                    />
                    .
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
