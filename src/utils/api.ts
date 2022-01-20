import axios, { AxiosError } from 'axios';
import createAuthRefreshInterceptor, {
  AxiosAuthRefreshRequestConfig,
} from 'axios-auth-refresh';

import {
  AuthRefresh,
  History,
  Paginated,
  Price,
} from '../shared/interfaces/api.interface';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'https://api2.prices.tf',
});

// Interceptor used to add token to requests
api.interceptors.request.use(
  (config: AxiosAuthRefreshRequestConfig) => {
    if (config.url !== '/auth/access' && config.method !== 'POST') {
      const headers = config.headers ?? {};
      headers.Authorization = 'Bearer ' + getAccessToken();
    } else {
      config.skipAuthRefresh = true;
    }

    config.responseType = 'json';
    return config;
  },
  (err) => {
    return Promise.reject(err);
  },
);

// Interceptor used to refresh access token on error
const refreshAuthLogic = (err: AxiosError) =>
  refreshAccessToken().then((token) => {
    localStorage.setItem('token', token);
    if (err.response?.headers?.Authorization) {
      err.response.headers.Authorization = 'Bearer ' + token;
    }

    return Promise.resolve();
  });

createAuthRefreshInterceptor(api, refreshAuthLogic);

export function getHistoryWithInterval(
  sku: string,
  interval: number,
): Promise<History[]> {
  return api
    .get<History[]>('/history/' + sku + '/interval', {
      params: {
        interval,
      },
    })
    .then((res) => res.data);
}

export function getHistory(
  sku: string,
  order: 'DESC' | 'ASC',
  page?: number,
  limit?: number,
): Promise<Paginated<History>> {
  return api
    .get<Paginated<History>>('/history/' + sku, {
      params: {
        order,
        limit,
        page,
      },
    })
    .then((res) => res.data);
}

export function getPrice(sku: string): Promise<Price> {
  return api.get<Price>('/prices/' + sku).then((res) => res.data);
}

export function refreshAccessToken(): Promise<string> {
  return api
    .post<AuthRefresh>('/auth/access')
    .then((res) => res.data.accessToken);
}

function getAccessToken(): string | null {
  return localStorage.getItem('token');
}
