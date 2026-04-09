import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      chatbotPrompt:
        "You are a friendly and helpful AI assistant for the MyAIBlueprint website. Answer questions about the site, its content, and its owner. Be concise and helpful.",
      aboutContent: `<h2>Hello! Welcome to MyAIBlueprint</h2>
<p>This is my personal space on the internet where I share my thoughts, projects, and everything I'm learning along the way.</p>
<p>Feel free to explore my posts, check out my projects, or chat with the AI assistant in the bottom-right corner!</p>`,
    },
  });

  await prisma.post.upsert({
    where: { slug: "welcome-to-myaiblueprint" },
    update: {},
    create: {
      title: "Welcome to MyAIBlueprint",
      slug: "welcome-to-myaiblueprint",
      excerpt: "This is my first post — a quick intro to what this site is all about.",
      content: `<p>Welcome! This is my personal blog and portfolio where I'll be sharing my journey, ideas, and projects.</p>
<h2>What to Expect</h2>
<p>Here you'll find:</p>
<ul>
<li><strong>Writings</strong> — thoughts, tutorials, and reflections</li>
<li><strong>Projects</strong> — things I've built and worked on</li>
<li><strong>Ideas</strong> — concepts I'm exploring and learning about</li>
</ul>
<p>Feel free to use the AI chatbot in the bottom-right corner to ask any questions about me or this site!</p>`,
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
      content: `<p>This website is built with modern web technologies:</p>
<ul>
<li><strong>Next.js</strong> — React framework for the frontend and backend</li>
<li><strong>Tailwind CSS</strong> — for clean, minimal styling</li>
<li><strong>SQLite + Prisma</strong> — lightweight database</li>
<li><strong>Claude AI</strong> — powers the chatbot assistant</li>
</ul>
<p>It features a clean design inspired by minimalist blogs, with a full admin dashboard for managing content.</p>`,
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
