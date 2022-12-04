import qs from "qs";
import { erc20ABI } from "wagmi";
import { Contract } from "@ethersproject/contracts";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { fetchQuote, fetchPrice, validateResponseData } from "./utils";
import { TOKENS, ENDPOINTS, CHAIN_IDS, ZERO_EX_PROXY } from "~/constants";

import type { Signer } from "@wagmi/core";
import type { Dispatch, ChangeEvent } from "react";
import type { ActionTypes } from "./reducer";
import type { IReducerState } from "./reducer";
import type {
  DebouncedFetch,
  ZeroExApiRequestParams,
} from "~/hooks/useFetchDebouncePrice";
import type { Quote } from "~/routes/swap/utils";
import type { Price } from "~/hooks/useFetchDebouncePrice";

const getTakerAddress = (state: IReducerState) => {
  return state.network === "hardhat" ? undefined : state.account;
};

// TODO: handle errors or app crash.
export async function onSellTokenSelect(
  e: ChangeEvent<HTMLSelectElement>,
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>
) {
  dispatch({ type: "choose sell token", payload: e.target.value });

  if (state.sellAmount === "") return;
  if (e.target.value === state.buyToken) {
    const params = {
      sellToken: e.target.value,
      buyToken: state.sellToken,
      buyAmount: parseUnits(
        state.sellAmount || "",
        TOKENS[state.sellToken].decimal
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching quote", payload: true });
    dispatch({ type: "set buy amount", payload: state.sellAmount });
    dispatch({ type: "set sell amount", payload: "" });
    dispatch({ type: "set direction", payload: "buy" });

    const data = await fetchQuote(ENDPOINTS[CHAIN_IDS[state.network]], params);
    const dataOrError = validateResponseData<Quote>(data);

    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set quote", payload: dataOrError as Quote });
    }
  } else {
    const params = {
      sellToken: e.target.value,
      buyToken: state.buyToken,
      sellAmount: parseUnits(
        state.sellAmount || "",
        TOKENS[e.target.value].decimal
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching quote", payload: true });
    const data = await fetchQuote(ENDPOINTS[CHAIN_IDS[state.network]], params);
    const dataOrError = validateResponseData<Quote>(data);
    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set quote", payload: dataOrError as Quote });
    }
  }
}

export async function onBuyTokenSelect(
  e: ChangeEvent<HTMLSelectElement>,
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>
) {
  dispatch({ type: "choose buy token", payload: e.target.value });
  if (state.buyAmount === "") return;
  if (e.target.value === state.sellToken) {
    const params = {
      buyToken: e.target.value,
      sellToken: state.buyToken,
      sellAmount: parseUnits(
        state.buyAmount || "",
        TOKENS[state.buyToken].decimal
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching price", payload: true });
    dispatch({ type: "set sell amount", payload: state.buyAmount });
    dispatch({ type: "set buy amount", payload: "" });
    dispatch({ type: "set direction", payload: "sell" });
    const data = await fetchPrice(ENDPOINTS[CHAIN_IDS[state.network]], params);
    const dataOrError = validateResponseData<Price>(data);
    dispatch({ type: "set price", payload: dataOrError as Price });
  } else {
    const params = {
      sellToken: state.sellToken,
      buyToken: e.target.value,
      sellAmount: parseUnits(
        state.sellAmount || "0",
        TOKENS[state.sellToken].decimal
      ).toString(),
      takerAddress: getTakerAddress(state),
    };
    dispatch({ type: "fetching price", payload: true });
    const data = await fetchPrice(ENDPOINTS[CHAIN_IDS[state.network]], params);
    const dataOrError = validateResponseData<Price>(data);
    dispatch({ type: "set price", payload: dataOrError as Price });
  }
}

async function checkAllowance({
  state,
  dispatch,
  signer,
  contractAddress,
}: {
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  signer: Signer;
  contractAddress?: string;
}) {
  if (contractAddress && state.account) {
    const erc20 = new Contract(contractAddress, erc20ABI, signer);
    const allowance = await erc20.allowance(state.account, ZERO_EX_PROXY);

    if (allowance["_hex"] === "0x00") {
      dispatch({ type: "set approval required", payload: true });
    } else {
      dispatch({ type: "set approval required", payload: false });
    }
  }
}

export async function onDirectionChange(
  state: IReducerState,
  dispatch: Dispatch<ActionTypes>,
  signer?: Signer
) {
  const contractAddress = TOKENS[state.buyToken].address;
  const takerAddress = getTakerAddress(state);
  if (state.direction === "sell") {
    signer &&
      checkAllowance({
        state,
        dispatch,
        signer,
        contractAddress,
      });

    const params = {
      sellToken: state.buyToken,
      buyToken: state.sellToken,
      buyAmount: parseUnits(
        state.sellAmount || "0",
        TOKENS[state.sellToken].decimal
      ).toString(),
      ...(takerAddress ? { takerAddress } : {}),
    };

    const endpoint = ENDPOINTS[CHAIN_IDS[state.network]];
    dispatch({ type: "fetching quote", payload: true });
    const response = await fetch(
      `${endpoint}/swap/v1/price?${qs.stringify(params)}`
    );
    const data = await response.json();
    const dataOrError = validateResponseData<Price>(data);
    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set price", payload: data as Price });
      dispatch({
        type: "set sell amount",
        payload: Number(
          formatUnits(
            (dataOrError as Price).sellAmount,
            TOKENS[state.buyToken].decimal
          )
        ).toFixed(6),
      });
    }
  } else {
    signer &&
      checkAllowance({
        state,
        dispatch,
        signer,
        contractAddress,
      });

    const params = {
      sellToken: state.buyToken,
      buyToken: state.sellToken,
      sellAmount: parseUnits(
        state.buyAmount || "0",
        TOKENS[state.buyToken].decimal
      ).toString(),
      ...(takerAddress ? { takerAddress } : {}),
    };

    const endpoint = ENDPOINTS[CHAIN_IDS[state.network]];
    dispatch({ type: "fetching price", payload: true });
    const response = await fetch(
      `${endpoint}/swap/v1/price?${qs.stringify(params)}`
    );
    const data = await response.json();
    const dataOrError = validateResponseData<Price>(data);

    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set price", payload: dataOrError as Price });
      dispatch({
        type: "set buy amount",
        payload: Number(
          formatUnits(
            (data as Price).buyAmount,
            TOKENS[state.sellToken].decimal
          )
        ).toFixed(6),
      });
    }
  }
}

export function onSellAmountChange({
  e,
  state,
  dispatch,
  fetchPrice,
}: {
  e: ChangeEvent<HTMLInputElement>;
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  fetchPrice?: DebouncedFetch;
}) {
  if (e.target.validity.valid) {
    dispatch({ type: "set sell amount", payload: e.target.value });
    dispatch({ type: "set direction", payload: "sell" });

    const value = parseFloat(e.target.value || "0").toString();

    if (value && value !== "0") {
      const { sellToken, buyToken, network } = state;
      const decimal = TOKENS[sellToken].decimal;
      const sellAmount = parseUnits(value, decimal).toString();
      const takerAddress = getTakerAddress(state);
      const params = {
        sellToken,
        buyToken,
        sellAmount,
        ...(takerAddress ? { takerAddress } : {}),
      };

      if (fetchPrice) {
        dispatch({ type: "fetching price", payload: true });
        fetchPrice(params, network);
      }
    }
  }
}

export function onBuyAmountChange({
  e,
  state,
  dispatch,
  fetchPrice,
}: {
  e: ChangeEvent<HTMLInputElement>;
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  fetchPrice?: DebouncedFetch;
}) {
  if (e.target.validity.valid) {
    dispatch({ type: "set buy amount", payload: e.target.value });
    dispatch({ type: "set direction", payload: "buy" });

    const value = parseFloat(e.target.value || "0").toString();

    if (value && value !== "0") {
      const { sellToken, buyToken, network } = state;
      const decimal = TOKENS[buyToken].decimal;
      const buyAmount = parseUnits(value, decimal).toString();
      const takerAddress = getTakerAddress(state);
      const params = { sellToken, buyToken, buyAmount, takerAddress };

      if (fetchPrice) {
        dispatch({ type: "fetching quote", payload: true });
        fetchPrice(params, network);
      }
    }
  }
}

export async function onFetchQuote({
  state,
  dispatch,
}: {
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
}) {
  const { buyToken, sellToken } = state;
  const takerAddress = getTakerAddress(state);

  if (fetchQuote) {
    dispatch({ type: "fetching quote", payload: true });
    let params: ZeroExApiRequestParams = { buyToken, sellToken };

    if (state.direction === "buy") {
      params = {
        sellToken,
        buyToken,
        buyAmount: parseUnits(
          state.buyAmount || "",
          TOKENS[state.buyToken].decimal
        ).toString(),
        takerAddress,
      };
    } else {
      params = {
        sellToken,
        buyToken,
        sellAmount: parseUnits(
          state.sellAmount || "",
          TOKENS[state.sellToken].decimal
        ).toString(),
        takerAddress,
      };
    }
    const data = await fetchQuote(ENDPOINTS[CHAIN_IDS[state.network]], params);
    const dataOrError = validateResponseData(data);

    if ("msg" in dataOrError) {
      dispatch({ type: "error", payload: dataOrError });
    } else {
      dispatch({ type: "set price", payload: undefined });
      dispatch({ type: "set quote", payload: data as Quote });
      dispatch({ type: "set finalize order" });
    }

    dispatch({ type: "fetching quote", payload: false });
    dispatch({ type: "fetching price", payload: false });

    return data;
  }
}
