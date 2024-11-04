"use client";

import { PhotoIcon } from "@heroicons/react/24/solid";
import { ethers, TransactionResponse } from "ethers";
import { FormEvent, useContext, useState } from "react";
import NFT_MARKET from "../../artifacts/contracts/SaidMarket.sol/SaidMarket.json";
import { useSigner } from "../../state";

const NEXT_PUBLIC_NFT_MARKET_ADDRESS = process.env
  .NEXT_PUBLIC_NFT_MARKET_ADDRESS as string;

export default function NewNft() {
  const { signer } = useSigner();
  const [mintLoading, setMintLoading] = useState(false);
  const [mintMessage, setMintMessage] = useState({ type: "", message: "" });

  const contract = new ethers.Contract(
    NEXT_PUBLIC_NFT_MARKET_ADDRESS,
    NFT_MARKET.abi,
    signer
  );

  const createNewNft = async (event: FormEvent<HTMLFormElement>) => {
    setMintLoading(true);
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const res = await fetch("/api/storage", {
        method: "POST",
        body: formData,
      });
      if (res.status == 201) {
        const json: any = await res.json();
        const transaction: TransactionResponse = await contract.createNft(
          json.uri
        );
        await transaction.wait();
        setMintMessage({
          type: "success",
          message: "Transaction minted successfully !",
        });
      }
    } catch (err) {
      console.log(err);
      setMintMessage({
        type: "error",
        message:
          "An error occur while proccessing the transaction, please try later",
      });
    } finally {
      setMintLoading(false);
    }
  };
  return (
    <form className="flex justify-center" onSubmit={createNewNft}>
      <div className="space-y-12 mt-8">
        <div className=" pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Create new nft
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            This information will be displayed publicly so be careful what you
            share.
          </p>
          {mintMessage.type == "error" ? (
            <div className="p-2 text-red-600 bg-red-200">
              {mintMessage.message}
            </div>
          ) : mintMessage.type == "success" ? (
            <div className="p-2 text-green-600 bg-green-200">
              {mintMessage.message}
            </div>
          ) : (
            ""
          )}
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="name"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Name
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="my cool nft"
                    autoComplete="name"
                    className="block w-full flex-1 border-0 bg-transparent py-1.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm/6"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="about"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  defaultValue={""}
                />
              </div>
              <p className="mt-3 text-sm/6 text-gray-600">
                Write a few sentences about your nft.
              </p>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="cover-photo"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Image
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <PhotoIcon
                    aria-hidden="true"
                    className="mx-auto h-12 w-12 text-gray-300"
                  />
                  <div className="mt-4 flex text-sm/6 text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs/5 text-gray-600">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="text-sm/6 font-semibold text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mintLoading}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {mintLoading ? "saving ...." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
