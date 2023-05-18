"use client";

import Link from "next/link";

import { stripFileNameUuid } from "@/app/util";

export default function Process({
  params: { id },
}: {
  params: { id: string };
}) {
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
      </div>
    </>
  );
}
