import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // 1. Image uploader for Gowns (Max 4 images, 4MB each)
  gownImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Gown image upload complete:", file.url);
      return { url: file.url };
    }),

  // 2. Video uploader for Reels (Max 1 video, 16MB limit for fast loading)
  reelVideoUploader: f({ video: { maxFileSize: "16MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Reel video upload complete:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;