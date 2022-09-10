import qs from "qs";
import debounce from "lodash.debounce";
import { useRef, useEffect } from "react";
import { ENDPOINTS, CHAIN_IDS } from "~/constants";
import type { DebouncedFunc } from "lodash";

export interface Quote {
  chainId: number;
  price: string;
  guaranteedPrice: string;
  estimatedPriceImpact: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  estimatedGas: string;
  gasPrice: string;
  protocolFee: string;
  minimumProtocolFee: string;
  buyTokenAddress: string;
  sellTokenAddress: string;
  buyAmount: string;
  sellAmount: string;
  sources: any[];
  orders: any[];
  allowanceTarget: string;
  decodedUniqueId: string;
  sellTokenToEthRate: string;
  buyTokenToEthRate: string;
  expectedSlippage: string | null;
}

export interface ZeroExServerError {
  code: number;
  reason: string;
  values?: { message: string };
}

export type SuccessFn = (data: Quote | ZeroExServerError) => void;
export type ErrorFn = (error: unknown) => void;

export interface ZeroExApiRequestParams {
  sellToken: string;
  buyToken: string;
  sellAmount?: string;
  buyAmount?: string;
}

export type DebouncedFetch = DebouncedFunc<
  (params: ZeroExApiRequestParams, network: string) => Promise<void>
>;

export function useFetchDebounceQuote(
  onSuccess?: SuccessFn,
  onError?: ErrorFn
) {
  const debouncedRef = useRef<DebouncedFetch>();

  useEffect(() => {
    debouncedRef.current = debounce(async (params, network) => {
      const endpoint = ENDPOINTS[CHAIN_IDS[network]];
      const URL = `${endpoint}/swap/v1/quote?${qs.stringify(params)}`;
      try {
        const response = await fetch(URL);
        const data: Quote | ZeroExServerError = await response.json();
        onSuccess && onSuccess(data);
      } catch (error) {
        onError && onError(error);
        console.error(error);
      }
    }, 500);

    return () => {
      debouncedRef.current?.cancel();
    };
  }, [onSuccess, onError]);

  return debouncedRef.current;
}
