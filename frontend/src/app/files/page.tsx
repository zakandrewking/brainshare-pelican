"use client";

import { useState } from "react";
import supabase from "@/app/supabase/client";
// import useSWR from "swr";
import FileUpload from "@/app/components/FileUpload";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Files({
  params,
}: {
  params: { resource: string; id: string };
}) {
  const [error, setError] = useState<string | null>(null);
  //   const fetcher = async () => {
  //     const { data, error } = await supabase
  //       .from("node")
  //       .select("*")
  //       .eq("type", params.resource)
  //       .eq("id", params.id)
  //       .single();
  //     if (error) {
  //       throw Error(`${error.code} - ${error.message} - ${error.details}`);
  //     }
  //     return data;
  //   };

  //   const { data, error, isLoading } = useSWR("/files", fetcher);

  //   if (error) throw Error(String(error));
  //   if (isLoading) return <>Loading...</>;
  //   if (data === undefined) throw Error("Data is undefined");

  const files = [{ name: "test" }];

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
      setError("Something went wrong. Please try again.");
      setTimeout(() => setError(null), 3000);
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
          <table className="table w-full">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Delete</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>icon</th>
                <td>Cy Ganderton</td>
                <td>Quality Control Specialist</td>
                <td>Blue</td>
              </tr>
            </tbody>
          </table>
        </div>
        {files.map((file) => (
          <div key={file.name} className="flex flex-col gap-6">
            <div className="prose">
              {file.name}
              <button className="btn" onClick={() => download(file.name)}>
                <FontAwesomeIcon icon={faDownload} />
              </button>
            </div>
          </div>
        ))}
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
