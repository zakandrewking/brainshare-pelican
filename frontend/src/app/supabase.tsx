"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { createClient, Session } from "@supabase/supabase-js";

import { Database } from "./database.types";

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (anonKey === undefined)
  throw Error("Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY");
if (apiUrl === undefined)
  throw Error("Missing environment variable REACT_APP_API_URL");

const supabase = createClient<Database>(apiUrl, anonKey, {});

export default supabase;

class AuthState {
  session: Session | null = null;
  role: string | null = null;
}
export const AuthContext = createContext<AuthState>(new AuthState());

const getRole = async (user_id: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from("user_role")
    .select("role")
    .eq("user_id", user_id)
    .single();
  if (error) console.error(error);
  return data?.role ?? null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(new AuthState());

  useEffect(() => {
    // get session
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const state = new AuthState();
      if (session) {
        state.session = session;
        state.role = await getRole(session.user.id);
      }
      setState(state);
    })();

    // watch for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      const state = new AuthState();
      if (session) {
        state.session = session;
        state.role = await getRole(session.user.id);
      }
      setState(state);
    });

    // clean up
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  //   // When the auth state changes, configure the backend API client
  //   useEffect(() => {
  //     if (state.session) {
  //       OpenAPI.HEADERS = {
  //         Authorization: `Bearer ${state.session.access_token}`,
  //       };
  //     } else {
  //       OpenAPI.HEADERS = undefined;
  //     }
  //   }, [state]);

  //   // When the auth state is logged out, clear stores
  //   useEffect(() => {
  //     if (state.session === null) {
  //       docStoreDispatch(docStoreInitialState);
  //       // TODO how to also cancel any open HTTP request, e.g. an in-progress POST
  //       // to /annotate
  //     }
  //   }, [state, docStoreDispatch]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw Error("useAuth must be used within AuthProvider");
  return context;
}
