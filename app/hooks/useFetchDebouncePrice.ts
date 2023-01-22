import qs from "qs";
import debounce from "lodash.debounce";
import { useRef, useEffect } from "react";
import { ENDPOINTS, CHAIN_IDS } from "~/constants";
import { transformTokenParamsToAddress } from "~/routes/swap/utils";

import type { DebouncedFunc } from "lodash";
import type {
  PriceRequest,
  PriceResponse,
  ZeroExServerError,
} from "~/api/types";

export type SuccessFn = (data: PriceResponse | ZeroExServerError) => void;

export type ErrorFn = (error: unknown) => void;

export type DebouncedFetch = DebouncedFunc<
  (params: PriceRequest, network: string) => Promise<void>
>;

export function useFetchDebouncePrice(
  onSuccess?: SuccessFn,
  onError?: ErrorFn
) {
  const debouncedRef = useRef<DebouncedFetch>();

  useEffect(() => {
    debouncedRef.current = debounce(async (params, network) => {
      const computedParams = transformTokenParamsToAddress(params, network);
      const endpoint = ENDPOINTS[CHAIN_IDS[network]];
      const URL = `${endpoint}/swap/v1/price?${qs.stringify(computedParams)}`;
      try {
        const response = await fetch(URL);
        const data: PriceResponse | ZeroExServerError = await response.json();
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
