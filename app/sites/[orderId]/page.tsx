import { getSupabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function SitePage({ params }: Props) {
  const { orderId } = await params;
  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select("site_html, business_name, status")
    .eq("id", orderId)
    .single();

  if (!order) return notFound();

  if (order.status === "generating" || order.status === "paid") {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 rounded-full animate-spin border-t-transparent mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Votre site est en cours de génération...</h1>
          <p className="text-gray-400">Actualisez cette page dans quelques minutes.</p>
        </div>
      </div>
    );
  }

  if (!order.site_html) return notFound();

  // Serve the generated HTML directly
  return (
    <div
      dangerouslySetInnerHTML={{ __html: order.site_html }}
    />
  );
}
