import Link from "next/link"
import { getDocSections, getDocsInSection } from "@/lib/content"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sections = getDocSections()

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 2xl:max-w-[85%]">
      <nav className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-[4.5rem] flex flex-col gap-6">
          {sections.map((section) => {
            const docs = getDocsInSection(section.slug)
            return (
              <div key={section.slug}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {docs.map((doc) => (
                    <li key={doc.slug.join("/")}>
                      <Link
                        href={`/${doc.slug.join("/")}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
