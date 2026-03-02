import { redirect } from "next/navigation"

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams
  const query = (sp.q || "").trim()

  if (!query) redirect("/")

  // 64 hex chars = hash (tx or block)
  if (query.length === 64 && /^[0-9a-fA-F]+$/.test(query)) {
    // Try as tx first — if it fails, treat as block hash
    // For simplicity, redirect to tx; the tx page will handle 404
    redirect(`/tx/${query}`)
  }

  // Longer than 16 chars = probably an address
  if (query.length > 16) {
    redirect(`/account/${query}`)
  }

  // Otherwise treat as block height
  redirect(`/block/${query}`)
}
