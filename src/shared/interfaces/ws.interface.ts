import { AuthRefresh, History, Price } from './api.interface';

export interface WebsocketMessage<E, T> {
  type: E;
  data: T;
}

export type AuthRequiredMessage = WebsocketMessage<'AUTH_REQUIRED', null>;
export type PriceChangedMessage = WebsocketMessage<'PRICE_CHANGED', History>;
export type PriceUpdatedMessage = WebsocketMessage<'PRICE_UPDATED', Price>;
export type AuthMessage = WebsocketMessage<'AUTH', AuthRefresh>;
