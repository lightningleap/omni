-- Baseline for everything applied to production outside migrations.
--
-- The migration history stopped at 20260330185533_sync_schema (applied
-- 2026-04-07). Every schema change since — the ADULT/KIDS split, refunds and
-- disputes, order tracking, the Design Studio's product source — reached
-- production through `prisma db push`, which writes no history. A fresh
-- database built from this folder alone would therefore be missing all of it.
--
-- This file closes that gap: replaying the folder now reproduces the current
-- schema.prisma, so a deploy on a new server is a repeatable step again.
--
-- Production has already had every statement below applied by db push, so it
-- is marked as applied there rather than run:
--     prisma migrate resolve --applied 20260902120000_baseline_current_schema
-- Running it against production would drop columns that db push already
-- removed and fail. On any NEW database it runs normally.

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('LIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('ADULT', 'KIDS');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'DELIVERED';
ALTER TYPE "OrderStatus" ADD VALUE 'REFUNDED';
ALTER TYPE "OrderStatus" ADD VALUE 'PARTIALLY_REFUNDED';
ALTER TYPE "OrderStatus" ADD VALUE 'DISPUTED';
ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_FAILED';
ALTER TYPE "OrderStatus" ADD VALUE 'MANUAL_INTERVENTION_REQUIRED';

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "access_token",
DROP COLUMN "expires_at",
DROP COLUMN "id_token",
DROP COLUMN "refresh_token",
DROP COLUMN "scope",
DROP COLUMN "session_state",
DROP COLUMN "token_type";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "carrier" TEXT,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "orderNumber" TEXT,
ADD COLUMN     "profit" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "refundedAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "totalPaid" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "trackingUrl" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "priceAtPurchase",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isPublished",
ADD COLUMN     "audience" "Audience" NOT NULL DEFAULT 'ADULT',
ADD COLUMN     "collectionId" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'SYNCED',
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "image",
DROP COLUMN "updatedAt",
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "StoreConfig" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "flashSaleActive" BOOLEAN NOT NULL DEFAULT false,
    "flashSaleEndsAt" TIMESTAMP(3),
    "flashSaleMessage" TEXT NOT NULL DEFAULT 'LIMITED DROP ENDING SOON',
    "heroVideoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "heroImageUrl" TEXT,
    "promoAnnouncement" TEXT,
    "welcomeActive" BOOLEAN NOT NULL DEFAULT true,
    "welcomeTitle" TEXT NOT NULL DEFAULT '10%',
    "welcomeSubtitle" TEXT NOT NULL DEFAULT 'OFF YOUR FIRST ORDER',
    "welcomeDescription" TEXT NOT NULL DEFAULT 'JOIN THE CLUB FOR EXCLUSIVE ACCESS.',

    CONSTRAINT "StoreConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryItem" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "customImageUrl" TEXT,
    "customDescription" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoveryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LookbookImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LookbookImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscoveryItem_section_idx" ON "DiscoveryItem"("section");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveryItem_section_collectionId_key" ON "DiscoveryItem"("section", "collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_handle_key" ON "Collection"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "DiscoveryItem" ADD CONSTRAINT "DiscoveryItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

