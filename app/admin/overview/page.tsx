import { Metadata } from "next"
import { auth } from "@/auth"
import { getOrderSummary } from "@/lib/acions/order.action"
import {
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
} from "@/components/ui/table"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BadgeDollarSign, CreditCard, User, Barcode } from "lucide-react"
import { formatNumber, formatCurrency, formatDateTime } from "@/lib/utils"
import { requireAdmin } from "@/lib/auth-guard"
import Chart from "./chart"

export const metadata: Metadata = {
  title: "Admin Dashboard",
}

const AdminOverviewPage = async () => {
  await requireAdmin()
  const session = await auth()

  if (session?.user?.role !== "admin") throw new Error("User is not authorized")

  const summary = await getOrderSummary()

  return (
    <div className="space-y-2">
      <h1 className="h2-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BadgeDollarSign />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatCurrency(
              summary.totalSales._sum.totalPrice?.toString() || 0
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatNumber(summary.ordersCount)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <User />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatNumber(summary.usersCount)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Barcode />
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatNumber(summary.productsCount)}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              data={{
                salesData: summary.salesData,
              }}
            />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BUYER</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>TOTAL</TableHead>
                  <TableHead>ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.latestSales.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {order?.user?.name ? order.user.name : "Deleted User"}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(order.createdAt).dateOnly}
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                    <TableCell>
                      <Link href={`/order/${order.id}`}>
                        <span className="px-2">Details</span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminOverviewPage
