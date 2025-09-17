"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

interface FilterState {
  categories: string[]
  priceRange: [number, number]
  rating: number
  sortBy: string
}

interface PromptFiltersProps {
  categories: Array<{ id: string; name: string; slug: string }>
  onFiltersChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

export function PromptFilters({ categories, onFiltersChange, initialFilters }: PromptFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: initialFilters?.categories || [],
    priceRange: initialFilters?.priceRange || [0, 100],
    rating: initialFilters?.rating || 0,
    sortBy: initialFilters?.sortBy || "rating",
  })

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter((id) => id !== categoryId)
    updateFilters({ categories: newCategories })
  }

  const clearFilters = () => {
    const clearedFilters = {
      categories: [],
      priceRange: [0, 100] as [number, number],
      rating: 0,
      sortBy: "rating",
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sort By */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Ordenar por</Label>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Melhor Avaliação</SelectItem>
              <SelectItem value="price_asc">Menor Preço</SelectItem>
              <SelectItem value="price_desc">Maior Preço</SelectItem>
              <SelectItem value="newest">Mais Recentes</SelectItem>
              <SelectItem value="popular">Mais Vendidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categories */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Categorias</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                />
                <Label htmlFor={category.id} className="text-sm cursor-pointer">
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Faixa de Preço: R$ {filters.priceRange[0]} - R$ {filters.priceRange[1]}
          </Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
            max={200}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        {/* Rating */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Avaliação Mínima: {filters.rating} estrelas</Label>
          <Slider
            value={[filters.rating]}
            onValueChange={(value) => updateFilters({ rating: value[0] })}
            max={5}
            min={0}
            step={0.5}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}
