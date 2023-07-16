import { formatUnits } from "@ethersproject/units";
import { erc20ABI, useContractRead } from "wagmi";
import { getTokenListBySymbol } from "~/constants";

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
  chainId: number;
}

export function Max({
  state,
  dispatch,
  address,
  fetchPrice,
  translations,
  chainId,
}: MaxArgs) {
  const tokensBySymbol = getTokenListBySymbol(chainId);
  const sellToken = tokensBySymbol[state.sellToken];
  const buyToken = tokensBySymbol[state.buyToken];

  // TODO: Lift this up to the parent component and make sure to refetch new balance when user submits a transaction
  const { data: balance } = useContractRead({
    address: sellToken.address,
    functionName: "balanceOf",
    args: [address],
    abi: erc20ABI,
  });

  const sellBalance = balance
    ? formatUnits(balance.toString(), sellToken.decimals)
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
    const { network } = state;
    const sellAmount = balance?.toString();
    const params = {
      sellToken: sellToken.address,
      buyToken: buyToken.address,
      sellAmount,
      takerAddress: address,
    };
    dispatch({ type: "fetching quote", payload: true });
    dispatch({ type: "set direction", payload: "sell" });
    // TODO: fix me
    fetchPrice && fetchPrice(params, 1);
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
