import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const SITE_URL = "https://website-three-zeta-38.vercel.app";

export async function sendProspectionEmail({
  to,
  companyName,
  directorName,
  city,
}: {
  to: string;
  companyName: string;
  directorName?: string;
  city?: string;
}) {
  const greeting = directorName
    ? `Bonjour ${directorName},`
    : `Bonjour,`;

  const cityMention = city ? ` basée à ${city}` : "";

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      color: #1f2937;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    }
    p { margin: 0 0 18px; font-size: 15px; }
    a { color: #7c3aed; }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #f3f4f6;
      color: #9ca3af;
      font-size: 13px;
    }
  </style>
</head>
<body>
<div class="container">
  <p>${greeting}</p>

  <p>Je me permets de vous contacter car j'ai remarqué que votre entreprise ne possède pas encore de site internet.</p>

  <p>Je m'appelle Alexandre, j'ai 16 ans et je suis passionné d'informatique et de développement web. Je crée des sites internet modernes, rapides et adaptés aux téléphones afin d'aider les entreprises à être visibles sur internet et à présenter facilement leurs services à leurs clients.</p>

  <p>Aujourd'hui, une grande partie des clients recherchent des entreprises directement sur Google. Avoir un site web permet de présenter votre activité, vos services, vos coordonnées et de donner une image plus professionnelle à votre entreprise.</p>

  <p>Si vous souhaitez voir un exemple de mon travail, vous pouvez consulter une démonstration ici :<br>
  <a href="${SITE_URL}">${SITE_URL}</a></p>

  <p>Si cela vous intéresse, vous pouvez également commander directement votre site depuis mon site web. Je serais ensuite ravi d'échanger avec vous afin de créer un site adapté à votre entreprise et à vos besoins.</p>

  <p>Je reste bien sûr disponible si vous avez des questions.</p>

  <p>Je vous souhaite une excellente journée.</p>

  <p>Cordialement,<br><strong>Alexandre</strong></p>

  <div class="footer">
    <em>Vous recevez cet email car votre entreprise ne dispose pas de site internet. Pour ne plus recevoir ces messages, répondez simplement "STOP".</em>
  </div>
</div>
</body>
</html>
`;

  return resend.emails.send({
    from: "Alexandre <onboarding@resend.dev>",
    to,
    subject: `Un site web professionnel pour ${companyName} — 149€, livraison 48h`,
    html,
    headers: {
      "List-Unsubscribe": `<mailto:alexandre.ammi38@gmail.com?subject=STOP>`,
    },
  });
}
