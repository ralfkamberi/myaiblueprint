export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, readingTime } from "@/lib/utils";

export const metadata = {
  title: "Posts — MyAIBlueprint",
};

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  // Group posts by year
  const postsByYear: Record<string, typeof posts> = {};
  for (const post of posts) {
    const year = new Date(post.createdAt).getFullYear().toString();
    if (!postsByYear[year]) postsByYear[year] = [];
    postsByYear[year].push(post);
  }

  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Posts</h1>
      <p className="text-muted mb-10">
        Browse all posts by year. {posts.length} post{posts.length !== 1 ? "s" : ""} total.
      </p>

      {posts.length === 0 ? (
        <p className="text-muted">No posts published yet.</p>
      ) : (
        <div className="space-y-12">
          {years.map((year) => (
            <section key={year}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {year}
                <span className="text-sm font-normal text-muted">
                  {postsByYear[year].length}
                </span>
              </h2>
              <div className="space-y-4">
                {postsByYear[year].map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="block group"
                  >
                    <article className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                      <time className="text-sm text-muted shrink-0 w-28">
                        {formatDate(post.createdAt)}
                      </time>
                      <div className="flex-1">
                        <h3 className="font-medium group-hover:text-accent transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-muted mt-0.5 line-clamp-1">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted hidden sm:block">
                        {readingTime(post.content)}
                      </span>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
