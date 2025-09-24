"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingCart, Star, TrendingUp } from "lucide-react"

export default function SellerAnalyticsPage() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalSales: 0,
    averageRating: 0,
    activePrompts: 0,
  })
  const [recentSales, setRecentSales] = useState<any[]>([])
  const [topPrompts, setTopPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchAnalytics()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
    }
  }

  const fetchAnalytics = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Get user's prompts
    const { data: prompts } = await supabase.from("prompts").select("*").eq("seller_id", user.id)

    if (!prompts) return

    // Calculate stats
    const totalEarnings = prompts.reduce((sum, prompt) => sum + prompt.total_sales * prompt.price, 0)
    const totalSales = prompts.reduce((sum, prompt) => sum + prompt.total_sales, 0)
    const averageRating =
      prompts.length > 0 ? prompts.reduce((sum, prompt) => sum + (prompt.rating || 0), 0) / prompts.length : 0
    const activePrompts = prompts.filter((prompt) => prompt.is_active).length

    setStats({
      totalEarnings,
      totalSales,
      averageRating,
      activePrompts,
    })

    // Get recent sales
    const { data: sales } = await supabase
      .from("purchases")
      .select(
        `
        *,
        prompts(title, price),
        profiles(display_name)
      `,
      )
      .in(
        "prompt_id",
        prompts.map((p) => p.id),
      )
      .order("purchased_at", { ascending: false })
      .limit(10)

    setRecentSales(sales || [])

    // Get top performing prompts
    const topPerforming = prompts.sort((a, b) => b.total_sales - a.total_sales).slice(0, 5)

    setTopPrompts(topPerforming)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho dos seus prompts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Receita total das vendas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">Prompts vendidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Média das avaliações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prompts Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePrompts}</div>
              <p className="text-xs text-muted-foreground">Prompts publicados</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSales.length > 0 ? (
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sale.prompts?.title}</p>
                        <p className="text-sm text-muted-foreground">Comprado por {sale.profiles?.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.purchased_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge variant="outline">R$ {sale.price_paid.toFixed(2)}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma venda ainda.</p>
              )}
            </CardContent>
          </Card>

          {/* Top Prompts */}
          <Card>
            <CardHeader>
              <CardTitle>Prompts Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              {topPrompts.length > 0 ? (
                <div className="space-y-4">
                  {topPrompts.map((prompt, index) => (
                    <div key={prompt.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{prompt.title}</p>
                          <p className="text-sm text-muted-foreground">
                            R$ {prompt.price.toFixed(2)} • ⭐ {prompt.rating?.toFixed(1) || "0.0"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{prompt.total_sales} vendas</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum prompt criado ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
