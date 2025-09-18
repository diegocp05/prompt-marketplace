import { createClient } from "@/lib/server"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, ShoppingCart, Calendar, Tag } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PurchaseButton } from "@/components/purchase-button"
import { ReviewForm } from "@/components/review-form"

interface PromptPageProps {
  params: {
    id: string
  }
}

export default async function PromptPage({ params }: PromptPageProps) {
  const supabase = await createClient()

  // Get prompt details
  const { data: prompt } = await supabase
    .from("prompts")
    .select(
      `
      *,
      categories(name, slug),
      profiles(id, display_name, username, bio, rating, total_sales)
    `,
    )
    .eq("id", params.id)
    .eq("is_active", true)
    .single()

  if (!prompt) {
    notFound()
  }

  // Get reviews for this prompt
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles(display_name, username)
    `,
    )
    .eq("prompt_id", params.id)
    .order("created_at", { ascending: false })

  // Check if user is authenticated and if they already purchased this prompt
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let hasPurchased = false
  let hasReviewed = false
  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("prompt_id", params.id)
      .single()
    hasPurchased = !!purchase

    // Check if user has already reviewed this prompt
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("reviewer_id", user.id)
      .eq("prompt_id", params.id)
      .single()
    hasReviewed = !!existingReview
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{prompt.categories?.name}</Badge>
                {prompt.tags?.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl font-bold mb-4 text-balance">{prompt.title}</h1>
              <p className="text-lg text-muted-foreground mb-6 text-pretty">{prompt.description}</p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{prompt.rating?.toFixed(1) || "0.0"}</span>
                  <span>({reviews?.length || 0} avaliações)</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingCart className="h-4 w-4" />
                  <span>{prompt.total_sales || 0} vendas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Criado em {new Date(prompt.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            {prompt.preview_content && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview do Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{prompt.preview_content}</pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Content (only if purchased) */}
            {hasPurchased && (
              <Card>
                <CardHeader>
                  <CardTitle>Prompt Completo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{prompt.content}</pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Form (only if purchased and not reviewed) */}
            {hasPurchased && !hasReviewed && user && (
              <ReviewForm promptId={params.id} userId={user.id} onReviewSubmitted={() => window.location.reload()} />
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliações ({reviews?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{review.profiles?.display_name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{review.profiles?.display_name}</p>
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
                          </div>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(review.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Ainda não há avaliações para este prompt.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-4">R$ {prompt.price.toFixed(2)}</div>
                {hasPurchased ? (
                  <div className="space-y-2">
                    <Badge variant="default" className="w-full justify-center py-2">
                      Já Comprado
                    </Badge>
                    <p className="text-xs text-muted-foreground text-center">
                      Você já possui este prompt e pode ver o conteúdo completo acima.
                    </p>
                  </div>
                ) : user ? (
                  <PurchaseButton
                    promptId={prompt.id}
                    promptTitle={prompt.title}
                    price={prompt.price}
                    sellerId={prompt.seller_id}
                    userId={user.id}
                    promptContent={prompt.content}
                  />
                ) : (
                  <div className="space-y-2">
                    <Button asChild className="w-full" size="lg">
                      <Link href="/auth/login">Entrar para Comprar</Link>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">Faça login para comprar este prompt</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sobre o Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback>{prompt.profiles?.display_name?.[0] || "V"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{prompt.profiles?.display_name}</p>
                    <p className="text-sm text-muted-foreground">@{prompt.profiles?.username}</p>
                  </div>
                </div>

                {prompt.profiles?.bio && <p className="text-sm text-muted-foreground mb-4">{prompt.profiles.bio}</p>}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avaliação:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{prompt.profiles?.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total de vendas:</span>
                    <span>{prompt.profiles?.total_sales || 0}</span>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full mt-4 bg-transparent">
                  <Link href={`/seller/profile/${prompt.profiles?.id}`}>Ver Perfil</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Related Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prompts Relacionados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Explore outros prompts da categoria {prompt.categories?.name}
                </p>
                <Button asChild variant="outline" className="w-full mt-4 bg-transparent">
                  <Link href={`/category/${prompt.categories?.slug}`}>Ver Categoria</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
