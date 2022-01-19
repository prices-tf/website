import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useState } from 'react';
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

  const [data, setData] = useState<Data[]>([]);
  const [keyPrice, setKeyPrice] = useState<Price>();
  const [interval, setInterval] = useState(24 * 60 * 60 * 1000);

  function onIntervalChange(e: ChangeEvent<HTMLSelectElement>) {
    const val = parseInt(e.target.value);
    setInterval(val);
  }

  useEffect(() => {
    if (!router.isReady) return;

    getData(router.query.sku as string, interval).then(([data, keyPrice]) => {
      setKeyPrice(keyPrice);
      setData(data);
    });
  }, [interval, router.isReady, router.query.sku]);

  const priceInKeys =
    router.query.sku === '5021;6'
      ? false
      : keyPrice === undefined
      ? false
      : data.find((v) => v.sellValue > keyPrice.sellHalfScrap);

  return (
    <div className="container mx-auto md:mt-10">
      <div className="text-center">
        <h1 className="text-xl">Price history of {router.query.sku}</h1>
      </div>
      <div className="md:grid grid-flow-row-dense grid-cols-5 rounded-xl shadow-md px-4">
        <div className="sm:h-16 mx-auto">
          <div>
            <p>SKU: {router.query.sku}</p>
            <div>
              <p>
                Interval:{' '}
                <select
                  id="interval"
                  defaultValue={24 * 60 * 60 * 1000}
                  onChange={onIntervalChange}
                >
                  <option value={30 * 60 * 1000}>30 minutes</option>
                  <option value={60 * 60 * 1000}>1 hour</option>
                  <option value={2 * 60 * 60 * 1000}>2 hours</option>
                  <option value={4 * 60 * 60 * 1000}>4 hours</option>
                  <option value={12 * 60 * 60 * 1000}>12 hours</option>
                  <option value={24 * 60 * 60 * 1000}>24 hours</option>
                </select>
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-4 h-96 py-10">
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
                  type="step"
                  dataKey="sellValue"
                  stroke="#ec1c24"
                  dot={{ r: 0 }}
                />
                <Line
                  name="Buy"
                  type="step"
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
  interval: number,
): Promise<[Data[], Price]> {
  const [data, keyPrice] = await Promise.all([
    getHistory(sku, interval),
    getPrice('5021;6'),
  ]);

  return [
    data.map((element) => {
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
    }),
    keyPrice,
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
