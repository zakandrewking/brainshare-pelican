"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ClientSideDrawerHandler() {
  const router = useRouter();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // close the drawer when the route changes
    (document.getElementById("top-nav-drawer") as HTMLInputElement).checked =
      false;
  }, [pathname, searchParams]);

  return <></>;
}
