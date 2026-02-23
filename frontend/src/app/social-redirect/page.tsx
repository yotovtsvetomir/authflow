"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to") || "/profile";

  useEffect(() => {
    if (window.opener) {
      window.opener.location.href = redirectTo;
      window.close();
    } else {
      router.push(redirectTo);
    }
  }, [router, redirectTo]);

  return <div>Closing...</div>;
}
