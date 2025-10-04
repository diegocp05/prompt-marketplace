import { createServerClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, FileText } from "lucide-react"
import ApprovalActions from "./ApprovalActions"

async function AdminDashboard() {
  const supabase = await createServerClient()

  console.log("Verificando acesso admin...")

  // Verificar se o usuário está logado e é admin
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log("User:", user?.id, "Error:", userError)

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Verificar se é admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  console.log("Profile:", profile, "Error:", profileError)

  if (profileError || !profile?.is_admin) {
    console.log("User is not admin, showing error page...")
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-card border border-border rounded-lg p-8">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-card-foreground mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground mb-6">
              Você não tem permissões de administrador para acessar esta página.
            </p>
            <div className="space-y-3">
              <a
                href="/"
                className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Voltar ao Marketplace
              </a>
              <a
                href="/dashboard"
                className="block w-full px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
              >
                Ir para Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Buscar prompts pendentes
  const { data: pendingPrompts } = await supabase
    .from("prompts")
    .select(`
      *,
      profiles!prompts_seller_id_fkey(display_name)
    `)
    .eq("approval_status", "pending")
    .order("created_at", { ascending: false })

  // Buscar estatísticas
  const { data: stats } = await supabase.from("prompts").select("approval_status")

  const totalPrompts = stats?.length || 0
  const pendingCount = stats?.filter((p) => p.approval_status === "pending").length || 0
  const approvedCount = stats?.filter((p) => p.approval_status === "approved").length || 0
  const rejectedCount = stats?.filter((p) => p.approval_status === "rejected").length || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">Dashboard Administrativo</h1>
              <p className="text-muted-foreground mt-2">Gerencie prompts e aprovações do marketplace</p>
            </div>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-background hover:bg-muted transition-colors"
            >
              ← Voltar ao Marketplace
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Prompts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{totalPrompts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{rejectedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Prompts Pendentes */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Prompts Pendentes de Aprovação</h2>

          {pendingPrompts && pendingPrompts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingPrompts.map((prompt) => (
                <PromptApprovalCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Nenhum prompt pendente</h3>
                  <p className="text-muted-foreground">Todos os prompts foram revisados e aprovados.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function PromptApprovalCard({ prompt }: { prompt: any }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-card-foreground">{prompt.title}</CardTitle>
            <CardDescription className="mt-1">
              Por {prompt.profiles?.display_name || "Usuário"} • R$ {prompt.price}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-card-foreground mb-2">Descrição:</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">{prompt.description}</p>
        </div>

        <div>
          <h4 className="font-medium text-card-foreground mb-2">Prompt Completo:</h4>
          <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
            <p className="text-sm text-card-foreground whitespace-pre-wrap">{prompt.content}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium text-card-foreground">Categoria:</span>
            <p className="text-muted-foreground">{prompt.category}</p>
          </div>
          <div>
            <span className="font-medium text-card-foreground">Modelo IA:</span>
            <p className="text-muted-foreground">{prompt.ai_model || "gpt-4o-mini"}</p>
          </div>
        </div>

        <ApprovalActions promptId={prompt.id} />
      </CardContent>
    </Card>
  )
}

export default AdminDashboard
