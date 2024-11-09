"use client";

import { useQuery } from "@apollo/client";
import { GET_MY_UNLISTED_NFTS } from "../../state/nft_market/queries";
import { useSigner } from "../../state";
import NftCard from "../../components/nftCard";

const NftsComponent = (loading: boolean, data: any) => {
  if (loading)
    return (
      <div className="flex items-center w-full">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-300 w-full"></div>
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-300 w-full"></div>
        <div className="h-2.5 ms-2 bg-gray-200 rounded-full dark:bg-gray-300 w-full"></div>
        <div className="h-2.5 ms-2 bg-gray-200 rounded-full dark:bg-gray-300 w-full"></div>
      </div>
    );
  else if (data.nfts?.length) {
    return data.nfts.map((nft: any) => <NftCard nft={nft} key={nft.id} />);
  }
  return <div>no data found</div>;
};

export default function MyUnlistedNfts() {
  const { address } = useSigner();

  const { data, error, loading } = useQuery(GET_MY_UNLISTED_NFTS, {
    variables: {
      owner: address,
    },
  });

  if (error)
    return <div className="text-red-500 bg-red-50">{error.message}</div>;
  return (
    <>
      <h3 className="font-bold m-4 text-center">My Unlisted nft collection</h3>
      <div className="my-2 flex">{NftsComponent(loading, data)}</div>
    </>
  );
}
