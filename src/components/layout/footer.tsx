"use client";

import {Container} from "@/components/ui/container";
import {Box, HStack, Icon, Link, Stack, Text} from "@chakra-ui/react";
import {FaFacebookF, FaInstagram, FaTiktok, FaTwitter, FaYoutube} from "react-icons/fa6";

import type {SocialLink} from "@/types/cms";

type FooterProps = {
  subtitle?: string | null;
  socialLinks?: SocialLink[];
};

function resolveIcon(platform: string) {
  const normalized = platform.toLowerCase();

  if (normalized.includes("insta")) return FaInstagram;
  if (normalized.includes("face")) return FaFacebookF;
  if (normalized.includes("tiktok")) return FaTiktok;
  if (normalized.includes("youtube")) return FaYoutube;
  if (normalized.includes("twitter") || normalized.includes("x")) return FaTwitter;

  return null;
}

export function Footer({subtitle, socialLinks = []}: FooterProps) {
  return (
    <Box as="footer" borderTopWidth="1px" mt={16} py={12}>
      <Container maxW="6xl">
        <Stack
          direction={{base: "column", md: "row"}}
          justify="space-between"
          spacing={{base: 8, md: 6}}
          w="full"
        >
          <Stack spacing={2} maxW="md">
            <Text fontWeight="bold">El Arca Cervecería</Text>
            <Text color="whiteAlpha.600">{subtitle ?? "Cervezas artesanales desde 2015"}</Text>
            {socialLinks.length ? (
              <Stack direction="row" flexWrap="wrap" spacing={4} pt={2}>
                {socialLinks.map((link) => {
                  const IconComponent = resolveIcon(link.platform);

                  return (
                    <Link key={`${link.platform}-${link.url}`} href={link.url} isExternal color="whiteAlpha.700">
                      <HStack spacing={2} minH={8}>
                        {IconComponent ? <Icon as={IconComponent} /> : null}
                        <Text fontSize="sm">{link.platform}</Text>
                      </HStack>
                    </Link>
                  );
                })}
              </Stack>
            ) : null}
          </Stack>
          <Stack
            align={{base: "flex-start", md: "flex-end"}}
            direction={{base: "column", sm: "row"}}
            spacing={{base: 3, sm: 6}}
            textAlign={{base: "left", md: "right"}}
          >
            <Link href="/legal/privacy">Privacidad</Link>
            <Link href="/legal/terms">Términos</Link>
            <Link href="/legal/shipping">Envíos</Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
