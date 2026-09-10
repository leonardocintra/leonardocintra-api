/*
  Warnings:

  - You are about to drop the `PostComments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostContents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostComments" DROP CONSTRAINT "PostComments_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostContents" DROP CONSTRAINT "PostContents_postId_fkey";

-- DropTable
DROP TABLE "PostComments";

-- DropTable
DROP TABLE "PostContents";

-- DropTable
DROP TABLE "PostTags";

-- DropTable
DROP TABLE "Posts";

-- DropEnum
DROP TYPE "PostStatus";
