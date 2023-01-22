import { CHAIN_IDS, getTokenListBySymbol } from "~/constants";
import type { PriceRequest, QuoteRequest } from "~/api/types";

export function shorten(hash: string) {
  return `${hash.slice(0, 4)}...${hash.slice(hash.length - 4, hash.length)}`;
}

export function transformTokenParamsToAddress(
  params: PriceRequest | QuoteRequest,
  network: string
) {
  const chainId = CHAIN_IDS[network];
  const tokensBySymbol = getTokenListBySymbol(chainId);
  const { sellToken, buyToken } = params;

  return {
    ...params,
    sellToken: tokensBySymbol[sellToken].address,
    buyToken: tokensBySymbol[buyToken].address,
  };
}
