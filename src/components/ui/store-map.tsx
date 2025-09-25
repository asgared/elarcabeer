"use client";

import {Box, Text} from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import {useEffect, useRef} from "react";

import {Store} from "../../types/catalog";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

type Props = {
  stores: Store[];
};

export function StoreMap({stores}: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (!mapboxgl.accessToken) return;

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-99.17, 19.42],
      zoom: 11
    });

    stores.forEach((store) => {
      new mapboxgl.Marker({color: "#35A3B3"})
        .setLngLat(store.coordinates)
        .setPopup(new mapboxgl.Popup().setText(store.name))
        .addTo(mapInstance.current!);
    });

    return () => {
      mapInstance.current?.remove();
    };
  }, [stores]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <Box borderRadius="2xl" borderWidth="1px" p={8} textAlign="center">
        <Text color="whiteAlpha.700">
          Configura NEXT_PUBLIC_MAPBOX_TOKEN para visualizar el mapa de bares.
        </Text>
      </Box>
    );
  }

  return <Box ref={mapContainer} borderRadius="2xl" borderWidth="1px" h={{base: "320px", md: "480px"}} />;
}
