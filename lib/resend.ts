import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function sendDeliveryEmail({
  to,
  clientName,
  businessName,
  siteHtml,
  orderId,
}: {
  to: string;
  clientName: string;
  businessName: string;
  siteHtml: string;
  orderId: string;
}) {
  const siteUrl = `https://website-three-zeta-38.vercel.app/sites/${orderId}`;

  return resend.emails.send({
    from: "Alexandre <contact@alexwebdesign.pro>",
    to,
    subject: `🎉 Votre site web "${businessName}" est prêt !`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, sans-serif; background: #050508; color: #f0f0ff; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .logo { font-size: 24px; font-weight: 900; margin-bottom: 32px; }
    .logo span { background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 900; margin: 0 0 12px; }
    p { color: #9ca3af; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; padding: 14px 28px; border-radius: 50px; font-weight: 700; text-decoration: none; margin: 8px 0; }
    .footer { color: #374151; font-size: 12px; margin-top: 32px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Alexandre<span>Dev</span></div>

    <div class="card">
      <h1>🎉 Votre site est prêt, ${clientName} !</h1>
      <p>Votre site web pour <strong style="color: white">${businessName}</strong> a été créé avec succès.</p>
      <p>Cliquez sur le bouton ci-dessous pour voir votre site en ligne :</p>
      <a href="${siteUrl}" class="btn">Voir mon site →</a>
    </div>

    <div class="card">
      <p style="color: white; font-weight: 600; margin-bottom: 12px;">Ce qui est inclus :</p>
      <p>✓ Code source HTML/CSS/JS complet<br>
         ✓ Design responsive mobile + tablette<br>
         ✓ 1 mois de support inclus<br>
         ✓ Modifications mineures gratuites</p>
      <p>Pour récupérer les fichiers sources ou pour toute modification, répondez simplement à cet email.</p>
    </div>

    <div class="footer">
      <p>Alexandre · alexandre.ammi38@gmail.com</p>
      <p>Commande #${orderId}</p>
    </div>
  </div>
</body>
</html>
    `,
    attachments: [
      {
        filename: `${businessName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-site.html`,
        content: Buffer.from(siteHtml).toString("base64"),
      },
    ],
  });
}

export async function sendImpossibleRevisionEmail({
  to,
  clientName,
  businessName,
  reason,
  orderId,
}: {
  to: string;
  clientName: string;
  businessName: string;
  reason: string;
  orderId: string;
}) {
  return resend.emails.send({
    from: "Alexandre <contact@alexwebdesign.pro>",
    to,
    subject: `Votre demande de modification — ${businessName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, sans-serif; background: #050508; color: #f0f0ff; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .logo { font-size: 24px; font-weight: 900; margin-bottom: 32px; }
    .logo span { background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; margin-bottom: 24px; }
    .card-warn { background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 900; margin: 0 0 12px; }
    p { color: #9ca3af; line-height: 1.6; margin: 0 0 16px; }
    .reason { color: #fbbf24; font-weight: 600; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; padding: 14px 28px; border-radius: 50px; font-weight: 700; text-decoration: none; margin: 8px 0; }
    .footer { color: #374151; font-size: 12px; margin-top: 32px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Alexandre<span>Dev</span></div>

    <div class="card">
      <h1>⚠️ Modification non réalisable</h1>
      <p>Bonjour ${clientName},</p>
      <p>Nous avons bien reçu votre demande de modification pour le site <strong style="color: white">${businessName}</strong>.</p>
      <p>Malheureusement, cette modification n'est pas possible dans le cadre de votre formule actuelle :</p>
    </div>

    <div class="card-warn">
      <p class="reason">❌ ${reason}</p>
    </div>

    <div class="card">
      <p style="color: white; font-weight: 600; margin-bottom: 12px;">Ce que vous pouvez demander gratuitement :</p>
      <p>✓ Modifier des textes, titres, descriptions<br>
         ✓ Changer les couleurs ou les polices<br>
         ✓ Ajouter ou modifier des sections<br>
         ✓ Mettre à jour vos coordonnées ou horaires</p>
      <p>Pour toute autre demande, répondez simplement à cet email et nous trouverons une solution ensemble.</p>
      <a href="mailto:alexandre.ammi38@gmail.com" class="btn">Contacter Alexandre →</a>
    </div>

    <div class="footer">
      <p>Alexandre · alexandre.ammi38@gmail.com</p>
      <p>Commande #${orderId}</p>
    </div>
  </div>
</body>
</html>
    `,
  });
}

export async function sendProspectionEmail({
  to,
  companyName,
  directorName,
}: {
  to: string;
  companyName: string;
  directorName?: string;
}) {
  const greeting = "Bonjour";

  return resend.emails.send({
    from: "Alexandre <contact@alexwebdesign.pro>",
    to,
    subject: `Un site web professionnel pour ${companyName} ?`,
    html: `
<!DOCTYPE html>
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
  <p>${greeting},</p>

  <p>Je me permets de vous contacter car j'ai remarqué que <strong>${companyName}</strong> n'a pas encore de site web, et je pense que vous méritez une belle vitrine en ligne.</p>

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
    alexandre.ammi38@gmail.com<br>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}">${process.env.NEXT_PUBLIC_SITE_URL}</a>
  </div>
</body>
</html>
    `,
  });
}
