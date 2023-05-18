"use client";

import { useState } from "react";
import useSWR from "swr";

import FileUpload from "@/app/components/FileUpload";
import supabase from "@/app/supabase/client";
import {
  faDownload,
  faFileCode,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function stripFileNameUUID(fileName: string) {
  return fileName.replace(/^[^.]*\./, "");
}

export default function Files({
  params,
}: {
  params: { resource: string; id: string };
}) {
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
          download: stripFileNameUUID(file.name),
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
                <th></th>
                <th>Name</th>
                <th>Uploaded</th>
                <th>Delete</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.name}>
                  <th>
                    <FontAwesomeIcon icon={faFileCode} />
                  </th>
                  <td>
                    {/* strip name up to the first . */}
                    {stripFileNameUUID(file.name)}
                  </td>
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
                    <a href={file.signedUrl} className="btn">
                      <FontAwesomeIcon icon={faDownload} />
                    </a>
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
