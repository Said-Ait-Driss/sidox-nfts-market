import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const API_URL = process.env.API_URL as string;
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

console.log("API_URL ",API_URL);


const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: API_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;
