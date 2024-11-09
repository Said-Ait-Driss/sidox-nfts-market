import { gql } from "@apollo/client";

const contract_address = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS;

export const GET_MY_UNLISTED_NFTS = gql`
  query GET_MY_UNLISTED_NFTS($owner: String!) {
    nfts(where: { to: $owner, from: "0x0000000000000000000000000000000000000000" }) {
      id
      from
      to
      tokenURI
      price
    }
  }
`;
