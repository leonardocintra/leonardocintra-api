-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateTable
CREATE TABLE "Posts" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'draft',
    "publicoAlvo" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostContents" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "contentMarkdown" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostContents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTags" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "tag" VARCHAR(50) NOT NULL,

    CONSTRAINT "PostTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostComments" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "author" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostComments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Posts_slug_key" ON "Posts"("slug");

-- CreateIndex
CREATE INDEX "Posts_slug_idx" ON "Posts"("slug");

-- CreateIndex
CREATE INDEX "idx_posts_published_at" ON "Posts"("publishedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PostContents_postId_key" ON "PostContents"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTags_postId_tag_key" ON "PostTags"("postId", "tag");

-- AddForeignKey
ALTER TABLE "PostContents" ADD CONSTRAINT "PostContents_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComments" ADD CONSTRAINT "PostComments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
