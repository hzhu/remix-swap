/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: "vercel",
  // When running locally in development mode, we use the built in remix
  // server. This does not understand the vercel lambda module format,
  // so we default back to the standard build output.
  server: process.env.NODE_ENV === "development" ? undefined : "./server.js",
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "api/index.js",
  // publicPath: "/build/",
  serverDependenciesToBundle: [
    "@rainbow-me/rainbowkit",
    "@rainbow-me/rainbowkit/wallets",
    "wagmi",
    "wagmi/connectors/injected",
    "wagmi/providers/public",
    "wagmi/providers/alchemy",
    "wagmi/connectors/walletConnect",
    "wagmi/connectors/coinbaseWallet",
    "wagmi/connectors/metaMask",
    "@wagmi/core",
    "@wagmi/core/internal",
    "@wagmi/connectors/injected",
    "@wagmi/core/providers/alchemy",
    "@wagmi/core/providers/public",
    "@wagmi/core/connectors/walletConnect",
    "@wagmi/core/connectors/coinbaseWallet",
    "@wagmi/core/connectors/metaMask",
  ],
};
