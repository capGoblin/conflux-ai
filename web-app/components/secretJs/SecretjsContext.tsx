"use client";
declare global {
  interface Window {
    keplr: any;
    getEnigmaUtils: any;
    getOfflineSignerOnlyAmino: any;
  }
}

import { createContext, useState, ReactNode } from "react";
import { SecretNetworkClient } from "secretjs";

const SecretjsContext = createContext<{
  secretjs: SecretNetworkClient | null;
  secretAddress: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
} | null>(null);
const SECRET_CHAIN_ID = "pulsar-3";
const SECRET_LCD = "https://pulsar.lcd.secretnodes.com";

const SecretjsContextProvider = ({ children }: { children: ReactNode }) => {
  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");

  async function setupKeplr(
    setSecretjs: (client: SecretNetworkClient | null) => void,
    setSecretAddress: (address: string) => void
  ) {
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    while (
      !window.keplr ||
      !window.getEnigmaUtils ||
      !window.getOfflineSignerOnlyAmino
    ) {
      await sleep(50);
    }

    await window.keplr.enable(SECRET_CHAIN_ID);
    window.keplr.defaultOptions = {
      sign: {
        preferNoSetFee: false,
        disableBalanceCheck: true,
      },
    };

    const keplrOfflineSigner =
      window.getOfflineSignerOnlyAmino(SECRET_CHAIN_ID);
    const accounts = await keplrOfflineSigner.getAccounts();

    const secretAddress = accounts[0].address;
    console.log(secretAddress);
    const secretjs = new SecretNetworkClient({
      url: SECRET_LCD,
      chainId: SECRET_CHAIN_ID,
      wallet: keplrOfflineSigner,
      walletAddress: secretAddress,
      encryptionUtils: window.getEnigmaUtils(SECRET_CHAIN_ID),
    });

    console.log(secretjs);

    setSecretAddress(secretAddress);
    setSecretjs(secretjs);
  }

  async function connectWallet() {
    try {
      if (!window.keplr) {
        console.log("install keplr!");
      } else {
        await setupKeplr(setSecretjs, setSecretAddress);
        console.log("connected");
        // localStorage.setItem("keplrAutoConnect", "true");
        console.log(secretAddress);
      }
    } catch (error) {
      alert(
        "An error occurred while connecting to the wallet. Please try again."
      );
    }
  }

  function disconnectWallet() {
    setSecretAddress("");
    setSecretjs(null);
    localStorage.setItem("keplrAutoConnect", "false");
    console.log("Wallet disconnected!");
  }

  return (
    <SecretjsContext.Provider
      value={{
        secretjs,
        secretAddress,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </SecretjsContext.Provider>
  );
};

export { SecretjsContext, SecretjsContextProvider };
