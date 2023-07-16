import qs from "qs";
import debounce from "lodash.debounce";
import { useRef, useEffect } from "react";

import type { DebouncedFunc } from "lodash";
import type {
  PriceRequest,
  PriceResponse,
  ZeroExServerError,
} from "~/api/types";

export type SuccessFn = (data: PriceResponse | ZeroExServerError) => void;

export type ErrorFn = (error: unknown) => void;

export type DebouncedFetch = DebouncedFunc<
  (params: PriceRequest, chainId: number) => Promise<void>
>;

export function useFetchDebouncePrice(
  onSuccess?: SuccessFn,
  onError?: ErrorFn
) {
  const debouncedRef = useRef<DebouncedFetch>();

  useEffect(() => {
    debouncedRef.current = debounce(async (params, chainId) => {
      const URL = `/api/price?${qs.stringify(params)}`;
      try {
        const response = await fetch(URL, {
          headers: { "0x-chain-id": chainId.toString() },
        });
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
