"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { useAuth } from "../supabase/auth";
import supabase from "../supabase/client";

export default function Account() {
  const { session } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    if (session && redirect) router.push(redirect);
  }, [router, searchParams, session]);

  if (!session) {
    return (
      <div className="max-w-xl mx-auto">
        <Auth
          supabaseClient={supabase}
          providers={["github"]}
          redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}${
            searchParams.get("redirect") ?? "/account"
          }`}
          onlyThirdPartyProviders={process.env.NODE_ENV !== "development"}
          theme={prefersDarkMode ? "dark" : "light"}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#1976d2",
                  brandAccent: "#0f4880",
                },
              },
            },
          }}
        />
      </div>
    );
  }

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
