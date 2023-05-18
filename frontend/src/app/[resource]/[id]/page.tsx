"use client";

import { get as _get } from "lodash";
import Link from "next/link";
import pluralize from "pluralize";
import useSWR from "swr";

import { nameColumn } from "@/app/shape/columns";
import ShapeComponent from "@/app/shape/ShapeComponent";
import supabase from "@/app/supabase/client";
import { capitalizeFirstLetter } from "@/app/util";

export default function ResourceList({
  params,
}: {
  params: { resource: string; id: string };
}) {
  const fetcher = async () => {
    const { data, error } = await supabase
      .from("node")
      .select("*")
      .eq("type", params.resource)
      .eq("id", params.id)
      .single();
    if (error) {
      throw Error(`${error.code} - ${error.message} - ${error.details}`);
    }
    return data;
  };
  const { data, error, isLoading } = useSWR(
    `/${params.resource}/${params.id}`,
    fetcher
  );

  if (error) throw Error(String(error));
  if (isLoading) return <>Loading...</>;
  if (data === undefined) throw Error("Data is undefined");

  // Count on error handling to catch any data shape issues
  const dataObject: any = data.data;

  return (
    <>
      <div className="text-sm breadcrumbs">
        <ul>
          <li>
            <Link href={`/${params.resource}`}>
              {capitalizeFirstLetter(pluralize(params.resource))}
            </Link>
          </li>
          <li className="font-bold">
            {_get(dataObject, nameColumn, params.id)}
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        {dataObject[nameColumn] && (
          <div className="prose">
            <h1>{dataObject[nameColumn]}</h1>
          </div>
        )}
        {Object.entries(dataObject).map(([k, v]) => {
          if (k === nameColumn) return null;
          return <ShapeComponent key={k} shape={k} value={v} />;
        })}
      </div>
    </>
  );
}
