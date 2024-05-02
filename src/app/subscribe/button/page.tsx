'use client'

import { CSSProperties, useState } from "react";
import { createConsentMessage, connectWallet, walletClient } from "./utils";
import { broadcastConfigs } from "../broadcastConfigs";

const {address: broadcastAddress, name} = broadcastConfigs[0]

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

export default function SubscribeButton() {
  // State for loading status
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(false);
  const [errorState, setErrorState] = useState<ErrorStates | null>(null);

  // Define the handleClick function
  const handleClick = async () => {
    try {
      setLoading(true);
      setErrorState(null);
      // Get the subscriber
      const address = await connectWallet();
      if (!address) {
        throw new Error(ErrorStates.NO_WALLET);
      }
      const lookupResponse = await fetch('http://localhost:6989/lookup', {
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

      const subscribeResponse = await fetch('http://localhost:6989/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            signature,
            timestamp,
            broadcastAddress,
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
  }; 

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div
        style={styles.SubscribeButtonContainer}
        className={`Subscribe ${loading ? "loading" : ""}`}>
          Subscribe to {name}
        <button style={styles.SubscribeButton} onClick={handleClick}>
          {subscriptionStatus ? "Subscribed" : loading ? "Loading... " : 'Subscribe'}
        </button>
        <div>
          {errorState && <p style={styles.ErrorText}>{getErrorMessage(errorState)}</p>}
        </div>
      </div>
    </main>
  );
}

