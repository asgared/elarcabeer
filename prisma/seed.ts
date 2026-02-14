// @ts-nocheck
import { PrismaClient } from "@prisma/client";

import { bundles } from "../src/data/bundles";
import { posts } from "../src/data/posts";
import { products } from "../src/data/products";
import { stores } from "../src/data/stores";

const prisma = new PrismaClient();

function assertNotProduction() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "🛑 Seed script BLOCKED: NODE_ENV is 'production'. " +
      "Seeds must never run in production environments."
    );
  }

  const dbUrl = process.env.DATABASE_URL ?? "";

  // Block if DATABASE_URL looks like a production Supabase or managed DB
  if (
    dbUrl.includes(".supabase.co") &&
    !dbUrl.includes("localhost") &&
    !dbUrl.includes("127.0.0.1")
  ) {
    const allowProdSeed = process.env.ALLOW_SEED_ON_REMOTE === "true";

    if (!allowProdSeed) {
      throw new Error(
        "🛑 Seed script BLOCKED: DATABASE_URL points to a remote Supabase instance. " +
        "Set ALLOW_SEED_ON_REMOTE=true to override (only for staging!)."
      );
    }
  }
}

async function main() {
  assertNotProduction();

  await prisma.bundleItem.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.contentPost.deleteMany();
  await prisma.cmsContent.deleteMany();
  await prisma.adminSession.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.loyaltyLedger.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

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
              product: { connect: { id: item.productId } }
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

  await prisma.cmsContent.createMany({
    data: [
      {
        slug: "home-hero",
        title: "Cervezas artesanales inspiradas en travesías náuticas",
        subtitle: "Navega el sabor",
        body: "Explora estilos premiados, descubre nuestras tabernas marinas y únete al club exclusivo Arca Crew.",
        imageUrl: "https://images.unsplash.com/photo-1514361892635-6e122620e250?auto=format&fit=crop&w=1200&q=80"
      },
      {
        slug: "site-footer",
        title: "Footer",
        subtitle: "Cervezas artesanales desde 2015",
        socialLinks: [
          { platform: "Instagram", url: "https://instagram.com/elarcabeer" },
          { platform: "Facebook", url: "https://facebook.com/elarcabeer" },
          { platform: "TikTok", url: "https://tiktok.com/@elarcabeer" }
        ]
      }
    ]
  });

  const sampleVariants = await prisma.variant.findMany({ take: 3, include: { product: true } });

  const [firstVariant, secondVariant] = sampleVariants;

  // Create sample user — email from env or safe default for dev only
  const sampleUserEmail = process.env.SEED_USER_EMAIL ?? "sofia.martinez@example.com";
  const sampleAdminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@localhost.test";

  const user = await prisma.user.create({
    data: {
      email: sampleUserEmail,
      name: "Sofía Martínez",
      role: "USER",
      addresses: {
        create: [
          {
            label: "Casa",
            street: "Colima 200",
            city: "Ciudad de México",
            country: "México",
            postal: "06100"
          },
          {
            label: "Oficina",
            street: "Av. Reforma 350",
            city: "Ciudad de México",
            country: "México",
            postal: "06500"
          }
        ]
      },
      loyalty: {
        create: [
          {
            points: 120,
            reason: "Compra Beer Club"
          },
          {
            points: 80,
            reason: "Reseña de producto"
          }
        ]
      },
      subscriptions: {
        create: [
          {
            plan: "beer-club-premium",
            status: "active"
          }
        ]
      }
    }
  });

  // Create admin user — no password (auth is handled by Supabase + AdminSession)
  await prisma.user.create({
    data: {
      email: sampleAdminEmail,
      name: "Equipo El Arca",
      role: "ADMIN"
    }
  });

  console.info("✓ Admin user seeded with email: %s (no password — use Supabase Auth)", sampleAdminEmail);

  if (firstVariant) {
    const total = firstVariant.price * 2;

    const order = await prisma.order.create({
      data: {
        number: "ORD-1001",
        userId: user.id,
        total,
        status: "fulfilled",
        items: {
          create: [
            {
              name: `${firstVariant.product.name} - ${firstVariant.name}`,
              quantity: 2,
              price: firstVariant.price
            }
          ]
        }
      }
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: "tarjeta",
        status: "paid"
      }
    });
  }

  if (secondVariant) {
    const total = secondVariant.price;

    const order = await prisma.order.create({
      data: {
        number: "ORD-1000",
        userId: user.id,
        total,
        status: "processing",
        items: {
          create: [
            {
              name: `${secondVariant.product.name} - ${secondVariant.name}`,
              quantity: 1,
              price: secondVariant.price
            }
          ]
        }
      }
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: "oxxo",
        status: "pending"
      }
    });
  }
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
