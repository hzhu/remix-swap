import qs from "qs";
import debounce from "lodash.debounce";
import { useRef, useEffect } from "react";
import { ENDPOINTS, CHAIN_IDS } from "~/constants";

import type { DebouncedFunc } from "lodash";

// https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-price#response
export interface Price {
  chainId: number;
  price: string;
  estimatedPriceImpact: string;
  value: string;
  gasPrice: string;
  gas: string;
  estimatedGas: string;
  protocolFee: string;
  minimumProtocolFee: string;
  buyTokenAddress: string;
  buyAmount: string;
  sellTokenAddress: string;
  sellAmount: string;
  sources: any[];
  allowanceTarget: string;
  sellTokenToEthRate: string;
  buyTokenToEthRate: string;
  expectedSlippage: string | null;
}

interface ValidationError {
  field: string;
  code: number;
  reason: string;
  description: string;
}

export interface ZeroExServerError {
  code: number;
  reason: string;
  values?: { message: string };
  validationErrors: ValidationError[];
}

export type SuccessFn = (data: Price | ZeroExServerError) => void;

export type ErrorFn = (error: unknown) => void;

export interface ZeroExApiRequestParams {
  sellToken: string;
  buyToken: string;
  sellAmount?: string;
  buyAmount?: string;
  takerAddress?: string;
}

export type DebouncedFetch = DebouncedFunc<
  (params: ZeroExApiRequestParams, network: string) => Promise<void>
>;

export function useFetchDebouncePrice(
  onSuccess?: SuccessFn,
  onError?: ErrorFn
) {
  const debouncedRef = useRef<DebouncedFetch>();

  useEffect(() => {
    debouncedRef.current = debounce(async (params, network) => {
      const endpoint = ENDPOINTS[CHAIN_IDS[network]];
      const URL = `${endpoint}/swap/v1/price?${qs.stringify(params)}`;
      try {
        const response = await fetch(URL);
        const data: Price | ZeroExServerError = await response.json();
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
