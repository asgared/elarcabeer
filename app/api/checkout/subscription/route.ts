import {NextResponse} from "next/server";

export async function POST() {
  return NextResponse.json({
    portalUrl: "https://billing.stripe.com/test-portal"
  });
}
