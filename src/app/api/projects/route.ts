import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const slug = data.slug || slugify(data.title);

  const project = await prisma.project.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      content: data.content,
      coverImage: data.coverImage || "",
      demoUrl: data.demoUrl || "",
      tags: data.tags || "",
      published: data.published ?? false,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
