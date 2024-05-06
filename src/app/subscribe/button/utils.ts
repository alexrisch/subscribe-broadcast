import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const createConsentMessage = (peerAddress: string,
  timestamp: number
): string =>  {
  return (
    'XMTP : Grant inbox consent to sender\n' +
    '\n' +
    `Current Time: ${timestamp}\n` +
    `From Address: ${peerAddress}\n` +
    '\n' +
    'For more info: https://xmtp.org/signatures/'
  )
}

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(),
})

export const connectWallet = async () => {
  const [account] = await walletClient.getAddresses()
  return account
};
