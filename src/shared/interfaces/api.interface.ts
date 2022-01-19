export interface History {
  sku: string;
  buyHalfScrap: number;
  buyKeys: number;
  sellHalfScrap: number;
  sellKeys: number;
  createdAt: string;
}

export interface Price {
  sku: string;
  buyHalfScrap: number;
  buyKeys: number;
  buyKeyHalfScrap: number | null;
  sellHalfScrap: number;
  sellKeys: number;
  sellKeyHalfScrap: number | null;
  createdAt: string;
}

export interface AuthRefresh {
  accessToken: string;
}
