import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} MyAIBlueprint. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/posts" className="hover:text-foreground transition-colors">
            Posts
          </Link>
          <Link href="/projects" className="hover:text-foreground transition-colors">
            Projects
          </Link>
        </div>
      </div>
    </footer>
  );
}
