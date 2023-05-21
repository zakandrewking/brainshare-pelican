"use client";
import Link from "next/link";
import useSWR from "swr";

import supabase from "@/app/supabase/client";
import { stripFileNameUuid } from "@/app/util";

export default function Process({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data, error, isLoading } = useSWR(
    `/files/${id}/process`,
    async () => {
      const { data, error } = await supabase
        .from("step")
        .select("*")
        .eq("bucket", "files")
        .eq("object_name", id);
      if (error) {
        throw Error(`${error.code} - ${error.message} - ${error.details}`);
      }
      return data;
    }
  );

  if (error) throw Error(String(error));
  if (isLoading) return <>Loading...</>;
  if (data === undefined) throw Error("Data is undefined");

  return (
    <>
      <div className="text-sm breadcrumbs">
        <ul>
          <li>
            <Link href={`/files`}>Files</Link>
          </li>
          <li className="font-bold">{stripFileNameUuid(id)}</li>
          <li>Process</li>
        </ul>
      </div>
      <div className="prose">
        <h1>Process</h1>
        <p>{data.map((step: any) => step.description)}</p>
      </div>
    </>
  );
}
