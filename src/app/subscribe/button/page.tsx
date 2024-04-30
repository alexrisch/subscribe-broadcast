'use client'

import { useEffect, useState } from "react";
import { createConsentMessage, connectWallet, walletClient } from "./utils";

const BROADCAST_ADDRESS = '0x19BA6203bCe4eb1585d70cca4815E65BF1FC0cD7'


const styles = {
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
};


export default function SubscribeButton() {
  // State for loading status
  const [loading, setLoading] = useState(false);
  // State for subscription status
  // const [subscriptionStatus, setSubscriptionStatus] = useState(label);
  // State for consent log
  const [consentLog, setConsentLog] = useState("");
  const [userAddress, setUserAddress] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    const loadUserAddress = async () => {
      const account = await connectWallet();
      setUserAddress(account);
      // const {d} = await fetch('app/api/subscribe/lookup')
    };
    loadUserAddress();
  }, [])

  // Define the handleClick function
  const handleClick = async () => {
    try {
      // Set loading to true
      setLoading(true);
      // Get the subscriber
      const message = createConsentMessage(BROADCAST_ADDRESS, Date.now())
      // const signature = await walletClient.signMessage({ 
      //   account,
      //   message,
      // })

      // console.log('here1111', signature)

      // // Set the subscription label
      // setSubscriptionStatus("Consent State: " + state);

      // // Set loading to false
      // setLoading(false);
    } catch (error) {
      // If onError function exists, call it with the error
      // if (typeof onError === "function") onError(error);
      // // Log the error
      // console.log(error);
    }
  }; 

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div
        style={styles.SubscribeButtonContainer}
        className={`Subscribe ${loading ? "loading" : ""}`}>
        {/* <small>Sender address: {senderAddress}</small> */}
        <button style={styles.SubscribeButton} onClick={handleClick}>
          {loading ? "Loading... " : 'subscriptionStatus'}
        </button>
      </div>
    </main>
  );
}

