"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import supabase, { useAuth } from "../supabase";

export default function LogOut() {
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      if (!session) router.replace("/log-in");
    });
  }, [router, session]);

  return <></>;
}
