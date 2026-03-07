import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const photos = formData.getAll("photos") as File[];

    if (!photos || photos.length === 0) {
      return NextResponse.json({ urls: [] });
    }

    const supabase = getSupabaseAdmin();
    const urls: string[] = [];

    for (const photo of photos.slice(0, 10)) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = photo.name.split(".").pop() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("order-photos")
        .upload(filename, buffer, {
          contentType: photo.type,
          upsert: false,
        });

      if (!error) {
        const { data } = supabase.storage
          .from("order-photos")
          .getPublicUrl(filename);
        urls.push(data.publicUrl);
      }
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed", urls: [] }, { status: 500 });
  }
}
