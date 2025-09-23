"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/client"
import { Navbar } from "@/components/navbar"
import { PromptCard } from "@/components/prompt-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const supabase = createClient()

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    } else {
      setLoading(false)
    }
  }, [initialQuery])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    const { data } = await supabase
      .from("prompts")
      .select(
        `
        *,
        categories(name),
        profiles(display_name)
      `,
      )
      .eq("is_active", true)
      .eq("approval_status", "approved") // Only show approved prompts in search results
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .order("rating", { ascending: false })

    setPrompts(data || [])
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim())
      // Update URL without page reload
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Buscar Prompts</h1>
          <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Digite sua busca..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Buscar</Button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : initialQuery ? (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                {prompts.length > 0
                  ? `${prompts.length} resultado${prompts.length !== 1 ? "s" : ""} para "${initialQuery}"`
                  : `Nenhum resultado encontrado para "${initialQuery}"`}
              </p>
            </div>
            {prompts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    sellerName={prompt.profiles?.display_name || "Vendedor"}
                    previewContent={prompt.preview_content}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Digite algo na busca para encontrar prompts.</p>
          </div>
        )}
      </div>
    </div>
  )
}
