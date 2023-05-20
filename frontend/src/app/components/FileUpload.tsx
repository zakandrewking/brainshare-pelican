"use client";
import Link from "next/link";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { mutate } from "swr";

import supabase from "@/app/supabase/client";

import { DefaultService } from "../client";
import { useAuth } from "../supabase/auth";

export default function FileUpload() {
  const { session, loaded: authLoaded } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    acceptedFiles.forEach(async (file) => {
      try {
        const fileName = `${crypto.randomUUID()}.${file.name}`;
        const { data, error } = await supabase.storage
          .from("files")
          .upload(fileName, file);
        if (error) {
          throw Error(`${error.name} - ${error.message}`);
        }
        mutate("/files", (files) => [...files, { name: fileName }]);
        DefaultService.postRunGetCategoriesRunGetCategoriesPost({
          bucket: "files",
          name: fileName,
        });
      } catch (error) {
        console.log(`Error Uploading file: ${error}`);
        setError("Something went wrong. Please try again.");
        setTimeout(() => setError(null), 3000);
      }
    });
  };
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      accept: { "application/json ": [".json"] },
    });
  const dropzoneStatus =
    fileRejections.length !== 0
      ? "Could not read the file"
      : false
      ? "status"
      : isDragActive
      ? "Drop the files here ..."
      : "Drag a JSON file here, or click to select a file";

  if (!authLoaded) return <>Loading ...</>;

  if (!session)
    return (
      <Link href="/account?redirect=/files" className="btn">
        Log in to upload a file
      </Link>
    );

  return (
    <>
      <div className="btn h-auto normal-case p-3" {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="">
          <h2 className="font-bold text-xl mb-6">Upload a file</h2>
          <p className="text-lg">{dropzoneStatus}</p>
        </div>
      </div>
      {error && (
        <div className="toast" onClick={() => setError(null)}>
          <div className="alert alert-error">
            <div>
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
