"use client";

import {useState} from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack
} from "@chakra-ui/react";
import {useTranslations} from "next-intl";

import {useSupabase} from "@/providers/supabase-provider";

type AuthFormProps = {
  onSuccess?: () => void;
};

export function AuthForm({onSuccess}: AuthFormProps) {
  const t = useTranslations("auth");
  const {supabase} = useSupabase();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMode = () => {
    setMode((current) => (current === "signIn" ? "signUp" : "signIn"));
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "signIn") {
        const {error: signInError} = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          throw signInError;
        }

        setMessage(t("successSignIn"));
        setEmail("");
        setPassword("");
        onSuccess?.();
      } else {
        const {error: signUpError} = await supabase.auth.signUp({
          email,
          password
        });

        if (signUpError) {
          throw signUpError;
        }

        setMessage(t("successSignUp"));
        setPassword("");
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : t("errorGeneric")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack as="form" onSubmit={handleSubmit} spacing={4}>
      {error ? (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      <FormControl isRequired>
        <FormLabel>{t("email")}</FormLabel>
        <Input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="crew@elarca.mx"
          type="email"
          value={email}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>{t("password")}</FormLabel>
        <Input
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          type="password"
          value={password}
        />
      </FormControl>
      <Button colorScheme="gold" isLoading={isSubmitting} type="submit">
        {mode === "signIn" ? t("signIn") : t("signUp")}
      </Button>
      <Button isDisabled={isSubmitting} onClick={toggleMode} type="button" variant="ghost">
        {mode === "signIn" ? t("switchToSignUp") : t("switchToSignIn")}
      </Button>
    </Stack>
  );
}
