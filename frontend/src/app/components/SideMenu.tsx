"use client";

import Link from "next/link";
import pluralize from "pluralize";
import { ReactNode, use } from "react";
import useSwr from "swr";

import {
  faArrowRightArrowLeft,
  faAtom,
  faSwatchbook,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import supabase from "../supabase/client";
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

export default function SideMenu() {
  const { data: nodesTypes, error } = useSwr("/node_type", async () => {
    const { data, error } = await supabase.from("node_type").select();
    if (error) throw Error(String(error));
    return data;
  });

  if (error || !nodesTypes) return <></>;

  return (
    <ul className="menu bg-base-200 w-40 pt-16 flex flex-col justify-between">
      <div>
        <li key="home">
          <Link href="/">
            <FontAwesomeIcon
              icon={faSwatchbook}
              size="lg"
              color="hsl(var(--p))"
            />
            Home
          </Link>
        </li>
        {nodesTypes.map((t) => (
          <li key={t.name}>
            <Link href={`/${t.name}`}>
              {icons[t.icon || ""]}
              {capitalizeFirstLetter(pluralize(t.name))}
            </Link>
          </li>
        ))}
        <li key="account">
          <Link href="/account">
            <FontAwesomeIcon icon={faUser} size="lg" color="hsl(var(--p))" />
            Account
          </Link>
        </li>
      </div>
      <div className="mx-auto pb-2">version: {process.env.GIT_SHA}</div>
    </ul>
  );
}
