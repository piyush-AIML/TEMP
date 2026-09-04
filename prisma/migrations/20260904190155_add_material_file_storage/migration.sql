-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('UPLOADTHING', 'S3');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "fileKey" TEXT,
ADD COLUMN     "fileMeta" JSONB,
ADD COLUMN     "fileProvider" "StorageProvider";
