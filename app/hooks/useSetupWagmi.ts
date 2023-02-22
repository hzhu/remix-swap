import { useState, useEffect } from "react";
import { configureChains, createClient } from "wagmi";
import { mainnet, goerli, hardhat, polygon } from "@wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import type { Chain } from "wagmi";
import type { Client, ProviderWithFallbackConfig } from "@wagmi/core";
import type {
  FallbackProvider,
  StaticJsonRpcProvider,
} from "@ethersproject/providers";

export function useSetupWagmi({
  appName = "Example",
  alchemyId,
}: {
  appName?: string;
  alchemyId: string;
}) {
  const [chains, setChains] = useState<Chain[]>([]);
  const [client, setClient] =
    useState<any>();

    // useState<
    //   Client<
    //     | FallbackProvider
    //     | ProviderWithFallbackConfig<StaticJsonRpcProvider & any>
    //   >
    // >()

  useEffect(() => {
    const local = window.location.port ? [hardhat] : [];
    const { chains, provider } = configureChains(
      [mainnet, polygon, goerli, ...local],
      [alchemyProvider({ apiKey: alchemyId }), publicProvider()]
    );

    const { connectors } = getDefaultWallets({ appName, chains });

    const wagmiClient = createClient({
      provider,
      connectors,
      autoConnect: true,
    });

    setChains(chains);
    setClient(wagmiClient);
  }, [appName, alchemyId]);

  return { client, chains };
}
