import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface CategoryCardProps {
  name: string
  description: string
  slug: string
  icon: LucideIcon
  promptCount: number
}

export function CategoryCard({ name, description, slug, icon: Icon, promptCount }: CategoryCardProps) {
  return (
    <Link href={`/category/${slug}`}>
      <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
        <CardContent className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
          <p className="text-xs text-muted-foreground">{promptCount} prompts</p>
        </CardContent>
      </Card>
    </Link>
  )
}
