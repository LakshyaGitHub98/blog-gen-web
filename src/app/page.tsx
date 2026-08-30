"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Loader2, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { ScorePill, StatusPill } from "@/components/score";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGeneration } from "@/hooks/use-generation";
import { api, type Post } from "@/lib/api";
import { cn } from "@/lib/utils";

const STAGES: Record<string, string> = {
  queued: "Waiting in queue…",
  draft: "Drafting with the LLM…",
  evaluating: "Scoring with the AI detector…",
  humanizing: "Rewriting to sound human…",
  saving: "Saving the best revision…",
  done: "Done",
  failed: "Failed",
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/[0.08] via-background to-muted/40 p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            <Sparkles className="size-3" />
            AI Detector + Humanizer Loop
          </Badge>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Generate human-sounding blog posts
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Draft it, score it with the self-hosted detector, then auto-rewrite until the AI score hits 0. Built with shadcn, Next.js and a humanizer pipeline.
          </p>
        </div>
      </div>
      <GenerateForm />
      <PostsSection />
    </div>
  );
}

function GenerateForm() {
  const router = useRouter();
  const { job, polling, startPolling } = useGeneration();

  const [topic, setTopic] = useState("");
  const [maxIterations, setMaxIterations] = useState(5);
  const [temperature, setTemperature] = useState(0.85);
  const [maxTokens, setMaxTokens] = useState("2048");
  const [submitting, setSubmitting] = useState(false);

  const busy = submitting || polling;

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const res = await api.generate({
          topic,
          max_iterations: maxIterations,
          temperature,
          max_tokens: parseInt(maxTokens, 10),
        });
        toast.success(`Queued — ${res.request_id}`);
        startPolling(res.request_id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to start");
      } finally {
        setSubmitting(false);
      }
    },
    [topic, maxIterations, temperature, maxTokens, startPolling]
  );

  const stage = job?.stage ?? "";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wand2 className="size-4" />
          </span>
          Generate a blog post
          <Badge variant="outline" className="ml-auto hidden sm:inline-flex">
            {polling ? "Working" : "Ready"}
          </Badge>
        </CardTitle>
        <CardDescription>Draft, score and humanize until the detector is happy.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How I scaled my side project to 10k users"
              className="min-h-24 resize-none"
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="iterations">Iterations</Label>
                <Tooltip>
                  <TooltipTrigger className="size-4 rounded-full border text-[10px] leading-none text-muted-foreground">?</TooltipTrigger>
                  <TooltipContent>Max rewrite passes until AI score hits 0</TooltipContent>
                </Tooltip>
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">{maxIterations}</span>
              </div>
              <Slider
                id="iterations"
                min={1}
                max={10}
                step={1}
                value={[maxIterations]}
                onValueChange={(v) => setMaxIterations(v[0])}
                disabled={busy}
              />
              <p className="text-xs text-muted-foreground">More passes = stronger human signal.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="temperature">Temperature</Label>
                <Tooltip>
                  <TooltipTrigger className="size-4 rounded-full border text-[10px] leading-none text-muted-foreground">?</TooltipTrigger>
                  <TooltipContent>Creativity: 0.2 precise, 1.5 wild</TooltipContent>
                </Tooltip>
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">{temperature.toFixed(2)}</span>
              </div>
              <Slider
                id="temperature"
                min={0.2}
                max={1.5}
                step={0.05}
                value={[temperature]}
                onValueChange={(v) => setTemperature(v[0])}
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_tokens">Max tokens</Label>
              <Select value={maxTokens} onValueChange={setMaxTokens} disabled={busy}>
                <SelectTrigger id="max_tokens" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2048">2048</SelectItem>
                  <SelectItem value="4096">4096</SelectItem>
                  <SelectItem value="8192">8192</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={busy || !topic.trim()} className="w-full sm:w-auto">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {busy ? "Working…" : "Generate"}
          </Button>
        </form>

        {job && polling && (
          <div className="mt-6 space-y-3 rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium capitalize">{STAGES[stage] ?? stage}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{job.elapsed_seconds ?? 0}s</span>
            </div>
            <Progress value={undefined} className="h-1.5 [&>div]:animate-pulse" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              {job.request_id.slice(0, 8)} — detector is scoring each paragraph
            </div>
          </div>
        )}

        {job && job.status === "failed" && (
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>Generation failed</AlertTitle>
            <AlertDescription className="break-words">{job.error || "Unknown error"}</AlertDescription>
            {job.error?.toLowerCase().includes("rate limit") && (
              <AlertDescription className="mt-2">Rate-limited. Wait a minute, then try again.</AlertDescription>
            )}
          </Alert>
        )}

        {job && job.status === "completed" && (
          <div className="mt-6 flex flex-col gap-3 rounded-xl border bg-card p-4">
            <Separator className="hidden" />
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">{job.title}</span>
              <ScorePill score={job.final_score} label="AI score" />
              <Badge variant="outline" className="text-xs">
                {job.iterations_used} pass{job.iterations_used === 1 ? "" : "es"}
              </Badge>
            </div>
            <Button variant="outline" className="w-fit" onClick={() => router.push(`/post/${job.request_id}`)}>
              View result
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PostsSection() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .posts()
      .then((r) => {
        if (active) setPosts(r.posts);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load");
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Recent posts</CardTitle>
          <CardDescription>Generated by the pipeline</CardDescription>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon-sm" onClick={refresh} aria-label="Refresh">
              <RefreshCw className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : posts == null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText className="size-4" />
              </EmptyMedia>
              <EmptyTitle>No posts yet</EmptyTitle>
              <EmptyDescription>Generate your first humanized post above to see it here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="max-h-[420px] pr-3">
            <div className="space-y-1">
              {posts.map((p) => (
                <PostRow key={p.id} post={p} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function PostRow({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className={cn(
        "-mx-2 flex flex-col gap-1.5 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60 hover:ring-1 hover:ring-border",
        (post.status === "queued" || post.status === "generating") && "pointer-events-none opacity-60"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <StatusPill status={post.status} />
        <ScorePill score={post.final_score} label="AI score" />
        <Badge variant="outline" className="text-[11px]">
          {post.iterations_used || 0} pass{post.iterations_used === 1 ? "" : "es"}
        </Badge>
        <span className="tabular-nums">{post.created_at ? new Date(post.created_at).toLocaleString() : ""}</span>
      </div>
      <span className="font-medium leading-tight">{post.title || post.topic}</span>
      <span className="text-xs text-muted-foreground">detector: {post.detector || "—"}</span>
      {post.error && <span className="truncate text-xs text-destructive">{post.error}</span>}
    </Link>
  );
}
