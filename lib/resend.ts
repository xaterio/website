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
}: {
  to: string;
  companyName: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.alexwebdesign.pro";

  const { data, error } = await resend.emails.send({
    from: "Alexandre <contact@alexwebdesign.pro>",
    to,
    subject: `Création de site web pour ${companyName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
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

  <div class="signature">
    <strong>Alexandre</strong>
  </div>
</body>
</html>
    `,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
  return data;
}
