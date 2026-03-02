import { getInfo, COIN } from "@/lib/rpc"

export async function GET() {
  const info = await getInfo()
  const supply = (info.circulating_supply / COIN).toFixed(2)
  return new Response(supply, {
    headers: { "Content-Type": "text/plain" },
  })
}
