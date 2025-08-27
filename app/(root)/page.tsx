import ProductList from "@/components/shared/products/product-list"
import {
  getLatestProduct,
  getFeaturedProducts,
} from "@/lib/acions/product.action"
import ProductCarousel from "@/components/shared/products/product-carousel"
import ViewAllProductsButton from "@/components/view-all-products-button"

const Homepage = async () => {
  const latestProduct = await getLatestProduct()
  const featuredProducts = await getFeaturedProducts()
  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProduct} title="New Arrivals" limit={4} />
      <ViewAllProductsButton />
    </>
  )
}

export default Homepage
