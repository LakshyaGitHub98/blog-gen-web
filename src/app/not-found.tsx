"use client";

import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    const path = window.location.pathname;
    if (path && path !== "/") {
      window.location.replace(`/?redirect=${encodeURIComponent(path)}`);
    } else {
      window.location.replace("/");
    }
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">Redirecting…</p>
    </div>
  );
}
