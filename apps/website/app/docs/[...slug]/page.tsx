import { notFound } from "next/navigation"
import { getAllDocs, getDocBySlug } from "@/lib/content"
import { renderMDX } from "@/lib/mdx"

type Props = {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const docs = getAllDocs()
  return docs
    .filter((d) => d.content.length > 0)
    .map((d) => ({ slug: d.slug.slice(1) }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const doc = getDocBySlug(["docs", ...slug])
  if (!doc) return {}
  return {
    title: doc.title,
    description: doc.description,
  }
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params
  const doc = getDocBySlug(["docs", ...slug])
  if (!doc || doc.content.length === 0) notFound()

  const content = await renderMDX(doc.content)

  return (
    <div>
      <h1>{doc.title}</h1>
      {doc.readingTime.words > 0 && (
        <p className="text-sm text-muted-foreground">{doc.readingTime.text}</p>
      )}
      {content}
    </div>
  )
}
