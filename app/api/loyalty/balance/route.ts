import {NextResponse} from "next/server";

import {loyaltyProgress} from "@/data/subscriptions";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    points: loyaltyProgress.points,
    tier: loyaltyProgress.tier
  });
}
