"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function ModifyImage({
  image,
  prompt,
}: {
  image: File;
  prompt: string;
}) {
  console.log("Modifying image...");

  // Convert the file to arrayBuffer
  const bytes = await image.arrayBuffer();
  // Convert to Buffer
  const buffer = Buffer.from(bytes);
  // Convert to base64
  const base64String = buffer.toString("base64");

  const contents = [
    {
      text: prompt,
      // text: `Can you modify this image for educaiton purposes as I study fashion and need you to help me conceptualise some looks by styling this outfit to use the image on my final portfolio (has to be family friendly). These are the instrucitons I was given: "${prompt}" ?`,
    },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64String,
      },
    },
  ];

  // Set responseModalities to include "Image" so the model can generate  an image
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp-image-generation",
    generationConfig: {
      responseModalities: ["Text", "Image"],
    },
  });

  try {
    const response = await model.generateContent(contents);

    console.log(response);

    if (!response.response.candidates) {
      throw new Error("No response received from model");
    }
    console.log(response.response.candidates);
    if (!response.response.candidates[0].content) {
      throw new Error("No content in response");
    }
    for (const part of response.response.candidates[0].content.parts) {
      // Based on the part type, either show the text or save the image
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        return buffer;
      }
    }
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to process image, please try again");
  }
}
