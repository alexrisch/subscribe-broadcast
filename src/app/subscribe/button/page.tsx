'use client'

import { CSSProperties, useCallback, useState } from "react";
import { createConsentMessage, createConsentProofPayload} from "@xmtp/consent-proof-signature"
import { createWeb3Modal, useWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { useAccount, WagmiProvider } from 'wagmi'
import { arbitrum, mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { walletClient } from "./utils";
import { broadcastConfigs } from "../broadcastConfigs";

const queryClient = new QueryClient()

// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID ?? "";

// 2. Create wagmiConfig
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/82580170"],
};

const chains = [mainnet, arbitrum] as const
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
})


const {address: broadcastAddress, name} = broadcastConfigs[0]
const host = process.env.API_HOST || 'https://broadcast-api-production-8513.up.railway.app'

enum ErrorStates {
  NO_WALLET = 'NO_WALLET',
  NOT_ON_NETWORK = 'NOT_ON_NETWORK',
  SIGNATURE_ERROR = 'SIGNATURE_ERROR',
  SUBSCRIPTION_ERROR = 'SUBSCRIPTION_ERROR',
}

const styles: Record<string, CSSProperties> = {
  SubscribeButtonContainer: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    borderRadius: "5px",
    textAlign: "center",
    alignItems: "center",
  },
  SubscribeButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 20px",
    borderRadius: "5px",
    marginBottom: "2px",
    textAlign: "left",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    fontWeight: "bold",
    color: "#333333",
    backgroundColor: "#ededed",
    border: "none",
    fontSize: "12px",
  },
  ErrorText: {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
  },
};

const getErrorMessage = (error: ErrorStates) => {
  switch (error) {
    case ErrorStates.NO_WALLET:
      return "Connect your wallet to continue";
    case ErrorStates.NOT_ON_NETWORK:
      return "You are not on the XMTP network";
    case ErrorStates.SIGNATURE_ERROR:
      return "Error signing the message, please try again";
    case ErrorStates.SUBSCRIPTION_ERROR:
      return "Error subscribing, please try again";
    default:
      return "An error occurred, please try again";
  }
};

const SubscribeButton = () => {
  // State for loading status
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(false);
  const [errorState, setErrorState] = useState<ErrorStates | null>(null);
  const {address, isDisconnected} = useAccount();
  const { open } = useWeb3Modal();

  // Define the handleClick function
  const handleSigning = useCallback(async () => {
    try {
      setLoading(true);
      setErrorState(null);
      // Get the subscriber
      if (!address) {
        throw new Error(ErrorStates.NO_WALLET);
      }
      const lookupResponse = await fetch(`${host}/lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            broadcastAddress,
          })
        });
      const data = await lookupResponse.json();
      if (!data.onNetwork) {
        throw new Error(ErrorStates.NOT_ON_NETWORK);
      }
      const timestamp = Date.now();
      const message = createConsentMessage(broadcastAddress, timestamp)
      const signature = await walletClient.signMessage({ 
        account: address,
        message,
      })
      const payloadBytes = createConsentProofPayload(signature, timestamp)
      const base64Payload = Buffer.from(payloadBytes).toString('base64')

      const subscribeResponse = await fetch(`${host}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            signature,
            timestamp,
            broadcastAddress,
            consentProof: base64Payload
          })
        });
      await subscribeResponse.json();
      setSubscriptionStatus(true)
      setLoading(false);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        switch (error.message) {
          case ErrorStates.SIGNATURE_ERROR:
            setErrorState(ErrorStates.SIGNATURE_ERROR);
            break;
          case ErrorStates.SUBSCRIPTION_ERROR:
            setErrorState(ErrorStates.SUBSCRIPTION_ERROR);
            break;
          case ErrorStates.NOT_ON_NETWORK:
            setErrorState(ErrorStates.NOT_ON_NETWORK);
            break;
          case ErrorStates.NO_WALLET:
            setErrorState(ErrorStates.NO_WALLET);
            break;
        }
      }
      setLoading(false);
    }
  }, [address]); 

  const handleButtonClick = useCallback(() => {
    isDisconnected ? open() : handleSigning();
  }, [isDisconnected, handleSigning, open]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div
        style={styles.SubscribeButtonContainer}
        className={`Subscribe ${loading ? "loading" : ""}`}>
          Subscribe to {name}
        <button style={styles.SubscribeButton} onClick={handleButtonClick}>
          {subscriptionStatus ? "Subscribed" : loading ? "Loading... " : 'Subscribe'}
        </button>
        <div>
          {errorState && <p style={styles.ErrorText}>{getErrorMessage(errorState)}</p>}
        </div>
      </div>
    </main>
  );
};

export default function SubscribeButtonPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SubscribeButton />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

