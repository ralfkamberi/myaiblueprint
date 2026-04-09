import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let settings = await prisma.siteSettings.findUnique({
    where: { id: "main" },
  });

  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "main" } });
  }

  // Don't expose the full API key
  return NextResponse.json({
    ...settings,
    chatbotApiKey: settings.chatbotApiKey ? "sk-***configured***" : "",
  });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  // Only update API key if a new one is provided (not the masked version)
  const updateData: Record<string, string> = {};
  if (data.chatbotPrompt !== undefined) updateData.chatbotPrompt = data.chatbotPrompt;
  if (data.aboutContent !== undefined) updateData.aboutContent = data.aboutContent;
  if (data.socialTwitter !== undefined) updateData.socialTwitter = data.socialTwitter;
  if (data.socialGithub !== undefined) updateData.socialGithub = data.socialGithub;
  if (data.socialLinkedin !== undefined) updateData.socialLinkedin = data.socialLinkedin;
  if (data.socialEmail !== undefined) updateData.socialEmail = data.socialEmail;
  if (data.chatbotApiKey && !data.chatbotApiKey.includes("***")) {
    updateData.chatbotApiKey = data.chatbotApiKey;
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: updateData,
    create: { id: "main", ...updateData },
  });

  return NextResponse.json({
    ...settings,
    chatbotApiKey: settings.chatbotApiKey ? "sk-***configured***" : "",
  });
}
