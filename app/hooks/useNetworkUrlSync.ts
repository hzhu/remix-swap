import { useAccount } from "wagmi";
import { mainnet, goerli, hardhat, polygon  } from '@wagmi/chains'
import { DEFAULT_CHAIN_ID, initialPairByChainId } from "~/constants";

import type { Chain } from "wagmi";
import type { Dispatch } from "react";
import type { ActionTypes } from "~/routes/swap/reducer";
import type { URLSearchParamsInit } from "react-router-dom";

type ChainByKey = { [key: string]: Chain };

const allChains = [mainnet, goerli, hardhat, polygon]

interface UseNetworkUrlSyncArgs {
  dispatch: Dispatch<ActionTypes>;
  searchParams: URLSearchParams;
  setSearchParams: (
    nextInit: URLSearchParamsInit,
    navigateOptions?:
      | {
          replace?: boolean | undefined;
          state?: any;
        }
      | undefined
  ) => void;
}

const chainsByName = allChains.reduce<ChainByKey>(
  (acc, curr) =>
    curr.name ? { ...acc, [curr.name.toLowerCase()]: curr } : acc,
  {}
);

const chainsById = allChains
  // Filter out foundry because this project uses hardhat for testing & both have same chain id
  // .filter((chain) => chain.network !== "foundry")
  .reduce<ChainByKey>(
    (acc, curr) => (curr.id ? { ...acc, [curr.id]: curr } : curr),
    {}
  );

// TODO: Refactor to support other networks. Currently hardcoded to Ethereum & Polygon.
export function useNetworkUrlSync({
  dispatch,
  searchParams,
  setSearchParams,
}: UseNetworkUrlSyncArgs) {
  useAccount({
    async onConnect({ connector }) {
      const params = new URLSearchParams(window.location.search);
      const network = params.get("network");

      if (network) {
        const params = new URLSearchParams(window.location.search);

        params.set("network", network);
        history.replaceState(null, "", `?${params.toString()}`);
        connector?.connect({ chainId: chainsByName[network].id });
        dispatch({ type: "select network", payload: network });
      } else {
        const chainId = (await connector?.getChainId()) || 1;
        const network = chainsById[chainId].name.toLowerCase();

        dispatch({ type: "select network", payload: network });
        setSearchParams({
          ...searchParams,
          network,
        });
      }

      connector?.on("change", async (data) => {
        const chainId = data.chain?.id || DEFAULT_CHAIN_ID;
        const network = chainsById[chainId].name.toLowerCase();
        const [sellToken, buyToken] = initialPairByChainId[chainId];
        dispatch({ type: "choose sell token", payload: sellToken });
        dispatch({ type: "choose buy token", payload: buyToken });
        dispatch({ type: "select network", payload: network });
        setSearchParams({
          ...searchParams,
          sell: sellToken,
          buy: buyToken,
          network,
        });
      });
    },
  });
}
