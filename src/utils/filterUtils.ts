import type { FilterOptions, ProductType } from '@/interfaces'

export function filterProducts(products: ProductType[], filters: FilterOptions | null): ProductType[] {
  if (!filters) return products

  let filtered = products.filter((product) => {
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false
    return true
  })

  return sortProducts(filtered, filters.sortBy)
}

export function sortProducts(products: ProductType[], sortBy: FilterOptions['sortBy']): ProductType[] {
  const sorted = [...products]

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    default:
      return sorted
  }
}