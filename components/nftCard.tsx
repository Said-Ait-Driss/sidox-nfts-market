"use client";

import { ethers, TransactionResponse } from "ethers";
import { useEffect, useState } from "react";
import Image from "next/image";
import Blockies from "react-blockies";
import NFTCardSkeleton from "./nftCardSkeleton";
import { useSigner } from "../state";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import NFT_MARKET from "../artifacts/contracts/SaidMarket.sol/SaidMarket.json";

type NftType = {
  from: string;
  id: string;
  price: string;
  to: string;
  tokenURI: string;
  __typename: string;
};

const parseNft = (raw: NftType) => {
  return {
    id: raw.id,
    owner: raw.price == "0" ? raw.to : raw.from,
    price: raw.price == "0" ? "0" : ethers.formatEther(raw.price),
    tokenURI: raw.tokenURI,
  };
};

const NEXT_PUBLIC_NFT_MARKET_ADDRESS = process.env
  .NEXT_PUBLIC_NFT_MARKET_ADDRESS as string;

export default function NftCard({ nft }: { nft: NftType }) {
  const _nft = parseNft(nft);
  const { address, signer } = useSigner();

  const contract = new ethers.Contract(
    NEXT_PUBLIC_NFT_MARKET_ADDRESS,
    NFT_MARKET.abi,
    signer
  );
  const [loading, setLoading] = useState(false);
  let [isOpen, setIsOpen] = useState(false);

  let [etherToSellPrice, setEtherToSellPrice] = useState(0);

  const [meta, setMeta] = useState<any>({
    name: "",
    description: "",
    cid: "",
    url: "",
  });

  useEffect(() => {
    const get = async () => {
      setLoading(true);
      try {
        let response: any = await fetch(
          "/api/pinata?tokenURI=" + nft.tokenURI,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status == 200) {
          response = await response.json();

          if (response.data.files.length) {
            let urlResponse: any = await fetch("/api/pinata", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ cid: nft.tokenURI }),
            });
            if (urlResponse.status == 200) {
              urlResponse = await urlResponse.json();

              setMeta({
                name:
                  response.data.files[0].name ||
                  response.data.files[0].keyvalues.description,
                description: response.data.files[0].keyvalues.description,
                cid: nft.tokenURI,
                url: urlResponse.data,
              });
            }
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    get();
  }, []);

  const owned = _nft.owner == address?.toLowerCase();
  const forSale = _nft.price != "0";

  const onBuyClicked = () => {};

  const onCancelClicked = () => {};

  const onSellConfirmed = async () => {
    if (!etherToSellPrice) return alert("price in mandatory field");
    const wei = ethers.parseEther(etherToSellPrice.toString());
    if (!wei) return alert("price must be greather than 0");
    setLoading(true);
    try {
      const transaction: TransactionResponse = await contract.listingNFt(
        nft.id,
        wei
      );
      await transaction.wait();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const clickHandler = () => {
    if (owned) {
      if (forSale) {
        onCancelClicked();
      } else {
        setIsOpen(true);
      }
    } else {
      if (forSale) onBuyClicked();
      else {
        throw new Error("this should not happen");
      }
    }
  };

  if (loading) return <NFTCardSkeleton />;
  if (!meta.name) return "";
  return (
    <>
      <div className="col-auto m-2 shadow-md max-w-sm">
        <Image
          width={280}
          height={300}
          layout="fixed"
          alt=""
          src={meta.url}
          className="rounded"
        />
        <div className="card-body">
          <h5 className="card-title text-lg font-bold">{meta.name}</h5>
          <p className="card-text text-sm">{meta.description}</p>
        </div>
        <div className="flex space-x-1 h-10 items-center my-2">
          <Blockies seed={_nft.owner} className="rounded-md" />
          <span> {_nft.owner.slice(0, 15)} </span>
        </div>
        <button
          onClick={clickHandler}
          className="border-2 p-2 text-center bg-indigo-500 text-white font-bold rounded-md rounded-t-none w-full hover:bg-indigo-400"
        >
          {loading && "Busy..."}
          {!loading && (
            <>
              {!forSale && "SELL"}
              {forSale && owned && (
                <>
                  <span className="group-hover:hidden">{nft.price} ETH</span>
                  <span className="hidden group-hover:inline">CANCEL</span>
                </>
              )}
              {forSale && !owned && (
                <>
                  <span className="group-hover:hidden">{nft.price} ETH</span>
                  <span className="hidden group-hover:inline">BUY</span>
                </>
              )}
            </>
          )}
        </button>
      </div>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
            <DialogTitle className="font-bold">List Nft for sale</DialogTitle>
            <Description>
              This will list the NFT for sale, you can cancel anytime
            </Description>
            <input
              type="number"
              className="rounded border p-2 w-full"
              value={etherToSellPrice}
              onChange={(e) => setEtherToSellPrice(parseFloat(e.target.value))}
              placeholder="Price ETH"
            />
            <div className="flex gap-4 flex-row-reverse">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-slate-400 text-white p-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={onSellConfirmed}
                className="bg-indigo-500 text-white p-2 rounded"
              >
                Confim
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
