import type { NextApiRequest, NextApiResponse } from 'next'
import {NextResponse} from "next/server"
import {Client} from "@xmtp/xmtp-js"

type ResponseData = {
  message: string
}

const prom = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('done')
  }, 1000)
});

export async function GET(req: NextApiRequest) {
  try {
    // Client.create()
    // console.log('test', test)

  } catch (error) {
    console.log('error', error)
  }
    const res = await prom
    console.log('res', res)
    return NextResponse.json({ message: 'Hello from Next.js!' }, {status: 200})
}

// export async function POST(req: NextApiRequest) {
//   if (!req.body) {
//     return NextResponse.json({ message: 'No body provided' }, {status: 400})
//   }
//   const { address } = req.body
//   const test = await Client.canMessage(address)
//   console.log('test', test)
//   return NextResponse.json({ message: 'Hello from Next.js!' }, {status: 200})
// }

