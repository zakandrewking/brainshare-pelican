import Link from "next/link";
import pluralize from "pluralize";
import { ReactNode } from "react";

import {
  faArrowRightArrowLeft,
  faAtom,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { capitalizeFirstLetter } from "../util";

const icons: { [key: string]: ReactNode } = {
  get atom() {
    return <FontAwesomeIcon icon={faAtom} size="lg" color="hsl(var(--p))" />;
  },
  get arrowRightArrowLeft() {
    return (
      <FontAwesomeIcon
        icon={faArrowRightArrowLeft}
        size="lg"
        color="hsl(var(--p))"
      />
    );
  },
  get default() {
    return <></>;
  },
};

export default async function SideMenuDynamic() {
  const response = await fetch(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "") + "/rest/v1/node_type",
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        Authorization: `Bearer ${
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        }`,
      },
    }
  );

  if (!response.ok) throw Error("Failed to fetch node types");

  const nodesTypes: any[] = await response.json();

  console.log(nodesTypes.map((t) => t.name).join(", "));

  return nodesTypes.map((t) => (
    <li key={t.name}>
      <Link href={`/${t.name}`}>
        {icons[t.icon || ""]}
        {capitalizeFirstLetter(pluralize(t.name))}
      </Link>
    </li>
  ));
}
