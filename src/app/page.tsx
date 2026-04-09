export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, readingTime } from "@/lib/utils";

export default async function HomePage() {
  const recentPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const recentProjects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to MyAIBlueprint
        </h1>
        <p className="text-lg text-muted leading-relaxed max-w-2xl">
          A space for learning, building, and sharing ideas. Here you&apos;ll find
          my writings, projects, experiments, and everything in between.
        </p>
      </section>

      {/* Recent Posts */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          <Link href="/posts" className="text-sm text-accent hover:underline">
            View all &rarr;
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-muted">No posts yet. Check back soon!</p>
        ) : (
          <div className="space-y-6">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="block group"
              >
                <article className="border border-border rounded-lg p-5 hover:border-accent/30 transition-colors">
                  <div className="flex items-center gap-3 text-xs text-muted mb-2">
                    <time>{formatDate(post.createdAt)}</time>
                    <span>&middot;</span>
                    <span>{readingTime(post.content)}</span>
                    <span>&middot;</span>
                    <span className="capitalize">{post.category}</span>
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted mt-1 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Projects */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Projects</h2>
          <Link href="/projects" className="text-sm text-accent hover:underline">
            View all &rarr;
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <p className="text-muted">No projects yet. Stay tuned!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="block group"
              >
                <article className="border border-border rounded-lg p-5 hover:border-accent/30 transition-colors h-full">
                  <h3 className="font-semibold group-hover:text-accent transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted mt-2 line-clamp-2">
                    {project.description}
                  </p>
                  {project.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.tags.split(",").map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-card px-2 py-0.5 rounded-full text-muted"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
