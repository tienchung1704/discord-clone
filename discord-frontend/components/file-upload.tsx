"use client";

import React, { useState } from "react";
import { FileIcon, X, Upload } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";

// Base64 blur placeholder for uploaded images
const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI0OCIgY3k9IjQ4IiByPSI0OCIgZmlsbD0iIzM3NDE1MSIvPjwvc3ZnPg==";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
}

export function FileUpload({ onChange, value, endpoint }: FileUploadProps) {
  const fileType = value ? value.split(".").pop()?.toLowerCase() : "";
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset states when value changes
  React.useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [value]);

  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-24 w-24 group">
        {!hasError ? (
          <>
            <Image 
              fill 
              src={value} 
              alt="Upload" 
              className={`rounded-full object-cover ring-4 ring-zinc-200 dark:ring-zinc-700 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="96px"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
            {/* Show blur placeholder while loading */}
            {!isLoaded && (
              <div 
                className="absolute inset-0 rounded-full bg-zinc-700 animate-pulse ring-4 ring-zinc-200 dark:ring-zinc-700"
                aria-hidden="true"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full rounded-full bg-zinc-700 ring-4 ring-zinc-200 dark:ring-zinc-700 flex items-center justify-center">
            <span className="text-zinc-400 text-xs">Error</span>
          </div>
        )}
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-full absolute -top-1 -right-1 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && fileType === "pdf") {
    return (
      <div className="relative flex items-center p-3 mt-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <FileIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
        </div>
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-3 text-sm text-indigo-500 dark:text-indigo-400 hover:underline truncate max-w-[200px]"
        >
          PDF Document
        </a>
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-full absolute -top-2 -right-2 shadow-lg transition-colors"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        if (res && res[0]?.ufsUrl) {
          onChange(res[0].ufsUrl);
        }
      }}
      onUploadError={(error: Error) => console.error(error.message)}
      appearance={{
        container:
          "border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 cursor-pointer",
        label: "text-zinc-600 dark:text-zinc-300 font-medium",
        allowedContent: "text-xs text-zinc-500 dark:text-zinc-400 mt-2",
        button:
          "mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg ut-uploading:bg-indigo-400",
        uploadIcon: "text-zinc-400 dark:text-zinc-500 w-12 h-12 mb-2",
      }}
      content={{
        label({ ready }) {
          if (ready) return "Drop file here or click to browse";
          return "Getting ready...";
        },
        allowedContent({ ready, fileTypes, isUploading }) {
          if (!ready) return "Checking...";
          if (isUploading) return "Uploading...";
          return `${endpoint === "serverImage" ? "Image" : "File"} (4MB max)`;
        },
      }}
    />
  );
}