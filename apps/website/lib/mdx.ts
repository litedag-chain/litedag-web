import rehypeShiki from "@shikijs/rehype"
import type { MDXComponents } from "mdx/types"
import { compileMDX } from "next-mdx-remote/rsc"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import type { ShikiTransformer } from "shiki"

const langAttr: ShikiTransformer = {
  pre(node) {
    node.properties["data-language"] = this.options.lang
  },
}

const shikiOptions = {
  themes: {
    light: "github-light-default",
    dark: "github-dark-default",
  },
  defaultColor: false,
  defaultLanguage: "text",
  transformers: [langAttr],
}

export async function renderMDX(
  source: string,
  components?: MDXComponents,
) {
  const { content: mdxContent } = await compileMDX({
    source,
    components,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        format: "md",
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeShiki, shikiOptions]],
      },
    },
  })

  return mdxContent
}
