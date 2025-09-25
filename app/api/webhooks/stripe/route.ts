import {NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json();

  console.log("Stripe webhook recibido", payload.type);

  return NextResponse.json({received: true});
}
