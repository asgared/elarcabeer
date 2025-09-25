"use client";

import {Box, Heading, Progress, Stack, Text} from "@chakra-ui/react";

import {LoyaltyProgress as LoyaltyProgressType} from "../../types/catalog";

type Props = {
  progress: LoyaltyProgressType;
};

export function LoyaltyProgress({progress}: Props) {
  const percentage = Math.min(100, Math.round((progress.points / progress.nextTierPoints) * 100));

  return (
    <Box borderRadius="2xl" borderWidth="1px" p={8} bg="rgba(19,58,67,0.65)">
      <Stack spacing={4}>
        <Heading size="lg">Tu travesía como {progress.tier}</Heading>
        <Text color="whiteAlpha.700">
          Has acumulado {progress.points} puntos. ¡Estás a {progress.nextTierPoints - progress.points} de
          alcanzar el siguiente rango!
        </Text>
        <Progress borderRadius="full" colorScheme="teal" value={percentage} />
      </Stack>
    </Box>
  );
}
