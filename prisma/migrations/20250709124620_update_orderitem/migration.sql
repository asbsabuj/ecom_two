/*
  Warnings:

  - Made the column `isPaid` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDelivered` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "isPaid" SET NOT NULL,
ALTER COLUMN "paidAt" DROP NOT NULL,
ALTER COLUMN "isDelivered" SET NOT NULL,
ALTER COLUMN "deliveredAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" RENAME CONSTRAINT "orderItem_orderId_productId_pk" TO "orderitems_orderId_productId_pk";
