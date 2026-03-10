import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { searchBusinesses, getPlaceDetails, BUSINESS_CATEGORIES, getCity } from "@/scripts/prospector/google-maps";
import { findEmailForCompany } from "@/scripts/prospector/find-email";
import { sendProspectionEmail } from "@/lib/resend";

export const runtime = "nodejs";
export const maxDuration = 300;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function mobileE164(raw: string | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[\s.\-()]/g, "");
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
  const { secret, departement, max = 50 } = await req.json();

  if (secret !== process.env.ADMIN_SECRET) {
    return new Response("Non autorisé", { status: 401 });
  }

  const maxEmails = Number(max);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alexwebdesign.pro";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // client disconnected
        }
      };

      const stopped = () => req.signal.aborted;

      try {
        const supabase = getSupabaseAdmin();
        const { data: contacted } = await supabase.from("prospected_companies").select("siren");
        const contactedSirens = new Set((contacted || []).map((r: { siren: string }) => r.siren));

        const city = getCity(departement);
        send({ type: "start", dept: departement || "France", city, total: contactedSirens.size });

        // ── Phase 1 : collecte toutes les entreprises en parallèle ──
        send({ type: "collecting" });

        const seenPlaceIds = new Set<string>();
        type Biz = { placeId: string; name: string; city: string };
        const allBusinesses: Biz[] = [];

        // Recherches par batch de 8 catégories simultanément
        const BATCH = 8;
        for (let i = 0; i < BUSINESS_CATEGORIES.length; i += BATCH) {
          if (stopped()) break;
          const batch = BUSINESS_CATEGORIES.slice(i, i + BATCH);
          const results = await Promise.allSettled(
            batch.map(cat => searchBusinesses({ category: cat, departement }))
          );
          for (const res of results) {
            if (res.status !== "fulfilled") continue;
            for (const biz of res.value.businesses) {
              if (seenPlaceIds.has(biz.placeId)) continue;
              seenPlaceIds.add(biz.placeId);
              allBusinesses.push(biz as Biz);
            }
          }
        }

        // Tri alphabétique par nom
        allBusinesses.sort((a, b) => a.name.localeCompare(b.name, "fr"));

        send({ type: "collected", count: allBusinesses.length });

        // ── Phase 2 : traitement par ordre alphabétique ──
        let emailsSent = 0;
        let smsSent = 0;
        let skippedSite = 0;
        let skippedEmail = 0;

        for (const biz of allBusinesses) {
          if (stopped() || emailsSent >= maxEmails) break;

          const name = biz.name;
          const bizCity = biz.city;

          if (contactedSirens.has(biz.placeId)) continue;

          send({ type: "checking", name, city: bizCity });

          const details = await getPlaceDetails(biz.placeId);
          if (details.hasWebsite) {
            send({ type: "skip_site", name, city: bizCity, website: details.website });
            skippedSite++;
            contactedSirens.add(biz.placeId);
            continue;
          }

          const email = await findEmailForCompany(name, bizCity);
          if (!email) {
            const phone = mobileE164(details.phone);
            send({ type: "skip_email", name, city: bizCity, phone: phone || undefined });
            skippedEmail++;
            continue;
          }

          try {
            await sendProspectionEmail({ to: email, companyName: name });

            const mobileNumber = mobileE164(details.phone);
            let smsSentForThis = false;
            if (mobileNumber) {
              const smsText =
                `Bonjour, je m'appelle Alexandre, j'ai 16 ans et je suis passionne de developpement web. ` +
                `Je propose de creer un site professionnel pour ${name} a 150EUR. ` +
                `Garantie : remboursement si non satisfait + 1 mois de modifications gratuites. ` +
                `Decouvrez mes realisations sur : ${siteUrl}`;
              smsSentForThis = await sendBrevoSms(mobileNumber, smsText);
              if (smsSentForThis) smsSent++;
            }

            await supabase.from("prospected_companies").insert({
              siren: biz.placeId,
              company_name: name,
              email,
              city: bizCity,
            });
            contactedSirens.add(biz.placeId);
            emailsSent++;

            send({
              type: smsSentForThis ? "sent_sms" : "sent",
              name,
              city: bizCity,
              email,
              phone: mobileNumber || undefined,
              total: emailsSent,
            });

            await sleep(400);
          } catch (e) {
            send({ type: "error", name, message: String(e) });
          }
        }

        send({ type: "done", sent: emailsSent, smsSent, skippedSite, skippedEmail });
      } catch (e) {
        send({ type: "fatal", message: String(e) });
      } finally {
        controller.close();
      }
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
