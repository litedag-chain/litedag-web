import Link from "next/link"
import { getDocSections, getDocsInSection } from "@/lib/content"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sections = getDocSections()

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <nav className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-8 flex flex-col gap-6">
          {sections.map((section) => {
            const docs = getDocsInSection(section.slug)
            return (
              <div key={section.slug}>
                <h3 className="mb-2 text-sm font-semibold">{section.title}</h3>
                <ul className="flex flex-col gap-1">
                  {docs.map((doc) => (
                    <li key={doc.slug.join("/")}>
                      <Link
                        href={`/${doc.slug.join("/")}`}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {doc.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </nav>
      <article className="prose dark:prose-invert min-w-0 max-w-none flex-1">
        {children}
      </article>
    </div>
  )
}
