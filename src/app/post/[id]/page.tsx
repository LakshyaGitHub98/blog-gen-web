"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, History, Sparkles } from "lucide-react";

import { Markdown } from "@/components/markdown";
import { ScorePill, StatusPill } from "@/components/score";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type PostDetail } from "@/lib/api";

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<PostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .post(id)
      .then((d) => {
        if (active) setDetail(d);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Not found");
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Could not load post</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { post, revisions } = detail;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to list
          </Link>
        </Button>
        <Badge variant="outline" className="ml-auto hidden sm:inline-flex">
          <Sparkles className="size-3" />
          {post.detector || "pipeline"}
        </Badge>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <StatusPill status={post.status} />
            <ScorePill score={post.final_score} label="AI score" />
            <Badge variant="secondary">{post.iterations_used || 0} passes</Badge>
            <span className="text-muted-foreground tabular-nums">
              {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
            </span>
          </div>
          <CardTitle className="text-2xl leading-tight">{post.title || post.topic}</CardTitle>
          <CardDescription>{post.topic}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {post.content ? (
            <ScrollArea className="max-h-[60vh] pr-4">
              <Markdown>{post.content}</Markdown>
            </ScrollArea>
          ) : post.status === "failed" ? (
            <Alert variant="destructive">
              <AlertTitle>This generation failed</AlertTitle>
              <AlertDescription className="break-words">{post.error || "Unknown error"}</AlertDescription>
            </Alert>
          ) : (
            <Empty className="border-dashed">
              <EmptyHeader>
                <EmptyTitle>No content yet</EmptyTitle>
                <EmptyDescription>This post is still generating.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4" />
            Revisions
            <Badge variant="outline" className="ml-2">{revisions.length}</Badge>
          </CardTitle>
          <CardDescription>Every scored version from draft to best revision.</CardDescription>
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <History />
                </EmptyMedia>
                <EmptyTitle>No revisions</EmptyTitle>
                <EmptyDescription>No revisions recorded for this post.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Accordion type="multiple" defaultValue={[String(revisions.length - 1)]}>
              {[...revisions]
                .sort((a, b) => a.iteration - b.iteration)
                .map((rev) => (
                  <AccordionItem key={rev.id} value={String(rev.iteration)}>
                    <AccordionTrigger className="gap-3">
                      <span className="text-sm font-medium">{rev.iteration === 0 ? "Draft" : `Humanize #${rev.iteration}`}</span>
                      <ScorePill score={rev.ai_score} label="AI score" />
                    </AccordionTrigger>
                    <AccordionContent>
                      <Separator className="mb-4" />
                      <Markdown>{rev.content}</Markdown>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
