import { createClient } from "@/lib/server"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, Star } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface PurchaseSuccessPageProps {
  searchParams: {
    promptId?: string
  }
}

export default async function PurchaseSuccessPage({ searchParams }: PurchaseSuccessPageProps) {
  const { promptId } = searchParams

  if (!promptId) {
    redirect("/")
  }

  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get purchase details
  const { data: purchase } = await supabase
    .from("purchases")
    .select(
      `
      *,
      prompts(title, description, price, seller_id),
      profiles!prompts_seller_id_fkey(display_name)
    `,
    )
    .eq("buyer_id", user.id)
    .eq("prompt_id", promptId)
    .single()

  if (!purchase) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Compra Realizada com Sucesso!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">{purchase.prompts?.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{purchase.prompts?.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">R$ {purchase.price_paid.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">
                  Comprado em {new Date(purchase.purchased_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">O que você pode fazer agora:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-600" />
                  <span>Acessar o prompt completo na página do produto</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Avaliar o prompt após usar</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href={`/prompt/${promptId}`}>
                  <Download className="h-4 w-4 mr-2" />
                  Acessar Prompt
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/purchases">Ver Minhas Compras</Link>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Gostou da experiência?</p>
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Explorar Mais Prompts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
