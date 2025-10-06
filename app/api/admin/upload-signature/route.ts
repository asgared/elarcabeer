import {NextResponse} from "next/server";
import {v2 as cloudinary} from "cloudinary";

import {createRouteSupabaseClient} from "@/lib/supabase/route";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST() {
  const supabase = createRouteSupabaseClient();
  const {
    data: {session}
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({error: "No autorizado"}, {status: 401});
  }

  const {CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME} = process.env;

  if (!CLOUDINARY_API_SECRET || !CLOUDINARY_API_KEY || !CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json({error: "Falta configuración de Cloudinary"}, {status: 500});
  }

  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "el-arcabeer/products";
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({timestamp, folder}, CLOUDINARY_API_SECRET);

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
    folder
  });
}

