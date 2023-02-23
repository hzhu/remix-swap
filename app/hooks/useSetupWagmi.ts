import { useState, useEffect } from "react";
import { configureChains, createClient } from "wagmi";
import { mainnet, goerli, hardhat, polygon } from "@wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import type { Chain } from "wagmi";

export function useSetupWagmi({
  appName = "Example",
  alchemyId,
}: {
  appName?: string;
  alchemyId: string;
}) {
  const [chains, setChains] = useState<Chain[]>([]);
  const [client, setClient] = useState<any>();

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
