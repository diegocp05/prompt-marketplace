import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, User } from "lucide-react"
import Link from "next/link"

interface PromptCardProps {
  id: string
  title: string
  description: string
  price: number
  category: string
  rating: number
  totalSales: number
  sellerName: string
  previewContent?: string
}

export function PromptCard({
  id,
  title,
  description,
  price,
  category,
  rating,
  totalSales,
  sellerName,
  previewContent,
}: PromptCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">{title}</h3>
          <Badge variant="secondary" className="shrink-0">
            {category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {previewContent && (
          <div className="bg-muted/50 rounded-lg p-3 mb-3">
            <p className="text-xs text-foreground/70 mb-1">Preview:</p>
            <p className="text-sm line-clamp-3 font-mono">{previewContent}</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{sellerName}</span>
          </div>
          <span>{totalSales} vendas</span>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex items-center justify-between">
        <div className="text-2xl font-bold text-primary">R$ {price.toFixed(2)}</div>
        <Button asChild size="sm">
          <Link href={`/prompt/${id}`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
