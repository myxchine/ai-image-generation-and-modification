import { getUploadUrl } from "@/server/storage/get-upload-url";
import imageCompression from "browser-image-compression";
import crypto from "crypto";

async function uploadToBucket(file: File) {
  try {
    const { presignedUrl } = await getUploadUrl({
      fileType: file.type,
      id: crypto.randomBytes(16).toString("hex") + file.name,
      bucket: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_INITIAL_IMAGE_BUCKET_NAME!,
    });
    if (!presignedUrl) throw new Error("Failed to get upload URL");
    const uploadImage = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
    if (!uploadImage.ok) throw new Error("Failed to upload image");
  } catch (error) {
    console.log(error);
    throw new Error("Error occured while trying to upload to stroage bucket");
  }
}

async function handleImageUpload({ imageFile }: { imageFile: File }) {
  console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`); // initial size in mb
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/jpeg",
  };
  try {
    const compressedFile = await imageCompression(imageFile, options);
    console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // processed size in mb

    await uploadToBucket(compressedFile);
  } catch (error) {
    console.log(error);
  }
}
