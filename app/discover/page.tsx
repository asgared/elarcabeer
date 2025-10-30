import Link from "next/link";

import {Container} from "@/components/ui/container";
import {posts} from "@/data/posts";

export default function DiscoverPage() {
  return (
    <Container className="max-w-5xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold md:text-4xl">Discover</h1>
          <p className="text-white/70">
            Historias, recetas y noticias desde la cubierta de El Arca.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-background/40 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                {post.category}
              </p>
              <h2 className="text-xl font-semibold">
                <Link href={`/discover/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-sm text-white/70">{post.excerpt}</p>
              <p className="text-xs text-white/50">Publicado el {post.publishedAt}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
