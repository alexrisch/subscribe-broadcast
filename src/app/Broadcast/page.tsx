'use client'

import { useCallback, useState } from "react";
import { broadcastConfigs } from "../subscribe/broadcastConfigs";

const {address: broadcastAddress, name} = broadcastConfigs[0]


export default function Broadcast() {

  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  const sendBroadcast = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:6989/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          address: broadcastAddress,
        }),
      });
      await response.json();
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [text]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Broadcast to {name}</h1>
      <input
        className="border-2 border-gray-300 rounded-lg p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to broadcast"
      />
      <button
        className="bg-blue-500 text-white rounded-lg p-2 mt-4"
        onClick={sendBroadcast}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Broadcast'}
      </button>
    </main>
  );
}