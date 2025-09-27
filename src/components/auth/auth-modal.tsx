"use client";

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text
} from "@chakra-ui/react";
import {useTranslations} from "next-intl";

import {AuthForm} from "./auth-form";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({isOpen, onClose}: AuthModalProps) {
  const t = useTranslations("auth");

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={8} pt={2}>
          <Text color="whiteAlpha.700" mb={4}>
            {t("description")}
          </Text>
          <AuthForm onSuccess={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
