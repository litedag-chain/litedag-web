"use client"

import { Banner, NewsBanner } from "@litedag/ui/components/banner"
import { milestones } from "@litedag/shared/milestones"

const walletChanges = milestones
  .filter((m) => m.status === "done" && m.apps?.includes("wallet") && m.date)
  .reverse()

const latestWalletDate = walletChanges[0]?.date ?? ""

export function WalletBanners() {
  return (
    <>
      <Banner storageKey="ldg-dismiss-experimental" variant="warning">
        This web wallet is experimental. For a more battle-tested experience use the{" "}
        <a href="https://github.com/litedag-chain/litedag-blockchain/releases" className="underline hover:opacity-80">CLI wallet</a>.
        {" "}Use at your own risk.
      </Banner>
      {latestWalletDate && walletChanges.length > 0 && (
        <NewsBanner storageKey="ldg-wallet-changelog-seen" latestDate={latestWalletDate} variant="info">
          {walletChanges.length === 1
            ? walletChanges[0]!.title
            : `${walletChanges.length} updates`
          }
          {walletChanges[0]!.description && ` — ${walletChanges[0]!.description}`}
          {" "}
          <a href="https://litedag.com/changelog" className="underline hover:opacity-80">View changelog</a>
        </NewsBanner>
      )}
    </>
  )
}
