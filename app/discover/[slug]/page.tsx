import {Container} from "@/components/ui/container";
import {Heading, Stack, Text} from "@chakra-ui/react";
import {Metadata} from "next";
import {notFound} from "next/navigation";

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
      <Stack spacing={6}>
        <Stack spacing={2}>
          <Text fontSize="sm" letterSpacing="0.2em" textTransform="uppercase" color="gold.500">
            {post.category}
          </Text>
          <Heading size="2xl">{post.title}</Heading>
          <Text color="whiteAlpha.500">Publicado el {post.publishedAt}</Text>
        </Stack>
        <Text color="whiteAlpha.800" fontSize="lg">
          {post.body}
        </Text>
      </Stack>
    </Container>
  );
}
