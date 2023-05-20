"use client";

import { OpenAPI } from "@/app/client";

export default function ClientConfiguration() {
  // backend config
  if (process.env.NEXT_PUBLIC_BACKEND_URL === undefined) {
    console.error("Missing NEXT_PUBLIC_BACKEND_URL");
  } else {
    OpenAPI.BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  return <></>;
}
