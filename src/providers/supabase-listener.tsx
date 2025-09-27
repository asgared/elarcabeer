"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";

import {useSupabase} from "./supabase-provider";

type SupabaseListenerProps = {
  serverAccessToken?: string;
};

export function SupabaseListener({serverAccessToken}: SupabaseListenerProps) {
  const {supabase} = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const {
      data: {subscription}
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) {
        void fetch("/api/auth/callback", {
          method: "POST",
          headers: new Headers({"Content-Type": "application/json"}),
          credentials: "same-origin",
          body: JSON.stringify({event, session})
        });
      }

      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, serverAccessToken, supabase]);

  return null;
}
