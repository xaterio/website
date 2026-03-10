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

/**
 * Normalise un numéro FR et renvoie true s'il est mobile (06 ou 07)
 * Retourne le numéro formaté +33... ou null si non mobile / invalide
 */
function mobileE164(raw: string | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[\s.\-()]/g, "");
  // Formats: 06XXXXXXXX, 07XXXXXXXX, +336XXXXXXXX, +337XXXXXXXX, 336XXXXXXXX
  let normalized = digits;
  if (normalized.startsWith("+33")) normalized = "0" + normalized.slice(3);
  if (normalized.startsWith("33") && normalized.length === 11) normalized = "0" + normalized.slice(2);
  if ((normalized.startsWith("06") || normalized.startsWith("07")) && normalized.length === 10) {
    return "+33" + normalized.slice(1);
  }
  return null;
}

async function sendBrevoSms(to: string, message: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;
  try {
    const res = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "Alexandre", recipient: to, content: message }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { secret, departement, max = 100 } = await req.json();

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const maxEmails = Number(max);
  const supabase = getSupabaseAdmin();

  // Load already contacted SIRENs from Supabase
  const { data: contacted } = await supabase
    .from("prospected_companies")
    .select("siren");
  const contactedSirens = new Set((contacted || []).map((r: { siren: string }) => r.siren));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alexwebdesign.pro";

  const results: Array<{
    company: string;
    email: string;
    phone?: string;
    city: string;
    status: "sent" | "sent_sms" | "skip_site" | "skip_email" | "skip_contacted" | "error";
  }> = [];
  let emailsSent = 0;
  let smsSent = 0;

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
          perPage: 25,
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
        const rawPhone = company.siege?.telephone;

        // Skip already contacted
        if (contactedSirens.has(siren)) {
          results.push({ company: name, email: "", city, status: "skip_contacted" });
          continue;
        }

        // Skip if has website
        const alreadyHasSite = await hasWebsite(name, company.siege?.site_web);
        if (alreadyHasSite) {
          results.push({ company: name, email: "", city, status: "skip_site" });
          contactedSirens.add(siren);
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

          // Check for mobile number → send SMS via Brevo
          const mobileNumber = mobileE164(rawPhone);
          let smsSentForThis = false;
          if (mobileNumber) {
            const smsText =
              `Bonjour, je suis Alexandre (16 ans, dev web). ` +
              `Je crée des sites pro pour les PME à seulement 149€. ` +
              `Intéressé pour ${name} ? Voir mes réalisations : ${siteUrl}`;
            smsSentForThis = await sendBrevoSms(mobileNumber, smsText);
            if (smsSentForThis) smsSent++;
          }

          // Save to Supabase
          await supabase.from("prospected_companies").insert({
            siren,
            company_name: name,
            email,
            city,
          });
          contactedSirens.add(siren);

          results.push({
            company: name,
            email,
            phone: mobileNumber || undefined,
            city,
            status: smsSentForThis ? "sent_sms" : "sent",
          });
          emailsSent++;

          await sleep(400);
        } catch {
          results.push({ company: name, email, city, status: "error" });
        }
      }

      page++;
      if (companies.length < 25) break; // No more pages for this NAF
    }
  }

  return NextResponse.json({
    sent: emailsSent,
    sentSms: smsSent,
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
