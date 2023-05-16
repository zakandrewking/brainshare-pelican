"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import supabase from "../supabase/client";
import { useAuth } from "../supabase/auth";

export default function LogIn() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { session } = useAuth();

  useEffect(() => {
    if (session) router.push(searchParams.get("redirect") ?? "/account");
  }, [router, searchParams, session]);

  return (
    <div className="max-w-xl mx-auto">
      <Auth
        supabaseClient={supabase}
        providers={["github"]}
        redirectTo={`https://brainshare.io/pelican${
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
