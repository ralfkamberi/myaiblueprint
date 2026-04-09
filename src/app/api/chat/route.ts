import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  // Get chatbot settings from database
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "main" },
  });

  const apiKey = settings?.chatbotApiKey;
  if (!apiKey) {
    return NextResponse.json(
      { reply: "The AI chatbot is not configured yet. Please set the API key in the admin dashboard." },
      { status: 200 }
    );
  }

  const systemPrompt =
    settings?.chatbotPrompt ||
    "You are a helpful assistant for the MyAIBlueprint website.";

  try {
    const anthropic = createAnthropic({ apiKey });

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      maxOutputTokens: 500,
    });

    return NextResponse.json({ reply: result.text });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { reply: "Sorry, I encountered an error. Please try again later." },
      { status: 200 }
    );
  }
}
