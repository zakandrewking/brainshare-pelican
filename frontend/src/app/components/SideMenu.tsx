import Link from "next/link";
import { ReactNode } from "react";

import {
  faArrowRightArrowLeft,
  faAtom,
  faSwatchbook,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import pluralize from "pluralize";
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

interface NodeType {
  type: string;
  icon: string;
}

export default function SideMenu() {
  const nodesTypes: NodeType[] = [
    { type: "chemical", icon: "atom" },
    { type: "reaction", icon: "arrowRightArrowLeft" },
  ];
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
          <li key={t.type}>
            <Link href={`/${t.type}`}>
              {icons[t.icon]}
              {capitalizeFirstLetter(pluralize(t.type))}
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
