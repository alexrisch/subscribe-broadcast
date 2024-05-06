import { createWalletClient, custom, http } from 'viem'
import { mainnet } from 'viem/chains'

export const createConsentMessage = (peerAddress: string,
  timestamp: number
): string =>  {
  return (
    'XMTP : Grant inbox consent to sender\n' +
    '\n' +
    `Current Time: ${new Date(timestamp).toUTCString()}\n` +
    `From Address: ${peerAddress}\n` +
    '\n' +
    'For more info: https://xmtp.org/signatures/'
  )
}

const transport = typeof window !== 'undefined' ? custom((window as any).ethereum!) : http()
console.log('transport', transport)
console.log('window type',  typeof window !== 'undefined')

export const walletClient = createWalletClient({
  chain: mainnet,
  transport,
})

export const connectWallet = async () => {
  const addresses = await walletClient.getAddresses()
  console.log('addresses', addresses)
  return addresses[0]
};
