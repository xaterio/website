import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type;

    const isImage = mimeType.startsWith("image/");
    const isPdf = mimeType === "application/pdf";

    if (!isImage && !isPdf) {
      return NextResponse.json({ error: "Format non supporté. Utilisez une image (JPG, PNG) ou un PDF." }, { status: 400 });
    }

    let messageContent;
    if (isImage) {
      messageContent = [
        {
          type: "image",
          source: { type: "base64", media_type: mimeType, data: base64 },
        },
        {
          type: "text",
          text: "Extrais le texte de ce menu de restaurant. Restitue-le tel quel, structuré par catégories (Entrées, Plats, Desserts, Boissons...) avec les noms et prix. Réponds UNIQUEMENT avec le texte du menu, sans introduction ni explication.",
        },
      ];
    } else {
      messageContent = [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        },
        {
          type: "text",
          text: "Extrais le texte de ce menu de restaurant. Restitue-le tel quel, structuré par catégories (Entrées, Plats, Desserts, Boissons...) avec les noms et prix. Réponds UNIQUEMENT avec le texte du menu, sans introduction ni explication.",
        },
      ];
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: messageContent }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const extractedText = data.content[0].text;

    return NextResponse.json({ text: extractedText });
  } catch (err) {
    console.error("extract-menu error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
