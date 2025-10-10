import {NextResponse} from "next/server";

import {products as catalogProducts} from "@/data/products";

type ProductPayload = {
  id?: string;
  name?: unknown;
  slug?: unknown;
  sku?: unknown;
  description?: unknown;
  price?: unknown;
  stock?: unknown;
  style?: unknown;
  rating?: unknown;
  limited?: unknown;
  imageUrl?: unknown;
};

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `prod-${Math.random().toString(36).slice(2)}`;
};

const coerceNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const toAdminProduct = (payload: ProductPayload) => {
  const id =
    typeof payload.id === "string"
      ? payload.id
      : typeof payload.sku === "string" && payload.sku
      ? payload.sku
      : typeof payload.slug === "string" && payload.slug
      ? payload.slug
      : generateId();

  return {
    id,
    name: typeof payload.name === "string" ? payload.name : "Producto sin nombre",
    slug: typeof payload.slug === "string" ? payload.slug : undefined,
    sku: typeof payload.sku === "string" ? payload.sku : undefined,
    description: typeof payload.description === "string" ? payload.description : undefined,
    price: coerceNumber(payload.price),
    stock: coerceNumber(payload.stock),
    style: typeof payload.style === "string" ? payload.style : undefined,
    rating: coerceNumber(payload.rating),
    limited: typeof payload.limited === "boolean" ? payload.limited : undefined,
    imageUrl: typeof payload.imageUrl === "string" ? payload.imageUrl : undefined,
    heroImage: typeof payload.imageUrl === "string" ? payload.imageUrl : undefined,
  };
};

export async function GET() {
  return NextResponse.json({products: catalogProducts});
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductPayload;

    if (typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        {error: "El nombre del producto es obligatorio."},
        {status: 400}
      );
    }

    if (typeof body.imageUrl !== "string" || body.imageUrl.trim() === "") {
      return NextResponse.json(
        {error: "La imagen del producto es obligatoria."},
        {status: 400}
      );
    }

    const product = toAdminProduct(body);

    return NextResponse.json({product}, {status: 201});
  } catch (error) {
    console.error("Error creating admin product", error);
    return NextResponse.json(
      {error: "No se pudo crear el producto."},
      {status: 500}
    );
  }
}
