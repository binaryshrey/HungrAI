"use client";

/************************************************************ IMPORTS ************************************************************/

import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  RiPencilFill,
  RiAddLargeFill,
  RiDeleteBin4Fill,
} from "@remixicon/react";
import Image from "next/image";
import ProfileMenu from "../../components/Profile/ProfileMenu";
import { PREDICT_ENDPOINT } from "@/utils/Constants";

/************************************************************ IMPORTS ************************************************************/

interface Prediction {
  filename: string;
  label: string;
  confidence: number;
}

interface Recipe {
  id: number;
  title: string;
  score: number;
  matched: string[];
  missing: string[];
  instructions: string[];
}

interface AnalyzeIngredientsResponse {
  predictions: Prediction[];
  ingredients: string[];
  recipes: Recipe[];
  candidate_count: number;
}

interface UploadIngredientsProps {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profilePictureUrl?: string | null;
  };
}

const UploadIngredients = ({ user }: UploadIngredientsProps) => {
  // global vars
  const fileInputRef = useRef<HTMLInputElement>(null);
  const RECIPE_PICS_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

  // state
  const [loading, setLoading] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [recipeFiles, setRecipeFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  if (!user) return null;

  // methods
  const handleRecipeNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRecipeName(event.target.value);
  };

  const handleInputFileRef = () => {
    fileInputRef.current?.click();
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
    return imageExtensions.includes(extension || "") ? "Image" : "Other";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];

    if (file && getFileType(file.name) !== "Image") {
      setError("Only images are allowed!");
      console.error("Only images are allowed!");
      return;
    } else if (file && file.size > RECIPE_PICS_SIZE_LIMIT) {
      setError(`File ${file.name} is too large. Max size is 5 MB.`);
      console.error(`File ${file.name} is too large. Max size is 5 MB.`);
      return;
    } else {
      if (file) {
        setRecipeFiles([...recipeFiles, file]);
        setError("");
      }
    }
  };

  const handleRemoveImage = (file: File) => {
    setRecipeFiles(
      recipeFiles.filter((recipeFile) => recipeFile.name !== file.name)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (recipeFiles.length === 0) {
      setError("Please upload at least one image");
      setLoading(false);
      return;
    }

    if (recipeFiles.length > 10) {
      setError("Maximum 10 images allowed");
      setLoading(false);
      return;
    }

    try {
      // Create FormData and append all files
      const formData = new FormData();
      recipeFiles.forEach((file) => {
        formData.append("files", file);
      });

      console.log("Sending request to:", PREDICT_ENDPOINT);

      // Make POST request to the predict endpoint
      const response = await fetch(PREDICT_ENDPOINT, {
        method: "POST",
        body: formData,
      }).catch((fetchError) => {
        console.error("Fetch error:", fetchError);
        throw new Error(
          `Cannot connect to backend server at ${PREDICT_ENDPOINT}. Please ensure the backend is running on port 8000.`
        );
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data: AnalyzeIngredientsResponse = await response.json();
      console.log("API Response:", data);

      // Store the response in localStorage to pass to dashboard page
      localStorage.setItem("recipeResults", JSON.stringify(data));

      // Navigate to dashboard page
      window.location.href = "/dashboard";
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again.";
      setError(errorMessage);
      console.error("Error uploading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadBoxSmall = () => {
    return (
      <div
        onClick={handleInputFileRef}
        className="border-2 border-dashed rounded border-zinc-700 bg-neutral-900 w-40 h-40 md:w-36 md:h-36 flex justify-center items-center cursor-pointer hover:border-zinc-600 transition-colors"
      >
        <div className="w-12 h-12 bg-black rounded-md flex justify-center items-center drop-shadow-md">
          <RiAddLargeFill className="h-6 w-6 text-white" />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
    );
  };

  const uploadBoxLarge = () => {
    return (
      <div className="mt-8 cursor-pointer" onClick={handleInputFileRef}>
        <div className="border-2 border-dashed rounded border-zinc-700 w-full h-64 bg-neutral-900 flex justify-center text-center hover:border-zinc-600 transition-colors">
          <div className="flex flex-col justify-center items-center">
            <svg
              className="w-16 h-16 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-neutral-300 text-md mt-4">
              Tap to upload your Recipe Image
            </p>
            <p className="text-neutral-600 text-xs">
              Supports: PNG, JPEG, JPG, WEBP, GIF (5 mb max)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black min-h-screen relative">
      {/* content */}
      <div className="relative z-10">
        <div className="px-6 pt-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <a href="/dashboard" className="-m-1.5 p-1.5">
              <img className="h-8" src="/logo.svg" alt="demoday-ai" />
            </a>
            <div className="lg:flex lg:flex-1 lg:justify-end">
              <ProfileMenu user={user} />
            </div>
          </nav>
        </div>

        <div>
          <div className="mt-12 text-center">
            <h1 className="text-2xl font-semibold text-white">
              Upload Food Ingredients
            </h1>
            <p className="mt-1 text-xs md:text-sm text-neutral-300">
              Upload images of your food ingredients
            </p>
          </div>

          <div className="max-w-4xl mx-auto md:px-36 px-8">
            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* First File upload */}
            {recipeFiles.length === 0 && uploadBoxLarge()}

            {/* Multiple file upload */}
            {recipeFiles.length !== 0 && (
              <div className="mt-8 flex flex-wrap gap-6 md:gap-2.5">
                {recipeFiles.map((file, index) => {
                  return (
                    <div key={index} className="flex justify-between relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="recipe ingredient"
                        className="w-40 h-40 md:w-36 md:h-36 rounded border-2 border-zinc-800 p-2 object-cover"
                      />
                      <div
                        className="absolute top-0 right-0 cursor-pointer"
                        onClick={() => handleRemoveImage(file)}
                      >
                        <div className="p-1 bg-zinc-800 rounded-md -m-2 hover:bg-zinc-700 transition-colors">
                          <RiDeleteBin4Fill className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {recipeFiles.length < 10 && uploadBoxSmall()}
              </div>
            )}
          </div>

          <div className="max-w-4xl mx-auto md:px-36 px-8 pb-8">
            {recipeFiles.length === 0 && !loading && (
              <div className={recipeFiles.length === 0 ? "mt-16" : "mt-12"}>
                <Button
                  type="submit"
                  className="bg-white text-black hover:bg-neutral-200 w-full"
                  onClick={handleSubmit}
                >
                  Get Recipes
                </Button>
              </div>
            )}
            {recipeFiles.length !== 0 && loading && (
              <div className={recipeFiles.length === 0 ? "mt-36" : "mt-24"}>
                <Button
                  type="submit"
                  className="bg-white text-black hover:bg-neutral-200 w-full"
                  disabled
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Get Recipes
                </Button>
              </div>
            )}
            {recipeFiles.length !== 0 && !loading && (
              <div className={recipeFiles.length === 0 ? "mt-36" : "mt-24"}>
                <Button
                  type="submit"
                  className="bg-white text-black hover:bg-neutral-200 w-full"
                  onClick={handleSubmit}
                >
                  Get Recipes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadIngredients;
