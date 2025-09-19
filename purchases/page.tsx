"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Star, Download } from "lucide-react"
import Link from "next/link"

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchPurchases()
  }, [searchQuery, sortBy])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
    }
  }

  const fetchPurchases = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from("purchases")
      .select(
        `
        *,
        prompts(id, title, description, price, rating, categories(name)),
        profiles!prompts_seller_id_fkey(display_name)
      `,
      )
      .eq("buyer_id", user.id)

    // Apply search filter
    if (searchQuery) {
      query = query.or(`prompts.title.ilike.%${searchQuery}%,prompts.description.ilike.%${searchQuery}%`)
    }

    // Apply sorting
    switch (sortBy) {
      case "oldest":
        query = query.order("purchased_at", { ascending: true })
        break
      case "price_high":
        query = query.order("price_paid", { ascending: false })
        break
      case "price_low":
        query = query.order("price_paid", { ascending: true })
        break
      default:
        query = query.order("purchased_at", { ascending: false })
    }

    const { data } = await query
    setPurchases(data || [])
    setLoading(false)
  }

  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.price_paid, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minhas Compras</h1>
          <p className="text-muted-foreground">Gerencie seus prompts comprados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Compras</p>
                  <p className="text-2xl font-bold">{purchases.length}</p>
                </div>
                <Download className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Gasto</p>
                  <p className="text-2xl font-bold">R$ {totalSpent.toFixed(2)}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Média por Prompt</p>
                  <p className="text-2xl font-bold">
                    R$ {purchases.length > 0 ? (totalSpent / purchases.length).toFixed(2) : "0.00"}
                  </p>
                </div>
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar prompts comprados..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais Recentes</SelectItem>
              <SelectItem value="oldest">Mais Antigos</SelectItem>
              <SelectItem value="price_high">Maior Preço</SelectItem>
              <SelectItem value="price_low">Menor Preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Purchases List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : purchases.length > 0 ? (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{purchase.prompts?.title}</h3>
                        {purchase.prompts?.categories && (
                          <Badge variant="outline">{purchase.prompts.categories.name}</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{purchase.prompts?.description}</p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="font-medium text-primary text-lg">R$ {purchase.price_paid.toFixed(2)}</span>
                        <span>⭐ {purchase.prompts?.rating?.toFixed(1) || "0.0"}</span>
                        <span>Vendido por {purchase.profiles?.display_name}</span>
                        <span>📅 {new Date(purchase.purchased_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={`/prompt/${purchase.prompts?.id}`}>
                          <Download className="h-4 w-4 mr-2" />
                          Acessar
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Nenhuma compra encontrada com os filtros aplicados."
                  : "Você ainda não comprou nenhum prompt."}
              </p>
              <Button asChild>
                <Link href="/">Explorar Prompts</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
