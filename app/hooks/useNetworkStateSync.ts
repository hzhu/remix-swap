import { useEffect } from "react";
import { useNetwork } from "wagmi";
import { useSearchParams } from "@remix-run/react";
import type { Dispatch } from "react";
import type { ActionTypes } from "~/routes/swap/reducer";

/**
 * NOTICE:
 * This code is very brittle and untested. Please manually verify wallet, state, and query param
 * behavior for each code change. Small and incremental code changes recommended.
 */

// Syncs wallet to query param `?network=` and wallet network changes to query param `?network=`
export function useNetworkStateSync(dispatch: Dispatch<ActionTypes>) {
  // syncs active chain to state, otherwise
  // syncs network query param to state
  const { chain } = useNetwork();
  const [searchParams, setSearchParams] = useSearchParams();

  // FIX: setting serarch params here adds to history stack & prevents navigating back home
  // maybe try persisting network query into cookie instead and sending a request to
  // the server to set the query params...
  useEffect(() => {
    const network = searchParams.get("network");

    if (chain) {
      dispatch({ type: "select network", payload: chain?.name.toLowerCase() });
      if (network === null) {
        setSearchParams({ ...searchParams, network: chain.name.toLowerCase() });
      }
    } else {
      if (network === null) {
        setSearchParams({ ...searchParams, network: "ethereum" });
      }

      if (typeof network === "string") {
        if (validateNetwork(network)) {
          dispatch({ type: "select network", payload: network });
        }
      }
    }
  }, [chain, dispatch, searchParams, setSearchParams]);
}

function validateNetwork(network: string) {
  const networks = new Set(["ethereum", "polygon", "ropsten"]);

  return networks.has(network.toLowerCase());
}
