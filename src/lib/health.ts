import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getStripeClient } from "./stripe";

type CheckStatus = "ok" | "warn" | "error";

export type HealthCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  details?: string;
};

export type HealthReport = {
  status: CheckStatus;
  checks: HealthCheck[];
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function checkDatabase(): Promise<HealthCheck> {
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);

    return {
      id: "database",
      label: "Base de datos",
      status: "ok",
    };
  } catch (error) {
    return {
      id: "database",
      label: "Base de datos",
      status: "error",
      details: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

function checkStripeKeys(): HealthCheck {
  if (!stripeSecretKey || !stripeSecretKey.startsWith("sk_test_")) {
    return {
      id: "stripe-secret",
      label: "Stripe secret key",
      status: "error",
      details: "Define STRIPE_SECRET_KEY con una clave sk_test_",
    };
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_")) {
    return {
      id: "stripe-publishable",
      label: "Stripe publishable key",
      status: "error",
      details: "Define NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY con una clave pk_test_",
    };
  }

  if (!stripeWebhookSecret || !stripeWebhookSecret.startsWith("whsec_")) {
    return {
      id: "stripe-webhook",
      label: "Stripe webhook",
      status: "error",
      details: "Configura STRIPE_WEBHOOK_SECRET con el valor whsec_ de tu endpoint",
    };
  }
  
  if (!getStripeClient()) {
    return {
      id: "stripe-client",
      label: "Stripe SDK",
      status: "error",
      details: "No fue posible inicializar Stripe",
    };
  }


  return {
    id: "stripe",
    label: "Stripe",
    status: "ok",
  };
}

function checkNextAuth(): HealthCheck {
  if (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
    return {
      id: "nextauth",
      label: "NextAuth",
      status: "error",
      details: "NEXTAUTH_SECRET y NEXTAUTH_URL son obligatorios",
    };
  }

  return {
    id: "nextauth",
    label: "NextAuth",
    status: "ok",
  };
}

function checkMapbox(): HealthCheck {
  if (!process.env.MAPBOX_TOKEN || !process.env.MAPBOX_TOKEN.startsWith("pk.")) {
    return {
      id: "mapbox",
      label: "Mapbox",
      status: "error",
      details: "Configura MAPBOX_TOKEN con un token público pk.",
    };
  }

  return {
    id: "mapbox",
    label: "Mapbox",
    status: "ok",
  };
}

function checkResend(): HealthCheck {
  if (!process.env.RESEND_API_KEY?.startsWith("re_")) {
    return {
      id: "resend",
      label: "Resend",
      status: "warn",
      details: "RESEND_API_KEY es recomendable para emails transaccionales",
    };
  }

  return {
    id: "resend",
    label: "Resend",
    status: "ok",
  };
}

function checkCloudinary(): HealthCheck {
  if (!process.env.CLOUDINARY_URL?.startsWith("cloudinary://")) {
    return {
      id: "cloudinary",
      label: "Cloudinary",
      status: "warn",
      details: "CLOUDINARY_URL no configurada",
    };
  }

  return {
    id: "cloudinary",
    label: "Cloudinary",
    status: "ok",
  };
}

export async function runHealthChecks(): Promise<HealthReport> {
  const checks = [
    await checkDatabase(),
    checkStripeKeys(),
    checkNextAuth(),
    checkMapbox(),
    checkResend(),
    checkCloudinary(),
  ];

  const hasError = checks.some((check) => check.status === "error");
  const hasWarning = checks.some((check) => check.status === "warn");

  return {
    status: hasError ? "error" : hasWarning ? "warn" : "ok",
    checks,
  };
}
