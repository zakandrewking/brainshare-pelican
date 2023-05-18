"use client";
import Link from "next/link";
import { useDropzone } from "react-dropzone";

import supabase from "@/app/supabase/client";

import { useAuth } from "../supabase/auth";

export default function FileUpload() {
  const { session, loaded: authLoaded } = useAuth();
  const onDrop = async (acceptedFiles: File[]) => {
    acceptedFiles.forEach(async (file) => {
      const { data, error } = await supabase.storage
        .from("files")
        .upload("test.json", file);
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
      <Link href="/account?redirect=/" className="btn">
        Log in to upload a file
      </Link>
    );

  return (
    <div className="btn h-auto normal-case p-3" {...getRootProps()}>
      <input {...getInputProps()} />
      <div className="">
        <h2 className="font-bold text-xl mb-6">Upload a file</h2>
        <p className="text-lg">{dropzoneStatus}</p>
      </div>
    </div>
  );
}
