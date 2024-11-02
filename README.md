# Sidox
## Overview

This is a decentralized NFT marketplace built using Hardhat and Next.js. The marketplace allows users to mint, buy, and sell NFTs securely on the ether blockchain.

## Project Structure

- /contracts # Smart contracts
- /app # Next.js frontend
- /scripts # Deployment and utility scripts
- /test # Tests for smart contracts
- hardhat.config.js # config script for hardhat ether test blockchain

## Features

- **Minting NFTs:** Users can mint their own NFTs.
- **Buying:** Users can list NFTs for sale .
- **Selling NFTs:**  Users can buy NFTs listed by others.
- **Blockchain Integration:** Secure and transparent transactions using Ethereum.

## Getting Started


### Prerequisites
- Node.js (v14 or higher)
- npm
- Hardhat
- MetaMask or other Ethereum wallet for interacting with the app

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Said-Ait-Driss/sidox-nfts-market.git
   cd sidox-nfts-market

   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   Create a .env file in the root directory based on the .env.example file.
   Fill in the necessary environment variables (e.g., Alchemy API URL, Private Key).

   ```

### Deployment

1. **Compile the contracts:**

   ```bash
   npx hardhat compile

   ```

2. **Deploy the contracts:**

   ```bash
   npx hardhat run scripts/deploy.es --network sepolia

   ```

3. **Run the frontend:**
   ```bash
   npm run dev
   ```

### Running Tests

1. **Run smart contract tests:**
   ```bash
   npx hardhat test
   ```

## Usage

- Open the frontend in your browser at http://localhost:3000.
- Connect your MetaMask wallet.
- Mint, buy, and sell NFTs directly from the application.

## License

![License](https://img.shields.io/badge/license-MIT-blue)

[MIT License](LICENSE)