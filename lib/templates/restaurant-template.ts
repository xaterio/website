import { Theme } from "./themes";

export interface RestaurantContent {
  heroTag: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSub: string;
  heroCta1: string;
  heroCta2: string;
  stat1Num: string;
  stat1Label: string;
  stat2Num: string;
  stat2Label: string;
  stat3Num: string;
  stat3Label: string;
  aboutTag: string;
  aboutTitle: string;
  aboutP1: string;
  aboutP2: string;
  aboutCta: string;
  menuTitle: string;
  menuSub: string;
  menuItems: Array<{ category: string; name: string; desc: string; price: string }>;
  testiTitle: string;
  testi1Text: string; testi1Name: string; testi1City: string;
  testi2Text: string; testi2Name: string; testi2City: string;
  testi3Text: string; testi3Name: string; testi3City: string;
  contactTitle: string;
  address: string;
  phone: string;
  email: string;
  hours: Array<{ day: string; time: string }>;
  formPlaceholder: string;
  formCta: string;
  navCta: string;
  metaDesc: string;
  year: string;
}

function parseStat(raw: string): { prefix: string; to: string; suffix: string } {
  const m = raw.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { prefix: "", to: "", suffix: raw };
  return { prefix: m[1], to: m[2], suffix: m[3] };
}

export function buildRestaurantHtml(content: RestaurantContent, theme: Theme, businessName: string): string {
  const isLight = theme.bg === "#ffffff" || theme.bg.startsWith("#f");

  const s1 = parseStat(content.stat1Num);
  const s2 = parseStat(content.stat2Num);
  const s3 = parseStat(content.stat3Num);

  const categories = [...new Set(content.menuItems.map(i => i.category))];

  const menuCatButtons = [
    `<button class="menu-cat-btn active" data-cat="all">Tout</button>`,
    ...categories.map(cat => `<button class="menu-cat-btn" data-cat="${cat}">${cat}</button>`)
  ].join("\n      ");

  const menuItemsHtml = content.menuItems.map(item => `
    <div class="menu-item fade-up" data-cat="${item.category}">
      <div class="menu-item-header">
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-price">${item.price}</div>
      </div>
      <div class="menu-item-desc">${item.desc}</div>
    </div>`).join("");

  const hoursHtml = content.hours.map(h => `
    <div class="hours-row">
      <span class="hours-day">${h.day}</span>
      <span class="hours-time">${h.time}</span>
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${businessName}</title>
<meta name="description" content="${content.metaDesc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${theme.fontUrl}" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${theme.bg};--bg2:${theme.bg2};--text:${theme.text};
  --muted:${theme.muted};--accent:${theme.accent};--accent-text:${theme.accentText};
  --border:${theme.border};--font:'${theme.font}',sans-serif;
  --shadow:${isLight ? "0 24px 64px rgba(0,0,0,.10)" : "0 24px 64px rgba(0,0,0,.55)"};
  --card-glow:color-mix(in srgb,var(--accent) 30%,transparent);
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--font);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 48px;display:flex;align-items:center;justify-content:space-between;transition:all .4s cubic-bezier(.4,0,.2,1)}
nav.scrolled{background:${isLight ? "rgba(255,255,255,.92)" : "rgba(7,7,15,.92)"};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:13px 48px}
.nav-logo{font-size:17px;font-weight:900;color:var(--text);text-decoration:none;letter-spacing:-.4px}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{color:var(--muted);font-size:13.5px;font-weight:500;text-decoration:none;transition:color .2s;position:relative;padding-bottom:2px}
.nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1.5px;background:var(--accent);transition:width .3s cubic-bezier(.4,0,.2,1);border-radius:2px}
.nav-links a:hover,.nav-links a.active{color:var(--text)}
.nav-links a:hover::after,.nav-links a.active::after{width:100%}
.nav-cta{background:var(--accent);color:var(--accent-text);padding:10px 24px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;transition:all .3s;box-shadow:0 4px 16px color-mix(in srgb,var(--accent) 30%,transparent)}
.nav-cta:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 8px 24px var(--card-glow)}
.nav-burger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px;background:none;border:none}
.nav-burger span{display:block;width:22px;height:2px;background:var(--text);transition:.3s;border-radius:2px}

/* HERO */
section.hero{min-height:100vh;padding:0 48px;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;isolation:isolate}
.hero-orb{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;will-change:transform}
.orb1{width:700px;height:700px;background:color-mix(in srgb,var(--accent) 14%,transparent);top:-200px;right:-150px;animation:floatOrb 20s ease-in-out infinite}
.orb2{width:500px;height:500px;background:color-mix(in srgb,var(--accent) 8%,transparent);bottom:-150px;left:-100px;animation:floatOrb 26s ease-in-out infinite reverse}
.orb3{width:280px;height:280px;background:color-mix(in srgb,var(--accent) 10%,transparent);top:35%;left:8%;animation:floatOrb 18s ease-in-out infinite;animation-delay:-6s}
@keyframes floatOrb{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(40px,-30px) scale(1.05)}66%{transform:translate(-20px,25px) scale(.96)}}
.hero-content{max-width:820px;position:relative;z-index:1}
.hero-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:30px;padding:7px 18px;border:1px solid color-mix(in srgb,var(--accent) 30%,transparent);border-radius:50px;background:color-mix(in srgb,var(--accent) 8%,transparent)}
.hero h1{font-size:clamp(52px,8vw,110px);font-weight:900;line-height:1.0;margin-bottom:26px;letter-spacing:-3px;text-wrap:balance}
.hero h1 em{font-style:italic;color:var(--accent)}
.hero-sub{font-size:18px;color:var(--muted);margin-bottom:48px;max-width:520px;line-height:1.8;margin-inline:auto}
.hero-btns{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:72px}
.btn-primary{background:var(--accent);color:var(--accent-text);padding:16px 32px;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .3s;white-space:nowrap;box-shadow:0 4px 20px color-mix(in srgb,var(--accent) 30%,transparent)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 36px var(--card-glow)}
.btn-secondary{border:1.5px solid var(--border);color:var(--text);padding:16px 32px;border-radius:50px;font-weight:600;font-size:15px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .3s;white-space:nowrap;background:color-mix(in srgb,var(--text) 4%,transparent)}
.btn-secondary:hover{border-color:var(--accent);color:var(--accent);background:color-mix(in srgb,var(--accent) 6%,transparent)}
.hero-stats{display:flex;gap:0;padding-top:48px;border-top:1px solid var(--border);justify-content:center}
.hero-stats>div{flex:1;max-width:200px;padding:0 32px;border-right:1px solid var(--border);text-align:center}
.hero-stats>div:last-child{border-right:none}
.stat-num{font-size:44px;font-weight:900;display:block;letter-spacing:-2px;color:var(--text);font-variant-numeric:tabular-nums}
.stat-label{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-top:8px;line-height:1.5}

/* ABOUT */
section.about{padding:120px 48px;background:var(--bg2)}
.about-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1.55fr;gap:88px;align-items:center}
.about-left{position:relative}
.about-eyebrow{display:block;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:18px}
.about-left h2{font-size:clamp(34px,4vw,54px);font-weight:900;line-height:1.05;letter-spacing:-1.5px}
.about-deco{display:block;width:56px;height:3px;background:var(--accent);border-radius:2px;margin-top:30px}
.about-right p{color:var(--muted);font-size:16px;line-height:1.9;margin-bottom:24px}
.about-cta{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--accent-text);padding:14px 30px;border-radius:50px;font-weight:700;font-size:14px;text-decoration:none;transition:all .3s;box-shadow:0 4px 18px color-mix(in srgb,var(--accent) 28%,transparent)}
.about-cta:hover{transform:translateY(-2px);box-shadow:0 10px 32px var(--card-glow)}

/* SECTION SHARED */
.section-inner{max-width:1200px;margin:0 auto}
.section-header{text-align:center;margin-bottom:56px}
.section-eyebrow{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}
.section-header h2{font-size:clamp(34px,4vw,54px);font-weight:900;line-height:1.06;letter-spacing:-1.5px;margin-bottom:14px}
.section-header p{color:var(--muted);font-size:17px;max-width:520px;margin-inline:auto}

/* MENU */
section.menu-section{padding:120px 48px}
.menu-cats{display:flex;gap:10px;justify-content:center;margin-bottom:48px;flex-wrap:wrap}
.menu-cat-btn{padding:9px 22px;border-radius:50px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid var(--border);background:transparent;color:var(--muted);transition:all .25s;font-family:var(--font)}
.menu-cat-btn.active,.menu-cat-btn:hover{border-color:var(--accent);color:var(--accent);background:color-mix(in srgb,var(--accent) 8%,transparent)}
.menu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.menu-item{padding:24px 26px;border:1px solid var(--border);border-radius:16px;background:var(--bg2);transition:all .3s;border-left:3px solid transparent}
.menu-item:hover{border-left-color:var(--accent);background:color-mix(in srgb,var(--accent) 4%,var(--bg2));transform:translateX(4px)}
.menu-item-header{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:8px}
.menu-item-name{font-size:16px;font-weight:700;letter-spacing:-.2px}
.menu-item-price{font-size:19px;font-weight:900;color:var(--accent);flex-shrink:0;letter-spacing:-.5px}
.menu-item-desc{font-size:13px;color:var(--muted);line-height:1.65}

/* TESTIMONIALS */
section.testimonials{padding:120px 48px;background:var(--bg2);overflow:hidden}
.testi-inner{max-width:1200px;margin:0 auto}
.testi-track-wrap{overflow:hidden;margin-top:56px;position:relative}
.testi-track-wrap::before,.testi-track-wrap::after{content:'';position:absolute;top:0;bottom:0;width:120px;z-index:2;pointer-events:none}
.testi-track-wrap::before{left:0;background:linear-gradient(to right,var(--bg2),transparent)}
.testi-track-wrap::after{right:0;background:linear-gradient(to left,var(--bg2),transparent)}
.testi-track{display:flex;gap:24px;transition:transform .65s cubic-bezier(.4,0,.2,1)}
.testi-card{flex:0 0 360px;padding:36px;border-radius:24px;background:var(--bg);border:1px solid var(--border);position:relative;overflow:hidden}
.testi-quote-deco{position:absolute;top:12px;right:18px;font-size:88px;line-height:1;color:var(--accent);opacity:.1;font-weight:900;pointer-events:none;font-family:Georgia,serif;user-select:none}
.stars{color:var(--accent);font-size:14px;margin-bottom:16px;letter-spacing:4px}
.testi-text{font-size:14.5px;line-height:1.8;color:var(--muted);margin-bottom:22px;font-style:italic;position:relative;z-index:1}
.testi-author{font-weight:800;font-size:14px}
.testi-city{font-size:12px;color:var(--muted);margin-top:4px}
.testi-dots{display:flex;justify-content:center;gap:8px;margin-top:32px}
.testi-dot{height:8px;width:8px;border-radius:4px;background:var(--border);cursor:pointer;transition:all .3s cubic-bezier(.4,0,.2,1);border:none}
.testi-dot.active{background:var(--accent);width:24px}

/* CONTACT */
section.contact-section{padding:120px 48px}
.contact-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:72px;align-items:start}
.contact-info-card{background:var(--bg2);border:1px solid var(--border);border-radius:24px;padding:40px}
.contact-info-card h2{font-size:clamp(26px,3vw,40px);font-weight:900;letter-spacing:-1px;margin-bottom:32px;line-height:1.1}
.info-row{display:flex;gap:16px;margin-bottom:22px;align-items:flex-start}
.info-icon{width:44px;height:44px;border-radius:12px;background:color-mix(in srgb,var(--accent) 12%,transparent);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.info-label{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:4px;font-weight:600}
.info-value{font-size:15px;font-weight:600;word-break:break-all}
.hours-list{display:flex;flex-direction:column;gap:8px;margin-top:4px}
.hours-row{display:flex;justify-content:space-between;align-items:center;gap:12px}
.hours-day{font-size:13px;color:var(--muted)}
.hours-time{font-size:13px;font-weight:700}
.form-card{background:var(--bg2);border:1px solid var(--border);border-radius:24px;padding:40px}
form{display:flex;flex-direction:column;gap:14px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
input,textarea,select{width:100%;padding:14px 18px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg);color:var(--text);font-family:var(--font);font-size:14px;transition:border-color .25s,box-shadow .25s;outline:none}
input:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 14%,transparent)}
textarea{resize:vertical;min-height:130px}
.form-submit{background:var(--accent);color:var(--accent-text);padding:16px;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;border:none;font-family:var(--font);transition:all .3s;box-shadow:0 4px 16px color-mix(in srgb,var(--accent) 30%,transparent)}
.form-submit:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 8px 28px var(--card-glow)}
.form-success{display:none;padding:14px;border-radius:12px;background:${isLight ? "#f0fdf4" : "rgba(34,197,94,.1)"};color:${isLight ? "#15803d" : "#4ade80"};font-size:14px;text-align:center;font-weight:600}

/* FOOTER */
footer{padding:64px 48px 40px;border-top:1px solid var(--border)}
.footer-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr;gap:48px;padding-bottom:48px}
.footer-brand .footer-logo{font-size:20px;font-weight:900;margin-bottom:14px;display:block;letter-spacing:-.5px}
.footer-brand p{font-size:13.5px;color:var(--muted);line-height:1.75;max-width:260px}
.footer-col h4{font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:18px}
.footer-col ul{list-style:none;display:flex;flex-direction:column;gap:11px}
.footer-col ul li a{font-size:14px;color:var(--muted);text-decoration:none;transition:color .2s}
.footer-col ul li a:hover{color:var(--text)}
.footer-col ul li span{font-size:13.5px;color:var(--muted)}
.footer-bottom{max-width:1200px;margin:0 auto;padding-top:24px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.footer-copy{font-size:12px;color:var(--muted)}
.footer-top-link{font-size:12px;color:var(--muted);text-decoration:none;transition:color .2s}
.footer-top-link:hover{color:var(--text)}

/* ANIMATIONS */
.fade-up{opacity:0;transform:translateY(30px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)}
.fade-up.visible{opacity:1;transform:none}

/* MOBILE NAV */
.mobile-nav{display:none;position:fixed;inset:0;z-index:99;background:var(--bg);padding:100px 32px 40px;flex-direction:column;gap:0}
.mobile-nav.open{display:flex}
.mobile-nav a{font-size:26px;font-weight:800;color:var(--text);text-decoration:none;border-bottom:1px solid var(--border);padding:18px 0;transition:color .2s}
.mobile-nav a:hover{color:var(--accent)}
.mobile-nav a:last-child{background:var(--accent);color:var(--accent-text);text-align:center;border-radius:16px;border:none;margin-top:24px;padding:18px;font-size:16px}

/* RESPONSIVE */
@media(max-width:900px){
  .about-inner{grid-template-columns:1fr;gap:44px}
  .footer-grid{grid-template-columns:1fr 1fr;gap:36px}
  .contact-inner{grid-template-columns:1fr;gap:28px}
}
@media(max-width:768px){
  nav{padding:16px 20px}
  nav.scrolled{padding:12px 20px}
  .nav-links,.nav-cta{display:none}
  .nav-burger{display:flex}
  section.hero{padding:0 20px}
  .hero h1{letter-spacing:-2px}
  .hero-stats>div{padding:0 16px}
  .stat-num{font-size:32px}
  .testi-card{flex:0 0 290px}
  .testi-track-wrap::before,.testi-track-wrap::after{width:60px}
  section.about,section.menu-section,section.testimonials,section.contact-section{padding:80px 20px}
  .form-row{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr;gap:28px}
  footer{padding:48px 20px 32px}
  .footer-bottom{flex-direction:column;text-align:center}
  .orb1{width:380px;height:380px}
  .orb2{width:280px;height:280px}
  .orb3{display:none}
}
</style>
</head>
<body>

<nav id="navbar">
  <a href="#accueil" class="nav-logo">${businessName}</a>
  <ul class="nav-links">
    <li><a href="#accueil">Accueil</a></li>
    <li><a href="#menu">Menu</a></li>
    <li><a href="#histoire">Notre histoire</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <a href="#contact" class="nav-cta">${content.navCta}</a>
  <button class="nav-burger" onclick="toggleMenu()" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>

<div class="mobile-nav" id="mobileNav">
  <a href="#accueil" onclick="toggleMenu()">Accueil</a>
  <a href="#menu" onclick="toggleMenu()">Menu</a>
  <a href="#histoire" onclick="toggleMenu()">Notre histoire</a>
  <a href="#contact" onclick="toggleMenu()">Contact</a>
  <a href="#contact" onclick="toggleMenu()">${content.navCta}</a>
</div>

<section class="hero" id="accueil">
  <div class="hero-orb orb1"></div>
  <div class="hero-orb orb2"></div>
  <div class="hero-orb orb3"></div>
  <div class="hero-content">
    <div class="hero-eyebrow">${content.heroTag}</div>
    <h1>${content.heroTitle1}<br><em>${content.heroTitle2}</em></h1>
    <p class="hero-sub">${content.heroSub}</p>
    <div class="hero-btns">
      <a href="#menu" class="btn-primary">${content.heroCta1} →</a>
      <a href="#contact" class="btn-secondary">📞 ${content.heroCta2}</a>
    </div>
    <div class="hero-stats">
      <div>
        <span class="stat-num"${s1.to ? ` data-to="${s1.to}" data-prefix="${s1.prefix}" data-suffix="${s1.suffix}"` : ""}>${content.stat1Num}</span>
        <div class="stat-label">${content.stat1Label}</div>
      </div>
      <div>
        <span class="stat-num"${s2.to ? ` data-to="${s2.to}" data-prefix="${s2.prefix}" data-suffix="${s2.suffix}"` : ""}>${content.stat2Num}</span>
        <div class="stat-label">${content.stat2Label}</div>
      </div>
      <div>
        <span class="stat-num"${s3.to ? ` data-to="${s3.to}" data-prefix="${s3.prefix}" data-suffix="${s3.suffix}"` : ""}>${content.stat3Num}</span>
        <div class="stat-label">${content.stat3Label}</div>
      </div>
    </div>
  </div>
</section>

<section class="about" id="histoire">
  <div class="about-inner">
    <div class="about-left fade-up">
      <span class="about-eyebrow">${content.aboutTag}</span>
      <h2>${content.aboutTitle}</h2>
      <span class="about-deco"></span>
    </div>
    <div class="about-right fade-up" style="transition-delay:.12s">
      <p>${content.aboutP1}</p>
      <p>${content.aboutP2}</p>
      <a href="#contact" class="about-cta">${content.aboutCta} →</a>
    </div>
  </div>
</section>

<section class="menu-section" id="menu">
  <div class="section-inner">
    <div class="section-header fade-up">
      <div class="section-eyebrow">Notre carte</div>
      <h2>${content.menuTitle}</h2>
      <p>${content.menuSub}</p>
    </div>
    <div class="menu-cats">
      ${menuCatButtons}
    </div>
    <div class="menu-grid" id="menuGrid">
      ${menuItemsHtml}
    </div>
  </div>
</section>

${content.testi1Text ? `
<section class="testimonials" id="avis">
  <div class="testi-inner">
    <div class="section-header fade-up">
      <div class="section-eyebrow">Avis clients</div>
      <h2>${content.testiTitle}</h2>
    </div>
    <div class="testi-track-wrap">
      <div class="testi-track" id="testiTrack">
        <div class="testi-card"><div class="testi-quote-deco">"</div><div class="stars">★★★★★</div><p class="testi-text">"${content.testi1Text}"</p><div class="testi-author">${content.testi1Name}</div><div class="testi-city">${content.testi1City}</div></div>
        ${content.testi2Text ? `<div class="testi-card"><div class="testi-quote-deco">"</div><div class="stars">★★★★★</div><p class="testi-text">"${content.testi2Text}"</p><div class="testi-author">${content.testi2Name}</div><div class="testi-city">${content.testi2City}</div></div>` : ""}
        ${content.testi3Text ? `<div class="testi-card"><div class="testi-quote-deco">"</div><div class="stars">★★★★★</div><p class="testi-text">"${content.testi3Text}"</p><div class="testi-author">${content.testi3Name}</div><div class="testi-city">${content.testi3City}</div></div>` : ""}
      </div>
    </div>
    <div class="testi-dots" id="testiDots"></div>
  </div>
</section>` : ""}

<section class="contact-section" id="contact">
  <div class="contact-inner">
    <div class="contact-info-card fade-up">
      <h2>${content.contactTitle}</h2>
      <div class="info-row"><div class="info-icon">📍</div><div><div class="info-label">Adresse</div><div class="info-value">${content.address}</div></div></div>
      <div class="info-row"><div class="info-icon">📞</div><div><div class="info-label">Téléphone</div><div class="info-value">${content.phone}</div></div></div>
      <div class="info-row"><div class="info-icon">✉️</div><div><div class="info-label">Email</div><div class="info-value">${content.email}</div></div></div>
      <div class="info-row"><div class="info-icon">🕐</div><div><div class="info-label">Horaires</div><div class="hours-list">${hoursHtml}</div></div></div>
    </div>
    <div class="form-card fade-up" style="transition-delay:.12s">
      <form id="contactForm">
        <div class="form-row">
          <input type="text" placeholder="Prénom" required>
          <input type="text" placeholder="Nom">
        </div>
        <input type="email" placeholder="Email" required>
        <input type="tel" placeholder="Téléphone">
        <textarea placeholder="${content.formPlaceholder}"></textarea>
        <button type="submit" class="form-submit">${content.formCta}</button>
        <div class="form-success" id="formSuccess">✓ Message envoyé ! Nous vous répondrons rapidement.</div>
      </form>
    </div>
  </div>
</section>

<footer>
  <div class="footer-grid">
    <div class="footer-brand">
      <span class="footer-logo">${businessName}</span>
      <p>${content.heroSub}</p>
    </div>
    <div class="footer-col">
      <h4>Navigation</h4>
      <ul>
        <li><a href="#accueil">Accueil</a></li>
        <li><a href="#menu">Menu</a></li>
        <li><a href="#histoire">Notre histoire</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Contact</h4>
      <ul>
        <li><span>${content.phone}</span></li>
        <li><span>${content.email}</span></li>
        <li><span>${content.address}</span></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">© ${content.year} ${businessName} · Tous droits réservés</span>
    <a href="#accueil" class="footer-top-link">↑ Haut de page</a>
  </div>
</footer>

<script>
// Navbar scroll + active links
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  navbar.classList.toggle('scrolled', scrollY > 60);
  let current = '';
  sections.forEach(s => { if (scrollY >= s.offsetTop - 130) current = s.id; });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}, { passive: true });

// Mobile menu
function toggleMenu() {
  document.getElementById('mobileNav').classList.toggle('open');
}
document.querySelectorAll('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('mobileNav').classList.remove('open'));
});

// Fade-up animations
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); } });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));

// Animated stat counters
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    counterObs.unobserve(el);
    const to = parseFloat(el.dataset.to);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const isFloat = el.dataset.to.includes('.');
    const duration = 1800;
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (isFloat ? (ease * to).toFixed(1) : Math.round(ease * to)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num[data-to]').forEach(el => counterObs.observe(el));

// Menu category filter
document.querySelectorAll('.menu-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.menu-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    document.querySelectorAll('.menu-item').forEach(item => {
      item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
    });
  });
});

// Testimonials carousel
(function(){
  const track = document.getElementById('testiTrack');
  const dotsEl = document.getElementById('testiDots');
  if (!track) return;
  const cards = track.querySelectorAll('.testi-card');
  if (cards.length <= 1) return;
  let current = 0;
  const dots = Array.from(cards, (_, i) => {
    const d = document.createElement('button');
    d.className = 'testi-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Avis ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
    return d;
  });
  function goTo(n) {
    current = n;
    track.style.transform = 'translateX(-' + (n * (cards[0].offsetWidth + 24)) + 'px)';
    dots.forEach((d, i) => d.classList.toggle('active', i === n));
  }
  setInterval(() => goTo((current + 1) % cards.length), 4500);
})();

// Contact form
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  btn.textContent = 'Envoi en cours...';
  btn.disabled = true;
  setTimeout(() => { btn.style.display = 'none'; document.getElementById('formSuccess').style.display = 'block'; }, 1200);
});
</script>
</body>
</html>`;
}
