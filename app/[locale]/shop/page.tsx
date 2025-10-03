"use client";

import {
  Box,
  Container,
  Divider,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text
} from "@chakra-ui/react";
import {useMemo, useState} from "react";
import {FaMagnifyingGlass} from "react-icons/fa6";

import {ProductCard} from "@/components/ui/product-card";
import {products} from "@/data/products";
import type {Product} from "@/types/catalog";

const styles: string[] = Array.from(new Set(products.map((product) => product.style)));

export default function ShopPage() {
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(9000);

  const filtered = useMemo<Product[]>(() => {
    return products.filter((product) => {
      const matchStyle = !selectedStyle || product.style === selectedStyle;
      const matchSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      const minVariant = Math.min(...product.variants.map((variant) => variant.price));
      const matchPrice = minVariant <= maxPrice * 100;
      return matchStyle && matchSearch && matchPrice;
    });
  }, [selectedStyle, search, maxPrice]);

  return (
    <Container maxW="7xl">
      <Stack spacing={10}>
        <Stack spacing={2}>
          <Heading size="2xl">Shop</Heading>
          <Text color="whiteAlpha.700">Filtra por estilo, ABV y precio para encontrar tu tesoro líquido.</Text>
        </Stack>
        <Stack
          align="stretch"
          direction={{base: "column", lg: "row"}}
          spacing={{base: 10, lg: 12}}
        >
          <Stack
            bg="rgba(19,58,67,0.65)"
            borderRadius="2xl"
            flexShrink={0}
            p={6}
            spacing={6}
            w={{base: "full", md: "320px"}}
          >
            <Stack>
              <Text fontWeight="semibold">Búsqueda</Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaMagnifyingGlass />
                </InputLeftElement>
                <Input
                  placeholder="Buscar cervezas"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </InputGroup>
            </Stack>
            <Divider borderColor="whiteAlpha.200" />
            <Stack>
              <Text fontWeight="semibold">Estilo</Text>
              <Select value={selectedStyle} onChange={(event) => setSelectedStyle(event.target.value)}>
                <option value="">Todos</option>
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </Select>
            </Stack>
            <Divider borderColor="whiteAlpha.200" />
            <Stack>
              <Text fontWeight="semibold">Precio máximo</Text>
              <Slider
                aria-label="filtro-precio"
                defaultValue={maxPrice}
                max={12000}
                min={1500}
                step={500}
                value={maxPrice}
                onChange={(value) => setMaxPrice(value)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text color="whiteAlpha.600">Hasta ${maxPrice} MXN</Text>
            </Stack>
          </Stack>
          <Box flex="1" w="full">
            <SimpleGrid columns={{base: 1, md: 2, lg: 3, xl: 4}} gap={{base: 6, md: 8}} w="full">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </SimpleGrid>
            {filtered.length === 0 ? (
              <Box mt={8} textAlign="center">
                <Text color="whiteAlpha.700">No encontramos productos con los filtros seleccionados.</Text>
              </Box>
            ) : null}
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}
