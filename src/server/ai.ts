"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Fetches the image as a buffer from a given URL (S3)
 */
async function fetchImageBuffer(
  url: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch image: ${response.statusText}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get("content-type") || "image/jpeg";

  return { buffer, mimeType };
}

/**
 * Uploads an image buffer to Google AI File Manager.
 */
async function uploadToGemini(buffer: Buffer, mimeType: string) {
  const uploadResult = await fileManager.uploadFile(buffer, { mimeType });
  console.log(`Uploaded file as: ${uploadResult.file.uri}`);
  return uploadResult.file;
}

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function GenerateImage({
  imageUrl,
  prompt,
}: {
  imageUrl: string;
  prompt: string;
}) {
  try {
    // Fetch image from S3 as a buffer
    const { buffer, mimeType } = await fetchImageBuffer(imageUrl);

    // Upload image buffer directly to Google AI File Manager
    const image = await uploadToGemini(buffer, mimeType);

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: image.mimeType,
                fileUri: image.uri, // Now a valid Google file URI
              },
            },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage(prompt);
    console.log(result.response.text());
    const fileDetails = await getFileDetails(result.response.text());
    console.log(fileDetails);
    return fileDetails;
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image");
  }
}

async function getFileDetails(reqUrl: string) {
  const response = await fetch(reqUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file details: ${response.statusText}`);
  }

  return response.json(); // Returns file metadata (including the URL to access it)
}
