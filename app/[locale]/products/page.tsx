import {listProducts} from "@/lib/catalog";

import {ProductsCatalog} from "./products-catalog";

export const revalidate = 0;

export default async function ProductsPage() {
  const products = await listProducts();

  return <ProductsCatalog products={products} />;
}

