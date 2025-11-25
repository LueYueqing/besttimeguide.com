-- AlterTable
ALTER TABLE "qr_codes"
ADD COLUMN     "title" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "targetUrl" TEXT,
ADD COLUMN     "shortCode" TEXT,
ADD COLUMN     "lastScanAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_shortCode_key" ON "qr_codes"("shortCode");

