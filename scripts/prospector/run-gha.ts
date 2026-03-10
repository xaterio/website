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
        if (!email) {
          console.log("📭 email introuvable");
          skippedEmail++;
          continue;
        }

        try {
          await resend.emails.send({
            from: "Alexandre <contact@alexwebdesign.pro>",
            to: email,
            subject: "Un site web professionnel pour votre entreprise — 149€",
            html: buildProspectEmail(name, undefined, siteUrl),
          });

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

          // Save with placeId as "siren" (unique identifier)
          await supabase.from("prospected_companies").insert({
            siren: biz.placeId,
            company_name: name,
            email,
            city,
          });
          contactedSirens.add(biz.placeId);
          emailsSent++;

          const smsTag = smsSentForThis ? " + 📱 SMS" : "";
          console.log(`✉️  ${email}${smsTag}`);

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

function buildProspectEmail(companyName: string, directorName: string | undefined, siteUrl: string) {
  const greeting = directorName ? `Bonjour ${directorName},` : `Bonjour,`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body { font-family: -apple-system, Arial, sans-serif; background: #f8f8f8; margin: 0; padding: 40px 20px; }
  .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
  h2 { color: #1a1a2e; margin-top: 0; }
  p { color: #444; line-height: 1.7; }
  .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white !important; padding: 14px 28px; border-radius: 50px; font-weight: 700; text-decoration: none; margin: 12px 0; }
  .price { font-size: 32px; font-weight: 900; color: #7c3aed; }
  .footer { color: #aaa; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px; }
</style>
</head>
<body>
<div class="container">
  <h2>Un site web professionnel pour ${companyName}</h2>
  <p>${greeting}</p>
  <p>Je suis Alexandre, développeur web (16 ans). Je crée des sites web modernes et professionnels pour les PME comme <strong>${companyName}</strong>.</p>
  <p>Votre site sera :</p>
  <p>✓ Design moderne et adapté mobile<br>
     ✓ Optimisé pour Google (SEO)<br>
     ✓ Livré en 48h<br>
     ✓ Modifications gratuites pendant 1 mois</p>
  <p>Tout ça pour seulement <span class="price">149€</span></p>
  <a href="${siteUrl}" class="btn">Voir mes réalisations →</a>
  <p>Des questions ? Répondez simplement à cet email.</p>
  <p>Bonne journée,<br><strong>Alexandre</strong></p>
  <div class="footer">
    Pour ne plus recevoir d'emails de ma part, répondez avec "stop" en objet.
  </div>
</div>
</body>
</html>`;
}

main().catch((err) => {
  console.error("\n❌ Erreur fatale:", err);
  process.exit(1);
});
