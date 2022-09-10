import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const RPC_TEST_URL = process.env.RPC_TEST_URL;

if (!RPC_TEST_URL) {
  throw new Error("Missing environment variable `RPC_TEST_URL`");
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      // https://hardhat.org/hardhat-network/guides/mainnet-forking
      forking: {
        url: RPC_TEST_URL,
      },
    },
  },
};
