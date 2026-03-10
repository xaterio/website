#!/usr/bin/env ts-node
/**
 * Script de prospection pour GitHub Actions
 * Utilise Supabase pour le tracking (au lieu du CSV local)
 * Usage: ts-node scripts/prospector/run-gha.ts [--departement=38] [--max=50]
 */

import * as path from "path";
import * as fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { searchBusinesses, getPlaceDetails, BUSINESS_CATEGORIES } from "./google-maps";
import { findEmailForCompany } from "./find-email";
import { Resend } from "resend";

// Load .env.local if present (local dev only)
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

// ---- CLI args ----
const args = process.argv.slice(2);
const maxArg = args.find((a) => a.startsWith("--max="));
const deptArg = args.find((a) => a.startsWith("--departement="));
const maxEmails = maxArg ? parseInt(maxArg.split("=")[1]) : 50;
const departement = deptArg ? deptArg.split("=")[1] : undefined;

// ---- Init clients ----
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendKey = process.env.RESEND_API_KEY!;
const brevoKey = process.env.BREVO_API_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alexwebdesign.pro";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant");
  process.exit(1);
}
if (!resendKey) {
  console.error("❌ RESEND_API_KEY manquant");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendKey);

// ---- Utils ----
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
  if (!brevoKey) return false;
  try {
    const res = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
      method: "POST",
      headers: { "api-key": brevoKey, "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "Alexandre", recipient: to, content: message }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---- Main ----
async function main() {
  console.log(`\n🚀 Prospection démarrée — max ${maxEmails} emails${departement ? ` (dept ${departement})` : ""}`);
  console.log("=".repeat(55));

  // Load already contacted SIRENs from Supabase
  const { data: contacted } = await supabase.from("prospected_companies").select("siren");
  const contactedSirens = new Set((contacted || []).map((r: { siren: string }) => r.siren));
  console.log(`📋 ${contactedSirens.size} entreprises déjà contactées\n`);

  let emailsSent = 0;
  let smsSent = 0;
  let skippedSite = 0;
  let skippedEmail = 0;
  let errors = 0;

  const shuffled = [...BUSINESS_CATEGORIES].sort((a, b) => a.localeCompare(b, "fr"));

  // Track place IDs to avoid duplicates across categories
  const seenPlaceIds = new Set<string>();

  outer:
  for (const category of shuffled) {
    console.log(`\n🔍 Catégorie: ${category}${departement ? ` (dept ${departement})` : ""}`);
    let pageToken: string | undefined;
    let pageCount = 0;

    do {
      let result;
      try {
        result = await searchBusinesses({ category, departement, pageToken });
      } catch (e) {
        console.error(`  ⚠️  Erreur Google Maps (${category}):`, e);
        break;
      }

      if (result.businesses.length === 0) break;

      for (const biz of result.businesses) {
        if (emailsSent >= maxEmails) break outer;
        if (seenPlaceIds.has(biz.placeId)) continue;
        seenPlaceIds.add(biz.placeId);

        const name = biz.name;
        const city = biz.city;

        // Skip if already contacted (using placeId as unique key)
        if (contactedSirens.has(biz.placeId)) continue;

        process.stdout.write(`  → ${name.slice(0, 40).padEnd(40)} `);

        // Check website via Place Details
        const details = await getPlaceDetails(biz.placeId);
        if (details.hasWebsite) {
          console.log("🌐 a déjà un site");
          skippedSite++;
          contactedSirens.add(biz.placeId);
          continue;
        }

        // Find email
        const email = await findEmailForCompany(name, city);
        const mobileNumber = mobileE164(details.phone);

        if (!email && !mobileNumber) {
          console.log("📭 aucun contact");
          skippedEmail++;
          continue;
        }

        try {
          const smsText =
            `Bonjour, je m'appelle Alexandre, j'ai 16 ans et je suis passionne de developpement web. ` +
            `Je propose de creer un site professionnel pour ${name} a 150EUR. ` +
            `Garantie : remboursement si non satisfait + 1 mois de modifications gratuites. ` +
            `Decouvrez mes realisations sur : ${siteUrl}`;

          if (email) {
            await resend.emails.send({
              from: "Alexandre <contact@alexwebdesign.pro>",
              to: email,
              subject: `Création de site web pour ${name}`,
              html: buildProspectEmail(name, siteUrl),
            });
          }

          let smsSentForThis = false;
          if (mobileNumber) {
            smsSentForThis = await sendBrevoSms(mobileNumber, smsText);
            if (smsSentForThis) smsSent++;
          }

          // Save with placeId as "siren" (unique identifier)
          await supabase.from("prospected_companies").insert({
            siren: biz.placeId,
            company_name: name,
            email: email || "",
            city,
          });
          contactedSirens.add(biz.placeId);
          if (email) emailsSent++;

          const tag = [email ? `✉️  ${email}` : "", smsSentForThis ? "📱 SMS" : ""].filter(Boolean).join(" + ");
          console.log(tag);

          await sleep(400);
        } catch (e) {
          console.log(`❌ erreur: ${e}`);
          errors++;
        }
      }

      pageToken = result.nextPageToken;
      pageCount++;
      // Google Places max 3 pages (60 results) per query, wait 2s between pages
      if (pageToken) await sleep(2000);
    } while (pageToken && pageCount < 3);
  }

  console.log("\n" + "=".repeat(55));
  console.log(`✅ Terminé !`);
  console.log(`   Emails envoyés : ${emailsSent}`);
  console.log(`   SMS envoyés    : ${smsSent}`);
  console.log(`   Sans site      : ${skippedSite}`);
  console.log(`   Sans email     : ${skippedEmail}`);
  if (errors > 0) console.log(`   Erreurs        : ${errors}`);
}

function buildProspectEmail(companyName: string, siteUrl: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 40px auto; color: #1f2937; line-height: 1.7; }
  .signature { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  a { color: #7c3aed; }
  ul { padding-left: 20px; }
  li { margin-bottom: 4px; }
</style>
</head>
<body>
  <p>Bonjour,</p>
  <p>Je me présente : je m'appelle <strong>Alexandre</strong>, j'ai 16 ans et je suis passionné d'informatique, notamment de développement web.</p>
  <p>En me renseignant sur votre entreprise <strong>${companyName}</strong>, j'ai remarqué que vous ne disposez pas encore de site internet. Aujourd'hui, avoir une présence en ligne peut vraiment aider une entreprise à gagner en visibilité et à attirer de nouveaux clients.</p>
  <p>Je vous propose donc mes services pour créer un site web moderne, professionnel et adapté à votre activité.</p>
  <p>Pour <strong>150€</strong>, je réalise un site web de qualité avec un excellent rapport qualité-prix, conçu pour présenter votre entreprise de manière claire et professionnelle.</p>
  <p>De plus, pour vous garantir une totale satisfaction :</p>
  <ul>
    <li>si le site ne vous plaît pas, vous pouvez être entièrement remboursé ;</li>
    <li>pendant 1 mois après la livraison, je peux effectuer toutes les modifications nécessaires afin que le site corresponde parfaitement à vos attentes.</li>
  </ul>
  <p>Si cela vous intéresse, ou simplement si vous souhaitez voir ce que je suis capable de réaliser, je vous invite à consulter mon site web :<br>
  <a href="${siteUrl}">${siteUrl}</a></p>
  <p>Je serais ravi d'échanger avec vous si vous avez des questions.</p>
  <p>Cordialement,</p>
  <div class="signature"><strong>Alexandre</strong></div>
</body>
</html>`;
}

main().catch((err) => {
  console.error("\n❌ Erreur fatale:", err);
  process.exit(1);
});
