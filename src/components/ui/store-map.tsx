"use client";

import {Box, Text, Tooltip} from "@chakra-ui/react";
import {useMemo} from "react";

import type {Store} from "../../types/catalog";

type Props = {
  stores: Store[];
};

type Projection = {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
};

function calculateProjection(stores: Store[]): Projection | null {
  if (stores.length === 0) {
    return null;
  }

  const lngs = stores.map((store) => store.coordinates[0]);
  const lats = stores.map((store) => store.coordinates[1]);

  return {
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  };
}

function projectCoordinate([lng, lat]: Store["coordinates"], projection: Projection) {
  const {minLng, maxLng, minLat, maxLat} = projection;
  const lngRange = maxLng - minLng || 1;
  const latRange = maxLat - minLat || 1;

  const x = ((lng - minLng) / lngRange) * 100;
  const y = (1 - (lat - minLat) / latRange) * 100;

  return {x, y};
}

export function StoreMap({stores}: Props) {
  const projection = useMemo(() => calculateProjection(stores), [stores]);

  if (!projection) {
    return (
      <Box borderRadius="2xl" borderWidth="1px" p={8} textAlign="center">
        <Text color="whiteAlpha.700">No hay bares para mostrar en el mapa.</Text>
      </Box>
    );
  }

  return (
    <Box
      borderRadius="2xl"
      borderWidth="1px"
      h={{base: "320px", md: "480px"}}
      position="relative"
      overflow="hidden"
      bgGradient="linear(to-br, rgba(19,58,67,0.85), rgba(12,27,30,0.95))"
    >
      <Box
        position="absolute"
        inset={0}
        bgImage="radial-gradient(circle at 1px 1px, rgba(53,163,179,0.15) 1px, transparent 0)"
        backgroundSize="32px 32px"
        opacity={0.6}
        pointerEvents="none"
      />
      {stores.map((store) => {
        const {x, y} = projectCoordinate(store.coordinates, projection);

        return (
          <Tooltip key={store.id} label={store.name} hasArrow>
            <Box
              aria-label={store.name}
              bg="gold.500"
              borderRadius="full"
              boxShadow="0 0 0 2px #0C1B1E, 0 0 12px rgba(198,161,91,0.6)"
              h={4}
              w={4}
              position="absolute"
              left={`${x}%`}
              top={`${y}%`}
              transform="translate(-50%, -50%)"
              _before={{
                content: '""',
                position: "absolute",
                inset: "-12px",
                borderRadius: "full",
                bg: "rgba(198,161,91,0.12)"
              }}
            />
          </Tooltip>
        );
      })}
      <Box position="absolute" bottom={4} left={4} right={4} textAlign="right">
        <Text color="whiteAlpha.700" fontSize="sm">
          Mapa ilustrativo generado sin dependencias externas.
        </Text>
      </Box>
    </Box>
  );
}
