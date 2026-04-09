import { prisma } from "@/lib/db";
import { formatDate, readingTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — MyAIBlueprint`,
    description: post.excerpt || undefined,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
  });

  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/posts"
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        &larr; Back to posts
      </Link>

      <article className="mt-6">
        <header className="mb-8">
          <div className="flex items-center gap-3 text-sm text-muted mb-3">
            <time>{formatDate(post.createdAt)}</time>
            <span>&middot;</span>
            <span>{readingTime(post.content)}</span>
            <span>&middot;</span>
            <span className="capitalize">{post.category}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          {post.excerpt && (
            <p className="text-lg text-muted mt-3">{post.excerpt}</p>
          )}
        </header>

        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full rounded-lg mb-8 object-cover max-h-96"
          />
        )}

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
