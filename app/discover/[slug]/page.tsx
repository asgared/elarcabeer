import {Metadata} from "next";
import {notFound} from "next/navigation";

import {Container} from "@/components/ui/container";
import {posts} from "@/data/posts";
import type {ContentPost} from "@/types/catalog";

const getPost = (slug: string): ContentPost | undefined =>
  posts.find((post) => post.slug === slug);

export async function generateMetadata({params}: {params: {slug: string}}): Promise<Metadata> {
  const post = getPost(params.slug);

  if (!post) {
    return {title: "Contenido no encontrado"};
  }

  return {
    title: post.title,
    description: post.excerpt
  };
}

export default function DiscoverDetailPage({params}: {params: {slug: string}}) {
  const post = getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <Container maxW="4xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            {post.category}
          </p>
          <h1 className="text-3xl font-semibold md:text-4xl">{post.title}</h1>
          <p className="text-sm text-white/50">Publicado el {post.publishedAt}</p>
        </div>
        <p className="text-lg text-white/80">{post.body}</p>
      </div>
    </Container>
  );
}
