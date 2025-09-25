// @ts-nocheck
import {PrismaClient} from "@prisma/client";

import {bundles} from "../src/data/bundles";
import {posts} from "../src/data/posts";
import {products} from "../src/data/products";
import {stores} from "../src/data/stores";

const prisma = new PrismaClient();

async function main() {
  await prisma.bundleItem.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.contentPost.deleteMany();

  await Promise.all(
    products.map((product) =>
      prisma.product.create({
        data: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          category: product.category,
          style: product.style,
          rating: product.rating,
          heroImage: product.heroImage,
          limited: product.limitedEdition ?? false,
          variants: {
            create: product.variants.map((variant) => ({
              id: variant.id,
              name: variant.name,
              abv: variant.abv,
              ibu: variant.ibu,
              packSize: variant.packSize,
              price: variant.price
            }))
          }
        }
      })
    )
  );

  await Promise.all(
    bundles.map((bundle) =>
      prisma.bundle.create({
        data: {
          id: bundle.id,
          slug: bundle.slug,
          name: bundle.name,
          description: bundle.description,
          price: bundle.price,
          savings: bundle.savingsPercentage,
          image: bundle.image,
          items: {
            create: bundle.products.map((item) => ({
              quantity: item.quantity,
              product: {connect: {id: item.productId}}
            }))
          }
        }
      })
    )
  );

  await Promise.all(
    stores.map((store) =>
      prisma.store.create({
        data: {
          id: store.id,
          slug: store.slug,
          name: store.name,
          address: store.address,
          latitude: store.coordinates[1],
          longitude: store.coordinates[0],
          petFriendly: store.petFriendly,
          kitchen: store.kitchen,
          events: store.events,
          hours: store.hours,
          menuUrl: store.menuUrl ?? null,
          upcomingEvents: {
            create: store.upcomingEvents.map((event, index) => ({
              id: `${store.id}-event-${index}`,
              title: event,
              date: new Date()
            }))
          }
        }
      })
    )
  );

  await Promise.all(
    posts.map((post) =>
      prisma.contentPost.create({
        data: {
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          tags: post.tags.join(","),
          category: post.category,
          published: new Date(post.publishedAt)
        }
      })
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
