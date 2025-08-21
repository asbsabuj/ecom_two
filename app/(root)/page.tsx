import ProductList from "@/components/shared/products/product-list"
import {
  getLatestProduct,
  getFeaturedProducts,
} from "@/lib/acions/product.action"
import ProductCarousel from "@/components/shared/products/product-carousel"

const Homepage = async () => {
  const latestProduct = await getLatestProduct()
  const featuredProducts = await getFeaturedProducts()
  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProduct} title="New Arrivals" limit={4} />
    </>
  )
}

export default Homepage
