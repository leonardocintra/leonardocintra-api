-- CreateTable
CREATE TABLE "home_feed_response" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_feed_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_row" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "homeFeedId" INTEGER NOT NULL,

    CONSTRAINT "category_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video" (
    "id" SERIAL NOT NULL,
    "videoId" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "thumbnail" VARCHAR(500) NOT NULL,
    "categoryRowId" INTEGER NOT NULL,

    CONSTRAINT "video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_category_row_home_feed" ON "category_row"("homeFeedId");

-- CreateIndex
CREATE UNIQUE INDEX "video_videoId_key" ON "video"("videoId");

-- CreateIndex
CREATE INDEX "idx_video_category_row" ON "video"("categoryRowId");

-- AddForeignKey
ALTER TABLE "category_row" ADD CONSTRAINT "category_row_homeFeedId_fkey" FOREIGN KEY ("homeFeedId") REFERENCES "home_feed_response"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video" ADD CONSTRAINT "video_categoryRowId_fkey" FOREIGN KEY ("categoryRowId") REFERENCES "category_row"("id") ON DELETE CASCADE ON UPDATE CASCADE;
