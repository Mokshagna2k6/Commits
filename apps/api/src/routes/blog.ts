import type { FastifyInstance } from "fastify";

const BLOG_POSTS = [
  {
    _id: "scaling-web-apps-2025",
    title: "Scaling Web Apps in 2025: From MVP to 100k Users",
    slug: "scaling-web-apps-2025",
    excerpt: "A deep dive into serverless architecture, database sharding, and why your first choice of tech stack matters more than you think.",
    category: "Development",
    featured: true,
    publishedAt: "2025-12-15T00:00:00.000Z",
    author: { name: "StackFox Engineering", avatar: null },
    coverImage: null,
    content: "Scaling a web application from a minimum viable product to handling 100,000 concurrent users is one of the most challenging journeys in software engineering...",
    tags: ["scaling", "architecture", "serverless"],
  },
  {
    _id: "ai-genai-business-efficiency",
    title: "How Generative AI is Changing Business Efficiency",
    slug: "ai-genai-business-efficiency",
    excerpt: "Stop using ChatGPT as a toy. Learn how to integrate LLMs into your internal workflows to save 20+ hours a week.",
    category: "AI",
    featured: true,
    publishedAt: "2025-11-28T00:00:00.000Z",
    author: { name: "StackFox Engineering", avatar: null },
    coverImage: null,
    content: "Generative AI has moved far beyond chatbots and image generators. Forward-thinking businesses are now integrating large language models directly into their internal workflows...",
    tags: ["ai", "genai", "automation", "productivity"],
  },
  {
    _id: "mobile-first-india-growth",
    title: "Mobile-First Design: Winning the Indian Market",
    slug: "mobile-first-india-growth",
    excerpt: "The average Indian user has a budget smartphone and intermittent 4G. Here is how to design apps that actually work.",
    category: "Design",
    featured: true,
    publishedAt: "2025-11-10T00:00:00.000Z",
    author: { name: "StackFox Engineering", avatar: null },
    coverImage: null,
    content: "India's mobile-first market presents unique challenges that most Western design frameworks simply don't address...",
    tags: ["mobile", "design", "india", "ux"],
  },
  {
    _id: "devops-ci-cd-startup",
    title: "DevOps for Startups: CI/CD Without the Complexity",
    slug: "devops-ci-cd-startup",
    excerpt: "You don't need Kubernetes on day one. A pragmatic guide to shipping fast with GitHub Actions, Docker, and Railway.",
    category: "DevOps",
    featured: false,
    publishedAt: "2025-10-20T00:00:00.000Z",
    author: { name: "StackFox Engineering", avatar: null },
    coverImage: null,
    content: "The DevOps landscape can feel overwhelming for a small team. But the truth is, you can achieve reliable deployments with a fraction of the tooling...",
    tags: ["devops", "ci-cd", "docker", "startup"],
  },
  {
    _id: "ecommerce-payments-india",
    title: "Payment Integration in India: Razorpay, Stripe & UPI",
    slug: "ecommerce-payments-india",
    excerpt: "A technical comparison of payment gateways for Indian e-commerce, including UPI autopay, subscriptions, and compliance.",
    category: "E-Commerce",
    featured: false,
    publishedAt: "2025-10-05T00:00:00.000Z",
    author: { name: "StackFox Engineering", avatar: null },
    coverImage: null,
    content: "India's payment ecosystem is unique. UPI dominates consumer transactions, but enterprise billing still relies heavily on NEFT and RTGS...",
    tags: ["payments", "razorpay", "stripe", "upi", "ecommerce"],
  },
];

export async function blogRoutes(app: FastifyInstance) {
  app.get("/blog", async (req) => {
    const { limit, featured } = req.query as { limit?: string; featured?: string };
    let posts = [...BLOG_POSTS];
    if (featured === "true") posts = posts.filter((p) => p.featured);
    if (limit) posts = posts.slice(0, parseInt(limit));
    return { data: posts, total: posts.length };
  });

  app.get("/blog/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const post = BLOG_POSTS.find((p) => p._id === id || p.slug === id);
    if (!post) return reply.code(404).send({ error: "Post not found" });
    return { data: post };
  });

  app.get("/blog/admin/all", async () => {
    return { data: BLOG_POSTS, total: BLOG_POSTS.length };
  });

  app.post("/blog", async (req) => {
    return { data: req.body, message: "Blog creation will be available soon" };
  });

  app.put("/blog/:id", async (req) => {
    const { id } = req.params as { id: string };
    return { data: { _id: id, ...(req.body as any) }, message: "Blog update will be available soon" };
  });

  app.delete("/blog/:id", async (req) => {
    const { id } = req.params as { id: string };
    return { message: `Post ${id} deletion will be available soon` };
  });

  app.post("/blog/generate", async (req) => {
    const { topic } = req.body as { topic: string };
    return {
      data: {
        _id: `generated-${Date.now()}`,
        title: `AI-Generated: ${topic}`,
        slug: topic.toLowerCase().replace(/\s+/g, "-"),
        excerpt: `An AI-generated article about ${topic}.`,
        category: "AI",
        featured: false,
        publishedAt: new Date().toISOString(),
        author: { name: "StackFox AI", avatar: null },
        content: `This is a placeholder for AI-generated content about ${topic}. Full generation will be available soon.`,
        tags: [topic.toLowerCase()],
      },
    };
  });
}
