import { getProductBySlug } from "@/lib/acions/product.action"
import { notFound } from "next/navigation"
import ProductPrice from "@/components/shared/products/product-price"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProductImages from "@/components/shared/products/product-images"
import AddToCart from "@/components/shared/products/add-to-cart"
import { getMyCart } from "@/lib/acions/cart.action"
import ReviewList from "./review-list"
import { auth } from "@/auth"
import Rating from "@/components/shared/products/rating"

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await props.params

  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const session = await auth()
  const userId = session?.user?.id

  const cart = await getMyCart()

  return (
    <>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5 ">
          <div className="col-span-2">
            <ProductImages images={product.image} />
          </div>
          <div className="col-span-2 p-5">
            <div className="flex flex-col gap-6">
              <p>
                {product.brand} {product.category}
              </p>
              <h1 className="h3-bold">{product.name}</h1>
              <Rating value={Number(product.rating)} />
              <p>{product.numReviews} review(s)</p>
              <div className=" flex flex-col sm:flex-row sm:items-center gap-3">
                <ProductPrice
                  value={Number(product.price)}
                  className="w-24 rounded-full bg-green-100 text-green-700 px-5 py-2"
                />
              </div>
            </div>
            <div className="mt-10">
              <p className="font-semibold">Description</p>
              <p>{product.description}</p>
            </div>
          </div>
          <div>
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex justify-between">
                  <div>Price</div>
                  <div>
                    <ProductPrice value={Number(product.price)} className="" />
                  </div>
                </div>
                <div className="mb-2 flex justify-between">
                  <div>Status</div>
                  {product.stock > 0 ? (
                    <Badge variant="outline">In Stock</Badge>
                  ) : (
                    <Badge variant={"destructive"}>Out of Stock</Badge>
                  )}
                </div>
                {product.stock > 0 && (
                  <div className="flex-center">
                    <AddToCart
                      cart={cart}
                      item={{
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        qty: 1,
                        image: product.image![0],
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="mt-12">
        <h2 className="h2-bold">Customer Reviews</h2>
        <ReviewList
          userId={userId || ""}
          productId={product.id}
          productSlug={product.slug}
        />
      </section>
    </>
  )
}

export default ProductDetailsPage
