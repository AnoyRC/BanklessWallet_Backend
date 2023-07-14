"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import RPC from "./ethersRPC";
import { Wallet } from "ethers";

const clientId =
  "BA2stbOXA-r6JT9BKq9lsmEeE4rpoAAsQlyUkp1XdYQGcrcUzYYwtRvHEGXRjvkdOQRKMrWF8-Hhcqsy5YBBPVg";

const LOGIN_PROVIDER = {
  GOOGLE: "google",
  FACEBOOK: "facebook",
  TWITTER: "twitter",
  GITHUB: "github",
  LINKEDIN: "linkedin",
  REDDIT: "reddit",
  DISCORD: "discord",
  TWITCH: "twitch",
  APPLE: "apple",
  EMAIL: "email_passwordless",
};

export default function Home() {
  const [web3auth, setWeb3auth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const [email, setEmail] = useState("");

  function uiConsole(...args) {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const init = async () => {
    try {
      const chainConfig = {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x1",
        rpcTarget: "https://rpc.ankr.com/eth",
        displayName: "Ethereum Mainnet",
        blockExplorer: "https://goerli.etherscan.io",
        ticker: "ETH",
        tickerName: "Ethereum",
      };
      const web3authInstance = new Web3AuthNoModal({
        clientId,
        chainConfig,
        web3AuthNetwork: "cyan",
      });

      setWeb3auth(web3authInstance);

      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig },
      });

      const openloginAdapter = new OpenloginAdapter({
        privateKeyProvider,
        adapterSettings: {
          clientId,
          uxMode: "popup",
          loginConfig: {
            google: {
              verifier: "bankless-wallet",
              verifierSubIdentifier: "google",
              typeOfLogin: "google",
              clientId:
                "846402209759-e0se0jbplnrgk2itnirbadsgme32evu3.apps.googleusercontent.com",
            },
            auth0github: {
              verifier: "bankless-wallet",
              verifierSubIdentifier: "github",
              typeOfLogin: "jwt",
              clientId: "dev-pekknv1gkulrlnlq.us.auth0.com",
            },
            auth0emailpasswordless: {
              verifier: "bankless-wallet",
              verifierSubIdentifier: "emailpasswordless",
              typeOfLogin: "jwt",
              clientId: "dev-pekknv1gkulrlnlq.us.auth0.com",
            },
          },
        },
      });

      web3authInstance.configureAdapter(openloginAdapter);

      await web3authInstance.init();
      setProvider(web3authInstance.provider);
      if (web3authInstance.connectedAdapterName) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      return;
    }
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: LOGIN_PROVIDER.GOOGLE,
      }
    );
    uiConsole("Logged In successfully");
    setProvider(web3authProvider);
    setLoggedIn(true);
  };

  const loginWithEmail = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: "auth0emailpasswordless",
        extraLoginOptions: {
          domain: "https://dev-pekknv1gkulrlnlq.us.auth0.com",
          verifierIdField: "email",
          isVerifierIdCaseSensitive: false,
        },
      }
    );
    setProvider(web3authProvider);
    setLoggedIn(true);
  };
  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    uiConsole("Logged Out successfully");
    setProvider(null);
    setLoggedIn(false);
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    console.log(chainId);
    uiConsole(chainId);
  };

  const addChain = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const newChain = {
      chainId: "0x5",
      displayName: "Goerli",
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      tickerName: "Goerli",
      ticker: "ETH",
      decimals: 18,
      rpcTarget: "https://rpc.ankr.com/eth_goerli",
      blockExplorer: "https://goerli.etherscan.io",
    };
    await web3auth?.addChain(newChain);
    uiConsole("New Chain Added");
  };

  const switchChain = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    await web3auth?.switchChain({ chainId: "0x5" });
    uiConsole("Chain Switched");
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
  };

  const createWallet = async () => {
    const wallet = Wallet.createRandom();
    uiConsole(wallet);
    console.log(wallet);
  };

  return (
    <main className="flex flex-col justify-center items-center w-screen h-screen">
      <button onClick={login} className="bg-red-500 rounded-md p-2">
        Login with Google
      </button>
      <button onClick={createWallet} className="mt-5 bg-red-500 rounded-md p-2">
        createWallet
      </button>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Type your email"
        className="mt-5 rounded-md p-2 text-black placeholder:text-slate-400"
      />
      <button
        onClick={loginWithEmail}
        className="mt-5 bg-red-500 rounded-md p-2"
      >
        Login with Email
      </button>
      <button onClick={getUserInfo} className="mt-5 bg-red-500 rounded-md p-2">
        Get User Info
      </button>
      <button onClick={getChainId} className="mt-5 bg-red-500 rounded-md p-2">
        Get Chain Id
      </button>
      <button onClick={addChain} className="mt-5 bg-red-500 rounded-md p-2">
        Add Goerli Chain
      </button>
      <button onClick={switchChain} className="mt-5 bg-red-500 rounded-md p-2">
        Switch Chain
      </button>
      <button onClick={getAccounts} className="mt-5 bg-red-500 rounded-md p-2">
        Get Accounts
      </button>
      <button onClick={getBalance} className="mt-5 bg-red-500 rounded-md p-2">
        Get Balance
      </button>
      <button
        onClick={sendTransaction}
        className="mt-5 bg-red-500 rounded-md p-2"
      >
        Send 0.001 ETH to Anoy
      </button>
      <button
        onClick={getPrivateKey}
        className="mt-5 bg-red-500 rounded-md p-2"
      >
        Get Private Key
      </button>
      <button onClick={logout} className="mt-5 bg-red-500 rounded-md p-2">
        Logout
      </button>
      <div
        id="console"
        className="mt-2 w-[500px] h-[400px] fixed bottom-0 left-0 text-sm overflow-x-scroll"
        style={{ whiteSpace: "pre-line" }}
      >
        <p style={{ whiteSpace: "pre-line" }}>UI Console</p>
      </div>
    </main>
  );
}
