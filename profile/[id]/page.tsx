import { createClient } from "@/lib/server"
import { Navbar } from "@/components/navbar"
import { PromptCard } from "@/components/prompt-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart, Globe, Calendar, User } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface SellerProfilePageProps {
  params: {
    id: string
  }
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  const supabase = await createClient()

  console.log("[v0] Fetching seller profile for ID:", params.id)

  const { data: seller, error: sellerError } = await supabase.from("profiles").select("*").eq("id", params.id).single()

  console.log("[v0] Seller query result:", { seller, sellerError })

  if (sellerError) {
    console.log("[v0] Seller query error:", sellerError)
    notFound()
  }

  if (!seller) {
    console.log("[v0] No seller found for ID:", params.id)
    notFound()
  }

  const { data: prompts, error: promptsError } = await supabase
    .from("prompts")
    .select(
      `
      *,
      categories(name)
    `,
    )
    .eq("seller_id", params.id)
    .eq("is_active", true)
    .order("rating", { ascending: false })

  console.log("[v0] Prompts query result:", { prompts, promptsError })

  if (promptsError) {
    console.log("[v0] Prompts query error:", promptsError)
  }

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles(display_name),
      prompts(title)
    `,
    )
    .in("prompt_id", prompts?.map((p) => p.id) || [])
    .order("created_at", { ascending: false })
    .limit(10)

  console.log("[v0] Reviews query result:", { reviews, reviewsError })

  if (reviewsError) {
    console.log("[v0] Reviews query error:", reviewsError)
  }

  const totalPrompts = prompts?.length || 0
  const averagePrice = prompts?.length ? prompts.reduce((sum, p) => sum + p.price, 0) / prompts.length : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Seller Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">{seller.display_name?.[0] || "V"}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{seller.display_name || "Vendedor"}</h1>
                  <p className="text-muted-foreground mb-4">@{seller.username}</p>

                  {seller.bio && <p className="text-muted-foreground mb-4 max-w-2xl">{seller.bio}</p>}

                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{seller.rating?.toFixed(1) || "0.0"}</span>
                      <span className="text-muted-foreground">({reviews?.length || 0} avaliações)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <span>{seller.total_sales || 0} vendas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{totalPrompts} prompts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Membro desde {new Date(seller.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {seller.website_url && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={seller.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Seller's Prompts */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Prompts ({totalPrompts})</h2>
              {prompts && prompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {prompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      id={prompt.id}
                      title={prompt.title}
                      description={prompt.description}
                      price={prompt.price}
                      category={prompt.categories?.name || "Geral"}
                      rating={prompt.rating || 0}
                      totalSales={prompt.total_sales || 0}
                      sellerName={seller.display_name || "Vendedor"}
                      previewContent={prompt.preview_content}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">Este vendedor ainda não publicou nenhum prompt.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Avaliações Recentes</h2>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{review.profiles?.display_name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{review.profiles?.display_name}</span>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Prompt:{" "}
                              <Link href={`/prompt/${review.prompt_id}`} className="text-primary hover:underline">
                                {review.prompts?.title}
                              </Link>
                            </p>
                            {review.comment && <p className="text-sm">{review.comment}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">Ainda não há avaliações para este vendedor.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Prompts ativos:</span>
                  <span className="font-medium">{totalPrompts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de vendas:</span>
                  <span className="font-medium">{seller.total_sales || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avaliação média:</span>
                  <span className="font-medium">{seller.rating?.toFixed(1) || "0.0"} ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Preço médio:</span>
                  <span className="font-medium">R$ {averagePrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            {prompts && prompts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(prompts.map((p) => p.categories?.name).filter(Boolean))).map((category) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Interessado nos prompts deste vendedor? Entre em contato através dos prompts individuais.
                </p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/">Explorar Mais Prompts</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
