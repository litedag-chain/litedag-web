"use client"

import { useState } from "react"
import { Button } from "@litedag/ui/components/button"
import {
  Card,
  CardContent,
} from "@litedag/ui/components/card"
import { formatCoin } from "@/lib/rpc-client"
import { COIN } from "@litedag/shared/constants"
import { BalanceChart, type BalancePoint } from "@/components/balance-chart"
import { SendDialog } from "@/components/send-dialog"
import { ReceiveDialog } from "@/components/receive-dialog"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { formatPublicKey, type Wallet } from "@/lib/crypto"

export function BalanceHero({ balance, stakedBalance, pendingBalance, chartData, wallet, onBalanceChange }: {
  balance: number | null
  stakedBalance: number
  pendingBalance: number
  chartData: BalancePoint[]
  wallet: Wallet
  onBalanceChange: () => void
}) {
  const [sendOpen, setSendOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const available = balance !== null ? balance : 0
  const total = available + stakedBalance

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="font-display text-3xl font-bold tracking-tight">
                  {balance !== null ? `${formatCoin(total)} LDG` : "..."}
                </p>
                {balance !== null && (stakedBalance > 0 || pendingBalance > 0) && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>Available: <span className="font-mono font-medium text-foreground">{formatCoin(available)}</span></span>
                    {stakedBalance > 0 && (
                      <span>Staked: <span className="font-mono font-medium text-foreground">{formatCoin(stakedBalance)}</span></span>
                    )}
                    {pendingBalance > 0 && (
                      <span>Pending: <span className="font-mono font-medium text-foreground">{formatCoin(pendingBalance)}</span></span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setSendOpen(true)}>
                  <ArrowUpRight size={16} />
                  Send
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReceiveOpen(true)}>
                  <ArrowDownLeft size={16} />
                  Receive
                </Button>
              </div>
            </div>

            <BalanceChart data={chartData} />
          </div>
        </CardContent>
      </Card>

      <SendDialog
        wallet={wallet}
        open={sendOpen}
        onOpenChange={setSendOpen}
        onSent={onBalanceChange}
      />
      <ReceiveDialog
        address={wallet.address}
        publicKey={formatPublicKey(wallet.publicKey)}
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
      />
    </>
  )
}
