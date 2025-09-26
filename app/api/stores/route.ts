import {NextResponse} from "next/server";

import {stores} from "@/data/stores";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({stores});
}
