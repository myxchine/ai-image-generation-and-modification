"use server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/server/storage";

export async function getUploadUrl({
  fileType,
  id,
  bucket,
}: {
  fileType: string;
  id: string;
  bucket: string;
}): Promise<{ presignedUrl: string | null; status: Status }> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: id,
      ContentType: fileType,
    });
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 min
    });
    return {
      presignedUrl: presignedUrl,
      status: { status: "success", message: "File has been uploaded." },
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      presignedUrl: null,
      status: { status: "error", message: "Failed to generate upload URL" },
    };
  }
}
