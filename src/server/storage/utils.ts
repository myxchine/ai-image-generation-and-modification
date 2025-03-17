"use server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/server/storage";

export async function deleteProcessedImageFromStorage(song: any) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PROCESSED_IMAGE_BUCKET_NAME,
      Key: song.image,
    });
    const res = await s3Client.send(command);
    console.log(res);
    console.log("Deleted song's image from storage");
  } catch (error) {
    console.error("Error deleting song's image from storage:", error);
    throw new Error("Failed to delete song's image from storage");
  }
  return true;
}

export async function deleteInitialImageFromStorage(song: any) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_INITIAL_IMAGE_BUCKET_NAME,
      Key: song.image,
    });
    const res = await s3Client.send(command);
    console.log(res);
    console.log("Deleted song's image from storage");
  } catch (error) {
    console.error("Error deleting song's image from storage:", error);
    throw new Error("Failed to delete song's image from storage");
  }
  return true;
}
