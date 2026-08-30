import type { JobStatus, Post, PostDetail, GenerateResponse, Health } from "./api";

const DEMO_POSTS: Post[] = [
  {
    id: "demo-1",
    topic: "How I scaled my side project to 10k users",
    title: "How I scaled my side project to 10k users",
    status: "completed",
    stage: "done",
    iterations_used: 2,
    final_score: 0.23,
    detector: "mock",
    error: "",
    created_at: new Date().toISOString(),
    content: "## Demo post\n\nThis is mock content. Set NEXT_PUBLIC_API_URL to connect to real backend.",
  },
  {
    id: "demo-2",
    topic: "The future of AI writing",
    title: "The future of AI writing",
    status: "completed",
    stage: "done",
    iterations_used: 1,
    final_score: 0.41,
    detector: "mock",
    error: "",
    created_at: new Date().toISOString(),
    content: "## AI Writing\n\nMock revision content for standalone demo.",
  },
];

export const mockApi = {
  health: async (): Promise<Health> => ({ status: "ok", mode: "mock" }),
  generate: async (): Promise<GenerateResponse> => ({ request_id: "demo-1", status: "queued", async: true }),
  status: async (id: string): Promise<JobStatus> => ({
    request_id: id,
    status: "completed",
    stage: "done",
    error: "",
    title: DEMO_POSTS[0].title,
    final_score: DEMO_POSTS[0].final_score,
    iterations_used: DEMO_POSTS[0].iterations_used,
    detector: "mock",
    elapsed_seconds: 3,
  }),
  posts: async (): Promise<{ posts: Post[] }> => ({ posts: DEMO_POSTS }),
  post: async (id: string): Promise<PostDetail> => ({
    post: DEMO_POSTS.find((p) => p.id === id) ?? DEMO_POSTS[0],
    revisions: [
      { id: "rev-1", iteration: 0, ai_score: 0.72, detector: "mock", content: DEMO_POSTS[0].content },
      { id: "rev-2", iteration: 1, ai_score: 0.23, detector: "mock", content: DEMO_POSTS[0].content },
    ],
  }),
};
