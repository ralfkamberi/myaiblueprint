import { createRequire } from 'node:module';
import { PrismaClient } from '../src/generated/prisma/client.ts';

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      chatbotPrompt: "You are a friendly and helpful AI assistant for the MyAIBlueprint website. Answer questions about the site, its content, and its owner. Be concise and helpful.",
      aboutContent: "<h2>Hello! Welcome to MyAIBlueprint</h2>\n<p>This is my personal space on the internet where I share my thoughts, projects, and everything I'm learning along the way.</p>\n<p>Feel free to explore my posts, check out my projects, or chat with the AI assistant in the bottom-right corner!</p>",
    },
  });

  await prisma.post.upsert({
    where: { slug: "welcome-to-myaiblueprint" },
    update: {},
    create: {
      title: "Welcome to MyAIBlueprint",
      slug: "welcome-to-myaiblueprint",
      excerpt: "This is my first post — a quick intro to what this site is all about.",
      content: "<p>Welcome! This is my personal blog and portfolio where I'll be sharing my journey, ideas, and projects.</p>\n<h2>What to Expect</h2>\n<p>Here you'll find:</p>\n<ul>\n<li><strong>Writings</strong> — thoughts, tutorials, and reflections</li>\n<li><strong>Projects</strong> — things I've built and worked on</li>\n<li><strong>Ideas</strong> — concepts I'm exploring and learning about</li>\n</ul>\n<p>Feel free to use the AI chatbot in the bottom-right corner to ask any questions about me or this site!</p>",
      published: true,
      category: "writing",
    },
  });

  await prisma.project.upsert({
    where: { slug: "myaiblueprint-website" },
    update: {},
    create: {
      title: "MyAIBlueprint Website",
      slug: "myaiblueprint-website",
      description: "This very website — a personal blog and portfolio built with Next.js.",
      content: "<p>This website is built with modern web technologies:</p>\n<ul>\n<li><strong>Next.js</strong> — React framework for the frontend and backend</li>\n<li><strong>Tailwind CSS</strong> — for clean, minimal styling</li>\n<li><strong>SQLite + Prisma</strong> — lightweight database</li>\n<li><strong>Claude AI</strong> — powers the chatbot assistant</li>\n</ul>\n<p>It features a clean design inspired by minimalist blogs, with a full admin dashboard for managing content.</p>",
      tags: "Next.js, Tailwind, AI, Blog",
      published: true,
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
