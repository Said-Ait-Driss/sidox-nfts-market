"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { SignerContext } from "../state";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";

function SignerProvider({ children }: { children: ReactNode }) {
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    const web3Modal = new Web3Modal()
    if(web3Modal.cachedProvider) connectWallet()
  },[])

  const connectWallet = async () => {
    setLoading(true);
    try {
      const web3Modal = new Web3Modal({ cacheProvider:true });
      const instance = await web3Modal.connect();
      const provider = new Web3Provider(instance);

      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setSigner(signer);
      setAddress(address);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      signer,
      address,
      loading,
      connectWallet,
    }),
    [loading, address]
  );

  return (
    <SignerContext.Provider value={contextValue}>
      {children}
    </SignerContext.Provider>
  );
}

export default SignerProvider;
