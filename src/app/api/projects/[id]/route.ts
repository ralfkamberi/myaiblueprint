import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const data = await request.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      content: data.content,
      coverImage: data.coverImage,
      demoUrl: data.demoUrl,
      tags: data.tags,
      published: data.published,
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
