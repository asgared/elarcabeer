import {NextResponse} from "next/server";

import {stores} from "@/data/stores";

export async function GET() {
  return NextResponse.json({stores});
}
