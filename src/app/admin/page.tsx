"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  published: boolean;
  category: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string;
  demoUrl: string;
  tags: string;
  published: boolean;
  createdAt: string;
}

interface Settings {
  chatbotApiKey: string;
  chatbotPrompt: string;
  aboutContent: string;
  socialTwitter: string;
  socialGithub: string;
  socialLinkedin: string;
  socialEmail: string;
}

type Tab = "posts" | "projects" | "settings";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("posts");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) router.push("/admin/login");
        else setAuthenticated(true);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (loading) return <div className="p-8 text-center text-muted">Loading...</div>;
  if (!authenticated) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-muted hover:text-foreground"
        >
          Log out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-8">
        {(["posts", "projects", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "posts" && <PostsManager />}
      {tab === "projects" && <ProjectsManager />}
      {tab === "settings" && <SettingsManager />}
    </div>
  );
}

/* ============================================================
   POSTS MANAGER
   ============================================================ */
function PostsManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);

  const loadPosts = useCallback(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then(setPosts);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    loadPosts();
  }

  if (creating || editing) {
    return (
      <PostForm
        post={editing}
        onDone={() => {
          setCreating(false);
          setEditing(null);
          loadPosts();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All Posts ({posts.length})</h2>
        <button
          onClick={() => setCreating(true)}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + New Post
        </button>
      </div>
      <div className="space-y-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between border border-border rounded-lg p-4"
          >
            <div>
              <h3 className="font-medium">{post.title}</h3>
              <div className="flex gap-2 text-xs text-muted mt-1">
                <span className="capitalize">{post.category}</span>
                <span>&middot;</span>
                <span>{post.published ? "Published" : "Draft"}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(post)}
                className="text-sm text-accent hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-muted text-center py-8">No posts yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   POST FORM
   ============================================================ */
function PostForm({ post, onDone }: { post: Post | null; onDone: () => void }) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [category, setCategory] = useState(post?.category || "writing");
  const [published, setPublished] = useState(post?.published ?? false);
  const [saving, setSaving] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) setCoverImage(data.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = { title, slug, excerpt, content, coverImage, category, published };

    if (post) {
      await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setSaving(false);
    onDone();
  }

  return (
    <div>
      <button onClick={onDone} className="text-sm text-muted hover:text-foreground mb-4">
        &larr; Back to posts
      </button>
      <h2 className="text-lg font-semibold mb-4">
        {post ? "Edit Post" : "New Post"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <Field label="Title" value={title} onChange={setTitle} required />
        <Field label="Slug" value={slug} onChange={setSlug} placeholder="auto-generated from title" />
        <Field label="Excerpt" value={excerpt} onChange={setExcerpt} />
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg"
          >
            <option value="writing">Writing</option>
            <option value="tutorial">Tutorial</option>
            <option value="idea">Idea</option>
            <option value="note">Note</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
          {coverImage && (
            <img src={coverImage} alt="Cover" className="mt-2 h-32 rounded-lg object-cover" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content (HTML)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-3 py-2 border border-border rounded-lg font-mono text-sm"
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : post ? "Update" : "Create"}
          </button>
          <button type="button" onClick={onDone} className="px-6 py-2 rounded-lg text-sm border border-border">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   PROJECTS MANAGER
   ============================================================ */
function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);

  const loadProjects = useCallback(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    loadProjects();
  }

  if (creating || editing) {
    return (
      <ProjectForm
        project={editing}
        onDone={() => {
          setCreating(false);
          setEditing(null);
          loadProjects();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All Projects ({projects.length})</h2>
        <button
          onClick={() => setCreating(true)}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + New Project
        </button>
      </div>
      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between border border-border rounded-lg p-4"
          >
            <div>
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-xs text-muted mt-1">
                {project.published ? "Published" : "Draft"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(project)}
                className="text-sm text-accent hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-muted text-center py-8">No projects yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PROJECT FORM
   ============================================================ */
function ProjectForm({
  project,
  onDone,
}: {
  project: Project | null;
  onDone: () => void;
}) {
  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [description, setDescription] = useState(project?.description || "");
  const [content, setContent] = useState(project?.content || "");
  const [coverImage, setCoverImage] = useState(project?.coverImage || "");
  const [demoUrl, setDemoUrl] = useState(project?.demoUrl || "");
  const [tags, setTags] = useState(project?.tags || "");
  const [published, setPublished] = useState(project?.published ?? false);
  const [saving, setSaving] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) setCoverImage(data.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = { title, slug, description, content, coverImage, demoUrl, tags, published };

    if (project) {
      await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setSaving(false);
    onDone();
  }

  return (
    <div>
      <button onClick={onDone} className="text-sm text-muted hover:text-foreground mb-4">
        &larr; Back to projects
      </button>
      <h2 className="text-lg font-semibold mb-4">
        {project ? "Edit Project" : "New Project"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <Field label="Title" value={title} onChange={setTitle} required />
        <Field label="Slug" value={slug} onChange={setSlug} placeholder="auto-generated from title" />
        <Field label="Description" value={description} onChange={setDescription} required />
        <Field label="Demo URL" value={demoUrl} onChange={setDemoUrl} placeholder="https://..." />
        <Field label="Tags" value={tags} onChange={setTags} placeholder="AI, React, Design (comma-separated)" />
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
          {coverImage && (
            <img src={coverImage} alt="Cover" className="mt-2 h-32 rounded-lg object-cover" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content (HTML)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-3 py-2 border border-border rounded-lg font-mono text-sm"
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : project ? "Update" : "Create"}
          </button>
          <button type="button" onClick={onDone} className="px-6 py-2 rounded-lg text-sm border border-border">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   SETTINGS MANAGER
   ============================================================ */
function SettingsManager() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSaved(false);

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!settings) return <p className="text-muted">Loading settings...</p>;

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
      {/* Chatbot Settings */}
      <section>
        <h2 className="text-lg font-semibold mb-4">AI Chatbot</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Claude API Key</label>
            <input
              type="password"
              value={settings.chatbotApiKey}
              onChange={(e) => setSettings({ ...settings, chatbotApiKey: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder="sk-ant-..."
            />
            <p className="text-xs text-muted mt-1">
              Get your key from console.anthropic.com
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">System Prompt</label>
            <textarea
              value={settings.chatbotPrompt}
              onChange={(e) => setSettings({ ...settings, chatbotPrompt: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Social Links</h2>
        <div className="space-y-4">
          <Field
            label="X / Twitter URL"
            value={settings.socialTwitter}
            onChange={(v) => setSettings({ ...settings, socialTwitter: v })}
            placeholder="https://x.com/yourhandle"
          />
          <Field
            label="GitHub URL"
            value={settings.socialGithub}
            onChange={(v) => setSettings({ ...settings, socialGithub: v })}
            placeholder="https://github.com/yourhandle"
          />
          <Field
            label="LinkedIn URL"
            value={settings.socialLinkedin}
            onChange={(v) => setSettings({ ...settings, socialLinkedin: v })}
            placeholder="https://linkedin.com/in/yourhandle"
          />
          <Field
            label="Email"
            value={settings.socialEmail}
            onChange={(v) => setSettings({ ...settings, socialEmail: v })}
            placeholder="you@example.com"
          />
        </div>
      </section>

      {/* About Page Content */}
      <section>
        <h2 className="text-lg font-semibold mb-4">About Page</h2>
        <div>
          <label className="block text-sm font-medium mb-1">About Content (HTML)</label>
          <textarea
            value={settings.aboutContent}
            onChange={(e) => setSettings({ ...settings, aboutContent: e.target.value })}
            rows={10}
            className="w-full px-3 py-2 border border-border rounded-lg font-mono text-sm"
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-accent text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && <span className="text-sm text-green-600">Settings saved!</span>}
      </div>
    </form>
  );
}

/* ============================================================
   SHARED FIELD COMPONENT
   ============================================================ */
function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
