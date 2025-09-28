"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

interface ReviewFormProps {
  promptId: string
  userId: string
  onReviewSubmitted: () => void
}

export function ReviewForm({ promptId, userId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Por favor, selecione uma avaliação")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("reviews").insert({
        prompt_id: promptId,
        reviewer_id: userId,
        rating,
        comment: comment.trim() || null,
      })

      if (error) throw error

      setRating(0)
      setComment("")
      onReviewSubmitted()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliar este Prompt</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Sua avaliação</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="text-sm font-medium mb-2 block">
              Comentário (opcional)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Compartilhe sua experiência com este prompt..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{comment.length}/500 caracteres</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading || rating === 0}>
            {loading ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
