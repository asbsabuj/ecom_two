import { requireAdmin } from "@/lib/auth-guard"
import Link from "next/link"
import { getAllProducts, deleteProduct } from "@/lib/acions/product.action"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import Pagination from "@/components/shared/Pagination"
import { formatCurrency, formatId } from "@/lib/utils"
import DeleteDialog from "@/components/shared/delete-dialog"

const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page: string
    query: string
    category: string
  }>
}) => {
  await requireAdmin()

  const searchParams = await props.searchParams

  const page = Number(searchParams.page) || 1
  const searchText = searchParams.query || ""
  const category = searchParams.category || ""

  const products = await getAllProducts({
    page,
    query: searchText,
    category,
  })

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <h1 className="h2-bold">Products</h1>
        <Button asChild variant="default">
          <Link href="/admin/products/create">Create Product</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>PRICE</TableHead>
            <TableHead>CATEGORY</TableHead>
            <TableHead>STOCK</TableHead>
            <TableHead>RATINGS</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.data.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{formatId(product.id)}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.rating}</TableCell>
              <TableCell className="flex gap-1">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/prodcts/${product.id}`}>Edit</Link>
                </Button>
                <DeleteDialog id={product.id} action={deleteProduct} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {products?.totalPages && products.totalPages > 1 && (
        <Pagination page={page} totalPages={products.totalPages} />
      )}
    </div>
  )
}

export default AdminProductsPage
