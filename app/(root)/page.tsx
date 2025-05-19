import ProductList from "@/components/shared/products/product-list"
import { getLatestProduct } from "@/lib/acions/product.action"

const Homepage = async () => {
  const latestProduct = await getLatestProduct()
  return (
    <>
      <ProductList data={latestProduct} title="New Arrivals" limit={4} />
    </>
  )
}

export default Homepage
