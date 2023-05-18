"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "../supabase/auth";
import supabase from "../supabase/client";

export default function LogOut() {
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      if (!session) router.replace("/account");
    });
  }, [router, session]);

  return <></>;
}
