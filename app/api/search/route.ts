import {NextRequest, NextResponse} from "next/server";

import {posts} from "@/data/posts";
import {products} from "@/data/products";

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() ?? "";

  const productResults = products
    .filter((product) =>
      product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)
    )
    .map((product) => ({
      type: "product",
      name: product.name,
      href: `/shop/${product.slug}`
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
