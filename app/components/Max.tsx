import { formatUnits } from "@ethersproject/units";
import type { Dispatch } from "react";
import type { BigNumber } from "@ethersproject/bignumber";
import type { DebouncedFetch } from "~/hooks/useFetchDebounceQuote";
import type { ActionTypes, IReducerState } from "../routes/swap/reducer";
import { TOKENS } from "~/constants";

interface MaxArgs {
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  address?: string;
  balance: BigNumber | undefined;
  fetchQuote?: DebouncedFetch;
}

export function Max({
  state,
  dispatch,
  address,
  balance,
  fetchQuote,
}: MaxArgs) {
  const sellBalance = balance
    ? formatUnits(balance.toString(), TOKENS[state.sellToken].decimal)
    : "";

  const sellBalanceText = sellBalance
    .split(".")
    .map((s, i) => (i === 1 ? s.slice(0, 2) : s))
    .join(".");

  const onMaxSell = () => {
    dispatch({
      type: "set sell amount",
      payload: sellBalance,
    });
    const { sellToken, buyToken, network } = state;
    const sellAmount = balance?.toString();
    const params = {
      sellToken,
      buyToken,
      sellAmount,
      takerAddress: address,
    };
    dispatch({ type: "fetching quote", payload: true });
    dispatch({ type: "set direction", payload: "sell" });
    fetchQuote && fetchQuote(params, network);
  };

  return sellBalance ? (
    <div className="flex">
      <div className="text-xs mr-1">Balance: {sellBalanceText}</div>
      {sellBalance !== "0.0" ? (
        <button
          type="button"
          onClick={onMaxSell}
          className="text-xs italic hover:bg-blue-600 hover:underline hover:text-slate-50 active:underline active:text-slate-50"
        >
          (max)
        </button>
      ) : null}
    </div>
  ) : null;
}
