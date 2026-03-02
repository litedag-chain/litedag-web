import Link from "next/link"
import { getDocSections, getDocsInSection } from "@/lib/content"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@litedag/ui/components/card"

export const metadata = {
  title: "Documentation",
}

export default function DocsIndex() {
  const sections = getDocSections()

  return (
    <div>
      <h1>Documentation</h1>
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        {sections.map((section) => {
          const docs = getDocsInSection(section.slug)
          return (
            <Card key={section.slug}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>
                  <ul className="mt-2 flex flex-col gap-1">
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
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
