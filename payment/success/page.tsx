"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, Mail } from "lucide-react"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(true)
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const sessionId = searchParams.get("session_id")
  const promptId = searchParams.get("prompt_id")

  useEffect(() => {
    if (sessionId) {
      confirmPayment()
    }
  }, [sessionId])

  const confirmPayment = async () => {
    try {
      const response = await fetch("/api/stripe/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      })

      const result = await response.json()

      if (response.ok) {
        setConfirmationResult(result)
      } else {
        setError(result.error || "Erro ao confirmar pagamento")
      }
    } catch (err) {
      setError("Erro de conexão")
    } finally {
      setIsConfirming(false)
    }
  }

  if (isConfirming) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
              <p className="text-muted-foreground">Confirmando seu pagamento...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Erro no Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Pagamento Confirmado!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="font-medium">Prompt: {confirmationResult?.promptTitle}</p>
            <p className="text-sm text-muted-foreground">ID da Compra: {confirmationResult?.purchaseId}</p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Processamento Automático</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Seu prompt está sendo processado pela IA. Você receberá o resultado por email em alguns minutos.
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={() => router.push("/purchases")} className="w-full">
              Ver Minhas Compras
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Marketplace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
