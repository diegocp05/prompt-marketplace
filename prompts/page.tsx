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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"

export default function SellerPromptsPage() {
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchPrompts()
  }, [searchQuery, statusFilter])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
    }
  }

  const fetchPrompts = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from("prompts")
      .select(
        `
        *,
        categories(name)
      `,
      )
      .eq("seller_id", user.id)

    // Apply search filter
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      query = query.eq("is_active", statusFilter === "active")
    }

    query = query.order("created_at", { ascending: false })

    const { data } = await query
    setPrompts(data || [])
    setLoading(false)
  }

  const togglePromptStatus = async (promptId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("prompts").update({ is_active: !currentStatus }).eq("id", promptId)

    if (!error) {
      fetchPrompts()
    }
  }

  const deletePrompt = async (promptId: string) => {
    if (confirm("Tem certeza que deseja excluir este prompt? Esta ação não pode ser desfeita.")) {
      const { error } = await supabase.from("prompts").delete().eq("id", promptId)

      if (!error) {
        fetchPrompts()
      }
    }
  }

  const filteredPrompts = prompts.filter((prompt) => {
    if (statusFilter === "active") return prompt.is_active
    if (statusFilter === "inactive") return !prompt.is_active
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meus Prompts</h1>
            <p className="text-muted-foreground">Gerencie seus prompts e acompanhe as vendas</p>
          </div>
          <Button asChild>
            <Link href="/seller/create">
              <Plus className="h-4 w-4 mr-2" />
              Novo Prompt
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar meus prompts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prompts List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredPrompts.length > 0 ? (
          <div className="space-y-4">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{prompt.title}</h3>
                        <Badge variant={prompt.is_active ? "default" : "secondary"}>
                          {prompt.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        {prompt.categories && <Badge variant="outline">{prompt.categories.name}</Badge>}
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{prompt.description}</p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="font-medium text-primary text-lg">R$ {prompt.price.toFixed(2)}</span>
                        <span>⭐ {prompt.rating?.toFixed(1) || "0.0"}</span>
                        <span>🛒 {prompt.total_sales || 0} vendas</span>
                        <span>📅 {new Date(prompt.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/prompt/${prompt.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/seller/edit/${prompt.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePromptStatus(prompt.id, prompt.is_active)}>
                          {prompt.is_active ? (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-2" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deletePrompt(prompt.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Nenhum prompt encontrado com os filtros aplicados."
                  : "Você ainda não criou nenhum prompt."}
              </p>
              <Button asChild>
                <Link href="/seller/create">Criar Primeiro Prompt</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
