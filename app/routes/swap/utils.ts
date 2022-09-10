import qs from "qs";
import type {
  Quote,
  ZeroExServerError,
  ZeroExApiRequestParams,
} from "~/hooks/useFetchDebounceQuote";

export async function fetchQuote(
  endpoint: string,
  params: ZeroExApiRequestParams
) {
  console.log("heyo!");
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

export const validateResponseData = (
  data: Quote | ZeroExServerError
): Quote | ZeroExClientError => {
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
