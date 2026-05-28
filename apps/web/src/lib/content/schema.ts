import { z } from "zod";

export const TimelineSchema = z.object({
  updatedAt: z.string(),
  pinned: z.array(z.string()).default([]),
  order: z.array(z.string())
});

export type Timeline = z.infer<typeof TimelineSchema>;

export const SiteContactSchema = z.object({
  label: z.string(),
  value: z.string(),
  href: z.string().optional()
});

export const FeaturedRepositorySchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  description: z.string().optional(),
  homepage: z.string().optional()
});

export const SiteConfigSchema = z.object({
  displayName: z.string(),
  githubUsername: z.string(),
  siteTitle: z.string(),
  siteDescription: z.string(),
  contacts: z.array(SiteContactSchema).default([]),
  projects: z
    .object({
      sectionTitle: z.string().default("Public Projects"),
      sectionSummary: z.string().optional(),
      displayCount: z.number().int().positive().optional(),
      hiddenRepositories: z.array(z.string()).default([]),
      featuredRepositories: z.array(FeaturedRepositorySchema).default([])
    })
    .default({ sectionTitle: "Public Projects", hiddenRepositories: [], featuredRepositories: [] })
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type SiteContact = z.infer<typeof SiteContactSchema>;
export type FeaturedRepository = z.infer<typeof FeaturedRepositorySchema>;

export const PostSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "media", "project", "section", "thread"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  visibility: z.enum(["public", "unlisted", "hidden"]),
  mass: z.number().min(0).max(1),
  tags: z.array(z.string()).default([]),
  thread: z
    .object({
      parentId: z.string().optional(),
      replyIds: z.array(z.string()).default([])
    })
    .default({ replyIds: [] }),
  pointers: z.object({
    publishedRevisionId: z.string().optional(),
    draftRevisionId: z.string().optional()
  }),
  engagement: z.object({ likeCount: z.number().int().nonnegative() })
});

export type Post = z.infer<typeof PostSchema>;

const RevisionBodySchema = z.object({
  blocks: z.array(
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("paragraph"), text: z.string() }),
      z.object({
        type: z.literal("list"),
        style: z.enum(["bullets", "numbers"]).default("bullets"),
        items: z.array(z.string())
      })
    ])
  )
});

export const PostRevisionSchema = z.object({
  id: z.string(),
  postId: z.string(),
  createdAt: z.string(),
  title: z.string().optional(),
  summary: z.string().optional(),
  sectionKind: z.enum(["about", "skills", "experience", "projects"]).optional(),
  body: RevisionBodySchema,
  embeds: z
    .object({
      mediaIds: z.array(z.string()).optional(),
      projectIds: z.array(z.string()).optional()
    })
    .default({})
});

export type PostRevision = z.infer<typeof PostRevisionSchema>;

export const RepositoryPageSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  body: RevisionBodySchema,
  githubRepo: z.string().optional()
});

export type RepositoryPage = z.infer<typeof RepositoryPageSchema>;

export type FeedItem = {
  post: Post;
  revision: PostRevision;
  isPinned: boolean;
};
