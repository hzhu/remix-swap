import { formatUnits } from "@ethersproject/units";
import { erc20ABI, useContractRead } from "wagmi";
import { TOKENS } from "~/constants";

import type { Dispatch } from "react";
import type { DebouncedFetch } from "~/hooks/useFetchDebouncePrice";
import type { ActionTypes, IReducerState } from "../routes/swap/reducer";
import clsx from "clsx";

interface MaxArgs {
  state: IReducerState;
  dispatch: Dispatch<ActionTypes>;
  address: `0x${string}`;
  fetchPrice?: DebouncedFetch;
  translations?: any;
}

export function Max({
  state,
  dispatch,
  address,
  fetchPrice,
  translations,
}: MaxArgs) {
  const { data: balance } = useContractRead({
    address: TOKENS[state.sellToken].address,
    functionName: "balanceOf",
    args: [address],
    abi: erc20ABI,
  });

  const sellBalance = balance
    ? formatUnits(balance.toString(), TOKENS[state.sellToken].decimal)
    : "";

  const sellBalanceText =
    Number(sellBalance) > 1
      ? sellBalance
          .split(".")
          .map((s, i) => (i === 1 ? s.slice(0, 2) : s))
          .join(".")
      : sellBalance;

  const hasZeroBalance = sellBalanceText === "0.0";

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
    fetchPrice && fetchPrice(params, network);
  };

  return sellBalance ? (
    <div
      className={clsx(
        hasZeroBalance && "text-red-600 dark:text-red-500",
        "flex items-center text-xs mt-1"
      )}
    >
      {hasZeroBalance ? (
        <span role="img" aria-label="warning">
          ⚠️
        </span>
      ) : null}
      <div className="mx-1">{translations["Balance"]}:</div>
      <div className="text-xs mr-1">{sellBalanceText}</div>
      {sellBalance !== "0.0" ? (
        <button
          type="button"
          onClick={onMaxSell}
          className="text-xs italic hover:bg-blue-600 hover:underline hover:text-slate-50 active:underline active:text-slate-50"
        >
          ({translations["Max"]})
        </button>
      ) : null}
    </div>
  ) : null;
}
