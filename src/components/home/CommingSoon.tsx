import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { motion } from "framer-motion";

import HeaderArca from "./HeaderArca";

const MotionBox = motion(Box);

const ComingSoon = () => {
  return (
    <Flex
      direction="column"
      minH="100vh"
      bgGradient="linear(to-r, arcaGray.900, arcaGray.500)"
      color="arcaText.900"
    >
      <HeaderArca />
      <Flex flex="1" align="center" justify="center" px={{ base: 6, md: 0 }}>
        <Container maxW="container.md" textAlign="center">
          <MotionBox
            display="flex"
            justifyContent="center"
            mb={6}
            animate={{ scale: [1, 1.15, 1], rotate: [0, 6, -6, 0] }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          >
            <Image
              src="/logos/arca_logo_complete.svg"
              width={240}
              height={120}
              priority
              alt="El Arca Beer logo"
            />
          </MotionBox>

          <VStack spacing={6} mb={12}>
            <Heading size="2xl">Muy pronto zarparemos contigo</Heading>
            <Text fontSize={{ base: "lg", md: "xl" }}>
              Estamos afinando los últimos detalles para compartir nuestra selección de
              cervezas artesanales inspiradas en grandes travesías. Suscríbete a nuestras
              redes y sé de las primeras personas en conocer la fecha de lanzamiento.
            </Text>
          </VStack>

          <MotionBox
            position="relative"
            mx="auto"
            maxW={{ base: "xs", md: "sm" }}
            h={{ base: 48, md: 60 }}
            animate={{ y: [-20, 10, -20], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
          >
            <Image
              src="/logos/beer_glasses.svg"
              alt="Beer glasses cheers"
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 240px, 320px"
            />
          </MotionBox>
        </Container>
      </Flex>
    </Flex>
  );
};

export default ComingSoon;
