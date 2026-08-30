"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api, type Health } from "@/lib/api";

export function Header() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">blog-gen</span>
            <span className="text-[11px] text-muted-foreground">humanizer pipeline</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant={health?.mode === "async" ? "default" : "secondary"} className="hidden sm:inline-flex capitalize">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {health?.mode ?? "…"}
          </Badge>
          <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/">
              <FileText className="size-4" />
              Posts
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
