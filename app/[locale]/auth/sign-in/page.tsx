import {Container, Heading, Stack, Text} from "@chakra-ui/react";
import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import type {AppLocale} from "@/i18n/locales";
import {AuthForm} from "@/components/auth/auth-form";
import {createSupabaseServerClient} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SignInPageProps = {
  params: {locale: AppLocale};
};

export default async function SignInPage({params}: SignInPageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: {session}
  } = await supabase.auth.getSession();

  if (session) {
    redirect(`/${params.locale}/account`);
  }

  const t = await getTranslations("auth");

  return (
    <Container maxW="lg" py={16}>
      <Stack spacing={6}>
        <Heading size="xl">{t("title")}</Heading>
        <Text color="whiteAlpha.700">{t("description")}</Text>
        <AuthForm />
      </Stack>
    </Container>
  );
}
