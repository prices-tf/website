import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Price } from '../../shared/interfaces/api.interface';
import { getHistory, getPrice } from '../../utils/api';

interface Data {
  buyValue: number;
  sellValue: number;
  buyDisplay: string;
  sellDisplay: string;
  createdAt: Date;
}

export default function ItemPage() {
  const router = useRouter();

  const page = useRef<number>(1);
  const [maxPages, setMaxPages] = useState<number>(Infinity);
  const [data, setData] = useState<Data[]>([]);
  const [keyPrice, setKeyPrice] = useState<Price>();

  useEffect(() => {
    if (!router.isReady) return;

    getData(router.query.sku as string, 1).then(([data, keyPrice, max]) => {
      setKeyPrice(keyPrice);
      setData(data);
      setMaxPages(max);
    });
  }, [router.isReady, router.query.sku]);

  const priceInKeys =
    router.query.sku === '5021;6'
      ? false
      : keyPrice === undefined
      ? false
      : data.find((v) => v.sellValue > keyPrice.sellHalfScrap);

  return (
    <div>
      <Head>
        <title>Price history of {router.query.sku}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="container mx-auto mt-10">
        <div className="text-center">
          <h1 className="text-xl">Price history of {router.query.sku}</h1>
        </div>
        <div className="text-center mt-5">
          {maxPages > page.current && (
            <button
              onClick={() => {
                page.current++;
                getData(router.query.sku as string, page.current).then(
                  ([newData, keyPrice]) => {
                    setKeyPrice(keyPrice);
                    setData(newData.concat(data));
                  },
                );
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Load more data
            </button>
          )}
        </div>
        <div className="rounded-xl shadow-md px-4 h-96 py-10">
          {keyPrice === undefined ? (
            <p>Loading</p>
          ) : (
            <ResponsiveContainer width="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="createdAt"
                  tickFormatter={(tickItem) =>
                    tickItem.toLocaleString('default', {
                      dateStyle: 'medium',
                    })
                  }
                  scale="time"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(t) => {
                    if (priceInKeys) {
                      return truncate(t / keyPrice.sellHalfScrap) + ' keys';
                    } else {
                      return truncate(t / 18) + ' ref';
                    }
                  }}
                />
                <Tooltip
                  labelFormatter={(t) =>
                    t.toLocaleString('default', {
                      timeStyle: 'short',
                      dateStyle: 'medium',
                    })
                  }
                  formatter={(value: number, name: 'Buy' | 'Sell', x: any) => {
                    return x.payload[
                      name === 'Buy' ? 'buyDisplay' : 'sellDisplay'
                    ];
                  }}
                />
                <Legend wrapperStyle={{ position: 'relative' }} />
                <Line
                  name="Sell"
                  type="stepBefore"
                  dataKey="sellValue"
                  stroke="#ec1c24"
                  dot={{ r: 0 }}
                />
                <Line
                  name="Buy"
                  type="stepBefore"
                  dataKey="buyValue"
                  stroke="#0094d9"
                  dot={{ r: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

async function getData(
  sku: string,
  page: number,
): Promise<[Data[], Price, number]> {
  const [data, keyPrice] = await Promise.all([
    getHistory(sku, 'DESC', page),
    getPrice('5021;6'),
  ]);

  return [
    data.items
      .map((element) => {
        const buyValue =
          element.buyHalfScrap + element.buyKeys * keyPrice.sellHalfScrap;
        const sellValue =
          element.sellHalfScrap + element.sellKeys * keyPrice.sellHalfScrap;

        return {
          buyValue,
          sellValue,
          buyDisplay: displayPrice(element.buyKeys, element.buyHalfScrap),
          sellDisplay: displayPrice(element.sellKeys, element.sellHalfScrap),
          createdAt: new Date(element.createdAt),
        };
      })
      .reverse(),
    keyPrice,
    data.meta.totalPages,
  ];
}

function displayPrice(keys: number, halfScrap: number): string {
  let string = '';

  const metal = truncate(halfScrap / 18);

  if (keys !== 0 || keys === halfScrap) {
    // If there are keys, then we will add that to the string
    string = keys + ' ' + (keys === 1 ? 'key' : 'keys');
  }

  if (metal !== 0 || keys === metal) {
    if (string !== '') {
      // The string is not empty, that means that we have added the keys
      string += ', ';
    }

    // Add the metal to the string
    string += truncate(metal) + ' ref';
  }

  return string;
}

function truncate(number: number): number {
  const decimals = 2;
  const factor = Math.pow(10, decimals);
  const truncated = rounding(number * factor) / factor;
  return truncated;
}

function rounding(number: number): number {
  const isPositive = number >= 0;

  const rounding = number + 0.001 > Math.ceil(number) ? Math.round : Math.floor;
  const rounded = rounding(Math.abs(number));

  return isPositive ? rounded : -rounded;
}
