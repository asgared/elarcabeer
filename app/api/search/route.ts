import {NextRequest, NextResponse} from "next/server";

import {posts} from "@/data/posts";
import {prisma} from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() ?? "";

  const productRecords = await prisma.product.findMany({
    where: {
      OR: [
        {name: {contains: query, mode: "insensitive"}},
        {description: {contains: query, mode: "insensitive"}}
      ]
    },
    orderBy: {updatedAt: "desc"},
    select: {name: true, slug: true},
    take: 10
  });

  const productResults = productRecords.map((product) => ({
    type: "product",
    name: product.name,
    href: `/products/${product.slug}`
  }));

  const postResults = posts
    .filter((post) => post.title.toLowerCase().includes(query))
    .map((post) => ({
      type: "post",
      name: post.title,
      href: `/discover/${post.slug}`
    }));

  return NextResponse.json({results: [...productResults, ...postResults]});
}
