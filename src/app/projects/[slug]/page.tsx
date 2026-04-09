import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} — MyAIBlueprint`,
    description: project.description || undefined,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug, published: true },
  });

  if (!project) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/projects"
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        &larr; Back to projects
      </Link>

      <article className="mt-6">
        <header className="mb-8">
          <time className="text-sm text-muted">{formatDate(project.createdAt)}</time>
          <h1 className="text-3xl font-bold tracking-tight mt-2">
            {project.title}
          </h1>
          <p className="text-lg text-muted mt-3">{project.description}</p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {project.tags &&
              project.tags.split(",").map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-card px-2.5 py-1 rounded-full text-muted"
                >
                  {tag.trim()}
                </span>
              ))}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline"
              >
                Live Demo &rarr;
              </a>
            )}
          </div>
        </header>

        {project.coverImage && (
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full rounded-lg mb-8 object-cover max-h-96"
          />
        )}

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
      </article>
    </div>
  );
}
