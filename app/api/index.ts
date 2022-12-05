import qs from "qs";
import type {
  PriceRequest,
  PriceResponse,
  QuoteResponse,
  ZeroExServerError,
  ZeroExClientError,
} from "./types";

export async function fetchPrice(
  endpoint: string,
  params: PriceRequest
): Promise<PriceResponse | ZeroExServerError> {
  validateRequestParams(params);

  const response = await fetch(
    `${endpoint}/swap/v1/price?${qs.stringify(params)}`
  );

  const data = await response.json();

  return data;
}

export async function fetchQuote(
  endpoint: string,
  params: PriceRequest
): Promise<QuoteResponse | ZeroExServerError> {
  validateRequestParams(params);

  const response = await fetch(
    `${endpoint}/swap/v1/quote?${qs.stringify(params)}`
  );

  const data = await response.json();

  return data;
}

function validateRequestParams(params: PriceRequest) {
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
