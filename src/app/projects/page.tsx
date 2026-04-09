export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Projects — MyAIBlueprint",
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
      <p className="text-muted mb-10">Things I&apos;ve built and worked on.</p>

      {projects.length === 0 ? (
        <p className="text-muted">No projects published yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="block group"
            >
              <article className="border border-border rounded-lg overflow-hidden hover:border-accent/30 transition-colors h-full">
                {project.coverImage && (
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5">
                  <h2 className="font-semibold group-hover:text-accent transition-colors">
                    {project.title}
                  </h2>
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
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
