import {NextResponse} from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({
    checkoutUrl: "https://checkout.stripe.com/test-session",
    status: "created"
  });
}
