import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";

export const ENDPOINTS: Record<string, string> = {
  "1": "https://api.0x.org",
  "5": "https://goerli.api.0x.org",
  "137": "https://polygon.api.0x.org",
  "31337": "https://api.0x.org", // hardhat mainnet fork
};

export async function loader({ request, params }: LoaderArgs) {
  const url = new URL(request.url);
  // todo: handle invalid chainIds
  const chainId = request.headers.get("0x-chain-id") || "1";
  const headers = {
    "0x-chain-id": chainId,
    // https://0x.org/docs/0x-swap-api/introduction#get-started
    "0x-api-key": process.env.ZEROEX_API_KEY!,
  };
  const response = await fetch(
    `${ENDPOINTS[chainId]}/swap/v1/price${url.search}`,
    { headers }
  );
  const data = await response.json();
  return json(data);
}
