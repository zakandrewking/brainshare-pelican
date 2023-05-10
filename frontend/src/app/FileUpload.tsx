"use client";

import { useDropzone } from "react-dropzone";

import { useAuth } from "./supabase";
import Link from "next/link";

export default function FileUpload() {
  const { session, loaded: authLoaded } = useAuth();
  const onDrop = async (acceptedFiles: File[]) => {};
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      accept: { "application/pdf ": [".pdf"] },
    });
  const dropzoneStatus =
    fileRejections.length !== 0
      ? "Could not read the file"
      : false
      ? "status"
      : isDragActive
      ? "Drop the files here ..."
      : "Drag a .pdf file here, or click to select a file";

  if (!authLoaded) return <>Loading ...</>;

  if (!session)
    return (
      <Link href="/log-in?redirect=/" className="btn">
        Log in to upload a file
      </Link>
    );

  return (
    <div
      className="btn btn-info btn-outline h-auto normal-case p-3"
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div className="">
        <h2 className="font-bold text-xl mb-6">Upload a file</h2>
        <p className="text-lg">{dropzoneStatus}</p>
      </div>
    </div>
  );
}
