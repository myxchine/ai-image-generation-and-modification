"use client";

import { useState } from "react";
import Image from "next/image";
import { ModifyImage } from "@/server/modify-image";
import imageCompression from "browser-image-compression";
import crypto from "crypto";

async function compressImage({ image }: { image: File }) {
  console.log(`originalFile size ${image.size / 1024 / 1024} MB`); // initial size in mb
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/jpeg",
  };
  try {
    const compressedFile = await imageCompression(image, options);
    console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // processed size in mb
    return compressedFile;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to compress image");
  }
}

export default function ImageGenerator() {
  const [initialImage, setInitialImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* const handleImageSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    setLoading(true);
    await handleImageUpload({ image: e.target.files[0] });
  };*/

  const handleImageSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const compressedImage = await compressImage({
      image: e.target.files[0],
    });
    setFile(compressedImage);
    setInitialImage(URL.createObjectURL(compressedImage));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!initialImage || !file) return;

    setLoading(true);
    try {
      const modifiedImage = await ModifyImage({
        image: file,
        prompt,
      });

      if (!modifiedImage) return;
      const blob = new Blob([modifiedImage], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      setGeneratedImage(url);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setError("Failed to generate image, please try again");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 flex flex-col gap-4 md:gap-8">
      <h1>FREAKAZOID</h1>

      {generatedImage && !loading && (
        <div className="flex flex-col gap-4 w-full">
          <img
            src={generatedImage}
            alt="Generated image"
            className="w-full rounded-2xl"
          />
          <a
            href={generatedImage}
            download
            className=" bg-black hover:bg-black/90 text-white text-center  px-6 py-4  rounded-2xl w-full"
          >
            Download Image
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!initialImage && (
          <label
            htmlFor="file"
            className="flex flex-col gap-4 items-center justify-center bg-black hover:bg-black/90 px-4 py-2 rounded-2xl border w-full aspect-square text-white text-center cursor-pointer"
          >
            [ Select an Image ]
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelected}
              className="hidden"
              id="file"
            />
          </label>
        )}
        {loading && (
          <div className="flex flex-col gap-4 w-full">
            <div className="w-full aspect-square rounded-2xl animate-pulse bg-black" />
            <div className="w-full flex flex-row gap-4 items-center justify-center px-6 py-4  rounded-2xl bg-black text-black/60 animate-pulse">
              Loading...
            </div>
          </div>
        )}

        {initialImage && !generatedImage && (
          <div
            className={
              loading ? "hidden" : "flex flex-col gap-4 md:gap-8 w-full"
            }
          >
            <div className="w-full hidden flex-row gap-4 md:gap-8 items-center justify-center px-4 py-2 rounded-xl bg-green-200 text-green-900">
              Image Uploaded
            </div>
            <img
              src={initialImage}
              onLoad={() => setLoading(false)}
              alt="Preview"
              width={200}
              height={200}
              className="object-cover w-full aspect-auto rounded-2xl"
            />
            <div className="flex flex-col w-full gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className=" p-6 md:p-8 w-full h-32 md:h-32 uppercase resize-none rounded-2xl bg-black text-white placeholder:text-white/60"
                placeholder="E.g., Add a huge fur coat to my outfit"
                required
              />
              <button
                type="submit"
                className="bg-black text-white py-4 px-6 w-full uppercase rounded-2xl cursor-pointer hover:bg-black/70"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Image"}
              </button>
            </div>
          </div>
        )}
      </form>

      {error && (
        <div className=" px-6 py-4 bg-red-200 text-red-500 rounded-2xl w-full text-center">
          {error}
        </div>
      )}
    </div>
  );
}
