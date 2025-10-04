"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

interface ApprovalActionsProps {
  promptId: string
}

export default function ApprovalActions({ promptId }: ApprovalActionsProps) {
  async function handleApprove() {
    const response = await fetch("/api/admin/approve-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId, action: "approve" }),
    })

    if (response.ok) {
      window.location.reload()
    }
  }

  async function handleReject(reason?: string) {
    const response = await fetch("/api/admin/approve-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId, action: "reject", reason }),
    })

    if (response.ok) {
      window.location.reload()
    }
  }

  return (
    <div className="flex gap-2 pt-4 border-t border-border">
      <Button onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
        <CheckCircle className="h-4 w-4 mr-2" />
        Aprovar
      </Button>

      <Button
        onClick={() => {
          const reason = prompt("Motivo da rejeição (opcional):")
          handleReject(reason || undefined)
        }}
        variant="destructive"
        className="flex-1"
      >
        <XCircle className="h-4 w-4 mr-2" />
        Rejeitar
      </Button>
    </div>
  )
}
