"use client"

import { NewsBanner } from "@litedag/ui/components/banner"
import { milestones } from "@litedag/shared/milestones"

const recentDone = milestones
  .filter((m) => m.status === "done" && m.date)
  .reverse()

const latest = recentDone[0]
const latestDate = latest?.date ?? ""

export function WebsiteBanners() {
  if (!latest) return null

  return (
    <NewsBanner storageKey="ldg-website-changelog-seen" latestDate={latestDate} variant="success">
      {latest.title}
      {latest.description && ` — ${latest.description}`}
      {" "}
      <a href="/changelog" className="underline hover:opacity-80">View changelog</a>
    </NewsBanner>
  )
}
