// @ts-nocheck
import { PrismaClient } from "@prisma/client";

import { bundles } from "../src/data/bundles";
import { posts } from "../src/data/posts";
import { products } from "../src/data/products";
import { stores } from "../src/data/stores";
// import { hashPassword } from "../src/utils/auth"; // <- ELIMINADO

const prisma = new PrismaClient();

async function main() {
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

  // --- INICIO DE CAMBIOS EN PRODUCT ---
  await Promise.all(
    products.map((product) =>
      prisma.product.create({
        data: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          categoryLabel: product.category, // Mapeado de 'category'
          style: product.style,
          rating: product.rating,
          limitedEdition: product.limited ?? false, // Mapeado de 'limited'

          // --- Campos Nuevos/Refactorizados ---
          type: "BEER", // Asignar el tipo de producto por defecto
          images: { // Mover heroImage al nuevo campo JSON
            main: product.heroImage,
            gallery: [], // Asumir que 'gallery' está vacío o mapear 'product.gallery' si existe
          },
          metadata: { // Crear el campo JSON de metadata
            // Si tu objeto 'product' tuviera 'tastingNotes' o 'pairings', irían aquí:
            // "tasting_notes": product.tastingNotes ?? [],
            // "pairings": product.pairings ?? []
          },
          // --- Fin Campos Nuevos/Refactorizados ---

          variants: {
            create: product.variants.map((variant) => ({
              id: variant.id,
              name: variant.name,
              price: variant.price,
              stock: variant.stock ?? 0,

              // --- Campos Nuevos/Refactorizados ---
              // Generar un SKU (requerido por el schema)
              sku: variant.sku ?? `${product.slug.toUpperCase()}-${variant.name.toUpperCase().replace(/ /g, "-")}`, 
              
              // Mover campos específicos al JSON 'attributes'
              attributes: {
                abv: variant.abv,
                ibu: variant.ibu,
                unit_count: variant.packSize
              }
              // --- Fin Campos Nuevos/Refactorizados ---
            })),
          },
        },
      }),
    ),
  );
  // --- FIN DE CAMBIOS EN PRODUCT ---

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
              product: { connect: { id: item.productId } },
            })),
          },
        },
      }),
    ),
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
              date: new Date(),
            })),
          },
        },
      }),
    ),
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
          published: new Date(post.publishedAt),
        },
      }),
    ),
  );

  await prisma.cmsContent.createMany({
    data: [
      {
        slug: "home-hero",
        title: "Cervezas artesanales inspiradas en travesías náuticas",
        subtitle: "Navega el sabor",
        body: "Explora estilos premiados, descubre nuestras tabernas marinas y únete al club exclusivo Arca Crew.",
        imageUrl:
          "https://images.unsplash.com/photo-1514361892635-6e122620e250?auto=format&fit=crop&w=1200&q=80",
      },
      {
        slug: "site-footer",
        title: "Footer",
        subtitle: "Cervezas artesanales desde 2015",
        socialLinks: [
          { platform: "Instagram", url: "https://instagram.com/elarcabeer" },
          { platform: "Facebook", url: "https://facebook.com/elarcabeer" },
          { platform: "TikTok", url: "https://tiktok.com/@elarcabeer" },
        ],
      },
    ],
  });

  const sampleVariants = await prisma.variant.findMany({
    take: 3,
    include: { product: true },
  });

  const [firstVariant, secondVariant] = sampleVariants;

  // --- INICIO DE CAMBIOS EN USER ---
  const user = await prisma.user.create({
    data: {
      email: "sofia.martinez@example.com",
      name: "Sofía Martínez",
      // password: hashPassword("Cerveza123"), // <- ELIMINADO
      role: "USER",
      addresses: {
        create: [
          {
            label: "Casa",
            street: "Colima 200",
            city: "Ciudad de México",
            country: "México",
            postal: "06100",
          },
          {
            label: "Oficina",
            street: "Av. Reforma 350",
            city: "Ciudad de México",
            country: "México",
            postal: "06500",
          },
        ],
      },
      loyalty: {
        create: [
          {
            points: 120,
            reason: "Compra Beer Club",
          },
          {
            points: 80,
            reason: "Reseña de producto",
          },
        ],
      },
      subscriptions: {
        create: [
          {
            plan: "beer-club-premium",
            status: "active",
          },
        ],
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@elarca.mx",
      name: "Equipo El Arca",
      // password: hashPassword("Admin123!"), // <- ELIMINADO
      role: "ADMIN",
    },
  });
  // --- FIN DE CAMBIOS EN USER ---

  // El resto del script (creación de Órdenes y Pagos)
  // funciona sin cambios, ya que los campos 'price' y 'product.name'
  // siguen siendo válidos.

  if (firstVariant) {
    const total = firstVariant.price * 2;

    const order = await prisma.order.create({
      data: {
        // Tu schema no tiene 'number', así que lo comento
        // number: "ORD-1001", 
        userId: user.id,
        total,
        status: "fulfilled",
        items: {
          create: [
            {
              // Tu schema de OrderItem no tiene 'productId' o 'variantId'
              // así que simplifico el 'name'
              name: `${firstVariant.product.name} - ${firstVariant.name}`,
              quantity: 2,
              price: firstVariant.price,
              // Faltan campos en tu schema OrderItem: productId, variantId
              // Deberías añadirlos a tu schema.prisma
              productId: firstVariant.product.id,
              variantId: firstVariant.id,
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        stripeSessionId: `dummy_session_${order.id}`, // Añadido campo requerido
        status: "paid",
      },
    });
  }

  if (secondVariant) {
    const total = secondVariant.price;

    const order = await prisma.order.create({
      data: {
        // number: "ORD-1000", // Tu schema no tiene 'number'
        userId: user.id,
        total,
        status: "processing",
        items: {
          create: [
            {
              name: `${secondVariant.product.name} - ${secondVariant.name}`,
              quantity: 1,
              price: secondVariant.price,
              // Faltan campos en tu schema OrderItem: productId, variantId
              productId: secondVariant.product.id,
              variantId: secondVariant.id,
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        stripeSessionId: `dummy_session_pending_${order.id}`, // Añadido campo requerido
        status: "pending",
      },
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