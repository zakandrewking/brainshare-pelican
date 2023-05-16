"use client";

import { get as _get } from "lodash";
import Link from "next/link";
import pluralize from "pluralize";
import React, { ReactNode } from "react";
import useSWRInfinite from "swr/infinite";

import supabase from "../supabase/client";
import { capitalizeFirstLetter } from "../util";

const PAGE_SIZE = 20;

export default function ResourceList({
  params,
}: {
  params: { resource: string };
}) {
  const fetcher = async ({ page, limit }: { page: number; limit: number }) => {
    const start = page * limit;
    const end = (page + 1) * limit - 1;
    const {
      data: rows,
      error,
      count,
    } = await supabase
      .from("node")
      .select("*", page === 0 ? { count: "exact" } : {})
      .eq("type", params.resource)
      .range(start, end);
    if (error) throw Error(String(error));
    return { rows, ...(page === 0 ? { count } : {}) };
  };

  type FetcherResponse = Awaited<ReturnType<typeof fetcher>>;

  const getKey = (page: number, previousPageData: FetcherResponse) => {
    if (previousPageData && !previousPageData.rows.length) return null;
    return {
      url: `/${params.resource}`,
      page,
      limit: PAGE_SIZE,
      //   locationKey: location.key, // reload if we route there from a separate click
    }; // SWR key
  };

  const { data, error, isValidating, size, setSize } = useSWRInfinite(
    getKey,
    fetcher
  );

  const rows = data ? data.flatMap((ar) => ar.rows) : null;
  const count = data && data[0] && data[0].count ? data[0].count : 0;

  return (
    <div className="prose">
      <h1>{capitalizeFirstLetter(pluralize(params.resource))}</h1>
      {rows
        ?.map(
          (row, i): ReactNode => (
            <Link href={`/${params.resource}/${row.id}`} key={i}>
              {_get(row, ["data", "name"], "")}
            </Link>
          )
        )
        .reduce<ReactNode[]>(
          (a, c, i) =>
            a.length === 0
              ? [c]
              : [...a, <div key={`d${i}`} className="divider" />, c],
          []
        )}
      <div className="divider" />
      <p>Count: {count}</p>
    </div>
  );
}
