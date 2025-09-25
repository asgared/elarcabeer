import {Container, Heading, SimpleGrid, Stack, Text} from "@chakra-ui/react";

import {posts} from "@/data/posts";
import Link from "next/link";

export default function DiscoverPage() {
  return (
    <Container maxW="5xl">
      <Stack spacing={8}>
        <Stack spacing={2}>
          <Heading size="2xl">Discover</Heading>
          <Text color="whiteAlpha.700">
            Historias, recetas y noticias desde la cubierta de El Arca.
          </Text>
        </Stack>
        <SimpleGrid columns={{base: 1, md: 2}} gap={8}>
          {posts.map((post) => (
            <Stack key={post.id} borderRadius="2xl" borderWidth="1px" p={6} spacing={3}>
              <Text fontSize="sm" letterSpacing="0.2em" textTransform="uppercase" color="gold.500">
                {post.category}
              </Text>
              <Heading size="md">
                <Link href={`/discover/${post.slug}`}>{post.title}</Link>
              </Heading>
              <Text color="whiteAlpha.700">{post.excerpt}</Text>
              <Text color="whiteAlpha.500">Publicado el {post.publishedAt}</Text>
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
