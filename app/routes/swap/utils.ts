import qs from "qs";
import type {
  Price,
  ZeroExServerError,
  ZeroExApiRequestParams,
} from "~/hooks/useFetchDebouncePrice";

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

export async function fetchPrice(
  endpoint: string,
  params: ZeroExApiRequestParams
): Promise<Price | ZeroExServerError> {
  validateRequestParams(params);

  const response = await fetch(
    `${endpoint}/swap/v1/price?${qs.stringify(params)}`
  );

  const data = await response.json();

  return data;
}

export async function fetchQuote(
  endpoint: string,
  params: ZeroExApiRequestParams
): Promise<Quote | ZeroExServerError> {
  validateRequestParams(params);

  const response = await fetch(
    `${endpoint}/swap/v1/quote?${qs.stringify(params)}`
  );
  
  const data = await response.json();

  return data;
}

export function shorten(hash: string) {
  return `${hash.slice(0, 4)}...${hash.slice(hash.length - 4, hash.length)}`;
}

function validateRequestParams(params: ZeroExApiRequestParams) {
  if (params.buyAmount && params.sellAmount) {
    throw Error(
      "The swap request params requires either a sellAmount or buyAmount. Do not provide both fields."
    );
  }

  if (!params.buyAmount && !params.sellAmount) {
    throw Error(
      "The swap request params requires either a sellAmount or buyAmount."
    );
  }

  if (params.buyToken === params.sellToken) {
    throw Error(
      `Cannot swap the same tokens: ${params.sellToken} & ${params.buyToken}.`
    );
  }
}

export interface ZeroExClientError extends ZeroExServerError {
  msg?: string;
}

/**
 * Validates the response data from 0x API. If error, attempts to normalize error data
 * because 0x API returns inconsistent error objects.
 * @param data
 * @returns The 0x API response data which can be price & quote data or error data
 */
export const validateResponseData = <T extends object>(
  data: T | ZeroExServerError
): T | ZeroExClientError => {
  let error: ZeroExClientError | undefined;

  if ("reason" in data) {
    error = { ...data, msg: data.values?.message };

    // Not all ZeroEx API errors have a message -_-
    if (!error.msg) {
      error.msg = data.reason;
    }

    console.error(error);
  }

  return error?.msg ? error : data;
};
