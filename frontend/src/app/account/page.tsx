"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "../supabase/auth";

export default function Account() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/log-in");
    }
  }, [session, router]);

  return (
    <div className="flex flex-col gap-6">
      <div className="prose">
        <h2>Account</h2>
      </div>
      <Link href="/log-out">
        <button className="btn">Log Out</button>
      </Link>
    </div>
  );
}
