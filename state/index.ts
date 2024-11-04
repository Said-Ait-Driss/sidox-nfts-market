import { createContext, useContext } from "react";
import { JsonRpcSigner  } from "@ethersproject/providers";

export type SignerContextType = {
  signer?: JsonRpcSigner;
  address?: string;
  loading: boolean;
  connectWallet: Function;
};

export const SignerContext = createContext<SignerContextType>({} as any);

export const useSigner = () => useContext(SignerContext);
