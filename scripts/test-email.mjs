import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

const { Resend } = await import("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const res = await resend.emails.send({
  from: "Alexandre <contact@alexwebdesign.pro>",
  to: "alexandre.ammi38@gmail.com",
  subject: "Un site web professionnel pour Test SARL ?",
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 40px auto; color: #1f2937; line-height: 1.7; }
    .signature { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    a { color: #7c3aed; }
  </style>
</head>
<body>
  <p>Bonjour,</p>

  <p>Je me permets de vous contacter car j'ai remarqué que <strong>Test SARL</strong> n'a pas encore de site web, et je pense que vous méritez une belle vitrine en ligne.</p>

  <p>Je m'appelle <strong>Alexandre</strong>, j'ai 16 ans et je suis passionné d'informatique depuis tout petit. Pour gagner en expérience, je propose de créer votre site web professionnel pour seulement <strong>149€</strong> — un tarif que vous ne trouverez nulle part ailleurs pour la qualité proposée.</p>

  <p>Ce que vous obtenez :</p>
  <ul>
    <li>✓ Un site web professionnel sur mesure</li>
    <li>✓ Design moderne et responsive (mobile + tablette)</li>
    <li>✓ Formulaire de contact, galerie photos, infos entreprise</li>
    <li>✓ Livraison en 48 heures</li>
    <li>✓ Satisfait ou remboursé</li>
  </ul>

  <p>Vous pouvez voir des exemples de mes réalisations sur mon site : <a href="${process.env.NEXT_PUBLIC_SITE_URL}">${process.env.NEXT_PUBLIC_SITE_URL}</a></p>

  <p>Si cela vous intéresse, répondez simplement à cet email ou commandez directement en ligne. Je serai ravi de vous accompagner !</p>

  <p>Cordialement,</p>

  <div class="signature">
    <strong>Alexandre</strong><br>
    Développeur Web · 16 ans · Passionné d'informatique<br>
    contact@alexwebdesign.pro<br>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}">${process.env.NEXT_PUBLIC_SITE_URL}</a>
  </div>
</body>
</html>`,
});

if (res.error) {
  console.error("❌ Erreur:", res.error);
} else {
  console.log("✅ Email envoyé ! ID:", res.data?.id);
}
