import { NextRequest, NextResponse } from "next/server"

const NODE_RPC_URL = process.env.NODE_RPC_URL || "http://127.0.0.1:6311"

export async function POST(req: NextRequest) {
  const body = await req.text()

  const res = await fetch(NODE_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

  const data = await res.text()
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  })
}
