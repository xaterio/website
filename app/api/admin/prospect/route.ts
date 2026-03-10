import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { searchCompanies, TARGET_NAF_CODES } from "@/scripts/prospector/pappers";
import { hasWebsite, extractEmail } from "@/scripts/prospector/check-website";
import { findEmailForCompany } from "@/scripts/prospector/find-email";
import { sendProspectionEmail } from "@/lib/resend";

export const runtime = "nodejs";
export const maxDuration = 300;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getDirectorName(company: { representants?: Array<{ nom?: string; prenom?: string }> }) {
  const rep = company.representants?.[0];
  if (!rep) return undefined;
  return rep.prenom ? `${rep.prenom} ${rep.nom || ""}`.trim() : rep.nom;
}

export async function POST(req: NextRequest) {
  const { secret, departement, max = 10 } = await req.json();

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const maxEmails = Math.min(Number(max), 15); // Hard cap at 15 per run
  const supabase = getSupabaseAdmin();

  // Load already contacted SIRENs from Supabase
  const { data: contacted } = await supabase
    .from("prospected_companies")
    .select("siren");
  const contactedSirens = new Set((contacted || []).map((r: { siren: string }) => r.siren));

  const results: Array<{ company: string; email: string; city: string; status: "sent" | "skip_site" | "skip_email" | "skip_contacted" | "error" }> = [];
  let emailsSent = 0;

  // Shuffle NAF codes to vary targets each run
  const shuffled = [...TARGET_NAF_CODES].sort(() => Math.random() - 0.5);

  outer:
  for (const naf of shuffled) {
    let page = 1;
    while (emailsSent < maxEmails) {
      let companies;
      try {
        const res = await searchCompanies({
          minRevenue: 150_000,
          maxRevenue: 2_000_000,
          page,
          perPage: 20,
          departement: departement || undefined,
          codeNaf: naf,
        });
        companies = res.resultats;
      } catch {
        break; // Move to next NAF code
      }

      if (!companies || companies.length === 0) break;

      for (const company of companies) {
        if (emailsSent >= maxEmails) break outer;

        const siren = company.siren;
        const name = company.nom_entreprise;
        const city = company.siege?.ville || "";

        // Skip already contacted
        if (contactedSirens.has(siren)) {
          results.push({ company: name, email: "", city, status: "skip_contacted" });
          continue;
        }

        // Skip if has website
        const siteWeb = company.siege?.site_web;
        const alreadyHasSite = await hasWebsite(name, siteWeb);
        if (alreadyHasSite) {
          results.push({ company: name, email: "", city, status: "skip_site" });
          contactedSirens.add(siren); // Don't check again
          continue;
        }

        // Find email
        let email = extractEmail(company);
        if (!email) {
          email = await findEmailForCompany(name, city);
        }

        if (!email) {
          results.push({ company: name, email: "", city, status: "skip_email" });
          continue;
        }

        // Send email
        try {
          await sendProspectionEmail({
            to: email,
            companyName: name,
            directorName: getDirectorName(company),
          });

          // Save to Supabase
          await supabase.from("prospected_companies").insert({
            siren,
            company_name: name,
            email,
            city,
          });
          contactedSirens.add(siren);

          results.push({ company: name, email, city, status: "sent" });
          emailsSent++;

          await sleep(600);
        } catch {
          results.push({ company: name, email, city, status: "error" });
        }
      }

      page++;
      if (companies.length < 20) break; // No more pages
    }
  }

  return NextResponse.json({
    sent: emailsSent,
    total: results.length,
    results,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const [ordersRes, prospectsRes, recentOrdersRes, recentProspectsRes] = await Promise.all([
    supabase.from("orders").select("status", { count: "exact" }),
    supabase.from("prospected_companies").select("id", { count: "exact" }),
    supabase.from("orders").select("id,business_name,email,status,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("prospected_companies").select("company_name,email,city,contacted_at").order("contacted_at", { ascending: false }).limit(8),
  ]);

  const orders = ordersRes.data || [];
  const ordersByStatus = orders.reduce((acc: Record<string, number>, o: { status: string }) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    orders: {
      total: ordersRes.count || 0,
      byStatus: ordersByStatus,
      recent: recentOrdersRes.data || [],
    },
    prospection: {
      total: prospectsRes.count || 0,
      recent: recentProspectsRes.data || [],
    },
  });
}
