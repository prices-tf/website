export interface History {
  sku: string;
  buyHalfScrap: number;
  buyKeys: number;
  sellHalfScrap: number;
  sellKeys: number;
  createdAt: string;
}

export interface AuthRefresh {
  accessToken: string;
}
