import Image from "next/image";
import {motion} from "framer-motion";

import {Container} from "@/components/ui/container";

import HeaderArca from "./HeaderArca";

const MotionBox = motion.div;

const ComingSoon = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-r from-background via-[#143137] to-muted text-foreground">
      <HeaderArca />
      <div className="flex flex-1 items-center justify-center px-6 md:px-0">
        <Container className="max-w-3xl space-y-12 text-center">
          <MotionBox
            className="flex justify-center"
            animate={{scale: [1, 1.15, 1], rotate: [0, 6, -6, 0]}}
            transition={{duration: 4, ease: "easeInOut", repeat: Infinity}}
          >
            <Image
              src="/logos/arca_logo_complete.svg"
              width={240}
              height={120}
              priority
              alt="El Arca Beer logo"
            />
          </MotionBox>

          <div className="flex flex-col items-center gap-6">
            <h1 className="text-3xl font-semibold md:text-4xl">Muy pronto zarparemos contigo</h1>
            <p className="max-w-3xl text-lg text-foreground/80 md:text-xl">
              Estamos afinando los últimos detalles para compartir nuestra selección de cervezas
              artesanales inspiradas en grandes travesías. Suscríbete a nuestras redes y sé de las
              primeras personas en conocer la fecha de lanzamiento.
            </p>
          </div>

          <MotionBox
            className="relative mx-auto h-48 w-full max-w-xs md:h-60 md:max-w-sm"
            animate={{y: [-20, 10, -20], rotate: [0, 3, -3, 0]}}
            transition={{duration: 5, ease: "easeInOut", repeat: Infinity}}
          >
            <Image
              src="/logos/beer_glasses.svg"
              alt="Beer glasses cheers"
              fill
              style={{objectFit: "contain"}}
              sizes="(max-width: 768px) 240px, 320px"
            />
          </MotionBox>
        </Container>
      </div>
    </div>
  );
};

export default ComingSoon;
