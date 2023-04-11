import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const CommingSoon = () => {
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-r, arcaGray.900, arcaGray.500)"
    >
      <Box px={3} textAlign="center">
        <MotionBox
            animate={{ scale: [1, 1.5, 1.5, 1, 1], rotate: [0, 0, 270, 270, 0] }}
            transition={{ duration: 3, ease: "easeInOut", loop: Infinity }}
            display={"flex"}
            justifyContent="center"
            mb={4}
        >
          <Image src="/logos/arca_logo_complete.svg" width={200} height={100} alt="logo" />
        </MotionBox>
        <Heading color="white" mb={4}>
          ¡Pronto estaremos listos!
        </Heading>
        <Text color="white" fontSize="xl" mb={8}>
          Estamos trabajando duro para brindarte la mejor experiencia de
          degustación de cerveza artesanal.
        </Text>
        <MotionBox
          animate={{ y: [-20, 20], rotate: [0, 10, -10, 0] }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            loop: Infinity,
            repeatDelay: 1,
          }}
          w="100%"
          h="300px"
          mb={8}
        >
          <Image
            src="/logos/beer_glasses.svg"
            layout="fill"
            objectFit="contain"
            alt="beer glasses"
          />
        </MotionBox>
      </Box>
    </Flex>
  );
};

export default CommingSoon;
