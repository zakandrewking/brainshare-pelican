"use client";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

import FileUpload from "@/app/components/FileUpload";
import supabase from "@/app/supabase/client";
import {
  faBoltLightning,
  faDownload,
  faFileCode,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { stripFileNameUuid } from "../util";

export default function Files() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetcher = async () => {
    const { data, error } = await supabase.storage.from("files").list();
    if (error) {
      throw Error(`${error.name} - ${error.message}`);
    }
    // get download URLs
    const promises = data.map(async (file) => {
      const { data, error } = await supabase.storage
        .from("files")
        .createSignedUrl(file.name, 3600, {
          download: stripFileNameUuid(file.name),
        });
      if (error) {
        throw Error(`${error.name} - ${error.message}`);
      }
      return { ...file, signedUrl: data?.signedUrl };
    });
    return await Promise.all(promises);
  };

  const { data: files, error, isLoading, mutate } = useSWR("/files", fetcher);

  if (error) throw Error(String(error));
  if (isLoading) return <>Loading...</>;
  if (files === undefined) throw Error("Data is undefined");

  const download = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("files")
        .download(fileName);
      if (error) {
        throw Error(`${error.name} - ${error.message}`);
      }
    } catch (error) {
      console.log(`Error downloading file: ${error}`);
      setToastMessage("Something went wrong. Please try again.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const deleteFile = async (name: string) => {
    try {
      const { data, error } = await supabase.storage

        .from("files")
        .remove([name]);
      if (error) {
        throw Error(`${error.name} - ${error.message}`);
      }
      mutate((files) => files?.filter((file) => file.name !== name));
    } catch (error) {
      console.log(`Error deleting file: ${error}`);
      setToastMessage("Something went wrong. Please try again.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="prose">
          <h1>Files</h1>
        </div>
        <FileUpload />
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="!relative">Name</th>
                <th>Uploaded</th>
                <th className="max-w-[90px]">Delete</th>
                <th className="max-w-[90px]">Download</th>
                <th className="max-w-[90px]">Process</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.name}>
                  <th className="!relative">
                    <FontAwesomeIcon
                      icon={faFileCode}
                      style={{ marginRight: "8px" }}
                    />
                    {/* strip name up to the first . */}
                    {stripFileNameUuid(file.name)}
                  </th>
                  <td>{file.created_at}</td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => deleteFile(file.name)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                  <td>
                    <a
                      href={file.signedUrl}
                      className={`btn ${file.signedUrl ? "" : "btn-disabled"}`}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </a>
                  </td>
                  <td>
                    <Link
                      href={`/files/${file.name}/process`}
                      className="btn btn-primary"
                    >
                      <FontAwesomeIcon icon={faBoltLightning} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {error && (
        <div className="toast" onClick={() => setToastMessage(null)}>
          <div className="alert alert-error">
            <div>
              <span>{toastMessage}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
