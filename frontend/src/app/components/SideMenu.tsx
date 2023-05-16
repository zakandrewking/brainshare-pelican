import Link from "next/link";
import { ReactNode } from "react";

import { faSwatchbook, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SideMenu({ children }: { children: ReactNode }) {
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
        {children}
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
