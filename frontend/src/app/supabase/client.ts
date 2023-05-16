import { createClient, Session } from "@supabase/supabase-js";

import { Database } from "../database.types";

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (anonKey === undefined)
  throw Error("Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY");
if (apiUrl === undefined)
  throw Error("Missing environment variable REACT_APP_API_URL");

export default createClient<Database>(apiUrl, anonKey, {});
