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

export function buildRestaurantHtml(content: RestaurantContent, theme: Theme, businessName: string): string {
  const categories = [...new Set(content.menuItems.map(i => i.category))];

  const menuCatButtons = [
    `<button class="menu-cat-btn active" data-cat="all">Tout</button>`,
    ...categories.map(cat => `<button class="menu-cat-btn" data-cat="${cat}">${cat}</button>`)
  ].join("\n      ");

  const menuItemsHtml = content.menuItems.map(item => `
      <div class="menu-item" data-cat="${item.category}">
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-desc">${item.desc}</div>
        <div class="menu-item-price">${item.price}</div>
      </div>`).join("");

  const hoursHtml = content.hours.map(h => `
          <div class="hours-day">${h.day}</div><div class="hours-time">${h.time}</div>`).join("");

  const isLight = theme.bg === "#ffffff" || theme.bg.startsWith("#f");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${businessName}</title>
<meta name="description" content="${content.metaDesc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="${theme.fontUrl}" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${theme.bg};--bg2:${theme.bg2};--text:${theme.text};
  --muted:${theme.muted};--accent:${theme.accent};--accent-text:${theme.accentText};
  --border:${theme.border};--font:'${theme.font}',sans-serif;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--font);line-height:1.6;-webkit-font-smoothing:antialiased}
/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:22px 48px;display:flex;align-items:center;justify-content:space-between;transition:all .3s}
nav.scrolled{background:var(--bg);border-bottom:1px solid var(--border);padding:14px 48px;${isLight ? "box-shadow:0 1px 20px rgba(0,0,0,.06)" : ""}}
.nav-logo{font-size:19px;font-weight:900;color:var(--text);text-decoration:none}
.nav-links{display:flex;gap:36px;list-style:none}
.nav-links a{color:var(--muted);font-size:14px;font-weight:500;text-decoration:none;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--accent);color:var(--accent-text);padding:11px 26px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;transition:opacity .2s,transform .2s}
.nav-cta:hover{opacity:.85;transform:translateY(-1px)}
.nav-burger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px;background:none;border:none}
.nav-burger span{display:block;width:22px;height:2px;background:var(--text);transition:.3s;border-radius:2px}
/* HERO */
section.hero{min-height:100vh;padding:0 48px;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden}
section.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 40%,color-mix(in srgb,var(--accent) 12%,transparent),transparent 70%);pointer-events:none}
.hero-content{max-width:860px;position:relative;z-index:1}
.hero-tag{display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);margin-bottom:28px}
.hero-tag::before,.hero-tag::after{content:'';display:block;width:28px;height:1.5px;background:var(--accent)}
.hero h1{font-size:clamp(56px,8vw,110px);font-weight:900;line-height:1.0;margin-bottom:28px;letter-spacing:-3px}
.hero h1 em{font-style:italic;color:var(--accent)}
.hero-sub{font-size:19px;color:var(--muted);margin-bottom:48px;max-width:560px;line-height:1.75;margin-inline:auto}
.hero-btns{display:flex;gap:16px;flex-wrap:wrap;justify-content:center}
.btn-primary{background:var(--accent);color:var(--accent-text);padding:17px 34px;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:transform .2s,opacity .2s;white-space:nowrap}
.btn-primary:hover{transform:translateY(-2px);opacity:.9}
.btn-secondary{border:1.5px solid var(--border);color:var(--text);padding:17px 34px;border-radius:50px;font-weight:600;font-size:15px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .2s;white-space:nowrap}
.btn-secondary:hover{border-color:var(--accent);color:var(--accent)}
.hero-stats{display:flex;gap:0;margin-top:64px;padding-top:44px;border-top:1px solid var(--border);justify-content:center}
.hero-stats>div{flex:1;max-width:180px;padding:0 24px;border-right:1px solid var(--border)}
.hero-stats>div:last-child{border-right:none}
.stat-num{font-size:38px;font-weight:900;display:block;letter-spacing:-1.5px}
.stat-label{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-top:4px}
/* ABOUT */
section.about{padding:110px 48px;background:var(--bg2)}
.about-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1.4fr;gap:80px;align-items:start}
.about-left .section-tag{margin-bottom:18px}
.about-left h2{font-size:clamp(36px,4vw,52px);font-weight:900;line-height:1.08;letter-spacing:-1.5px}
.section-tag{font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);margin-bottom:18px}
.about-text h2,.section-header h2{font-size:clamp(36px,4vw,54px);font-weight:900;line-height:1.08;margin-bottom:26px;letter-spacing:-1.5px}
.about-right p{color:var(--muted);font-size:16px;line-height:1.85;margin-bottom:22px}
.about-right p:last-of-type{margin-bottom:28px}
/* MENU */
section.menu-section{padding:110px 48px}
.menu-inner{max-width:1280px;margin:0 auto}
.section-header{text-align:center;margin-bottom:52px}
.section-header p{color:var(--muted);font-size:17px;margin-top:10px}
.menu-cats{display:flex;gap:10px;justify-content:center;margin-bottom:44px;flex-wrap:wrap}
.menu-cat-btn{padding:9px 22px;border-radius:50px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid var(--border);background:transparent;color:var(--muted);transition:all .2s;font-family:var(--font)}
.menu-cat-btn.active,.menu-cat-btn:hover{border-color:var(--accent);color:var(--accent);background:color-mix(in srgb,var(--accent) 8%,transparent)}
.menu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:20px}
.menu-item{padding:26px;border:1px solid var(--border);border-radius:18px;background:var(--bg2);transition:transform .25s,box-shadow .25s}
.menu-item:hover{transform:translateY(-5px);box-shadow:0 16px 48px ${isLight ? "rgba(0,0,0,.08)" : "rgba(0,0,0,.4)"}}
.menu-item-name{font-size:17px;font-weight:700;margin-bottom:8px}
.menu-item-desc{font-size:13px;color:var(--muted);margin-bottom:18px;line-height:1.6}
.menu-item-price{font-size:22px;font-weight:900;color:var(--accent)}
/* TESTIMONIALS */
section.testimonials{padding:110px 48px;background:var(--bg2);overflow:hidden}
.testi-inner{max-width:1280px;margin:0 auto}
.testi-track-wrap{overflow:hidden;margin-top:52px;position:relative}
.testi-track-wrap::before,.testi-track-wrap::after{content:'';position:absolute;top:0;bottom:0;width:80px;z-index:2;pointer-events:none}
.testi-track-wrap::before{left:0;background:linear-gradient(to right,var(--bg2),transparent)}
.testi-track-wrap::after{right:0;background:linear-gradient(to left,var(--bg2),transparent)}
.testi-track{display:flex;gap:24px;transition:transform .6s cubic-bezier(.4,0,.2,1)}
.testi-card{flex:0 0 340px;padding:34px;border-radius:22px;background:var(--bg);border:1px solid var(--border)}
.stars{color:var(--accent);font-size:15px;margin-bottom:18px;letter-spacing:3px}
.testi-text{font-size:15px;line-height:1.75;color:var(--muted);margin-bottom:22px;font-style:italic}
.testi-author{font-weight:800;font-size:14px}
.testi-city{font-size:12px;color:var(--muted);margin-top:3px}
.testi-dots{display:flex;justify-content:center;gap:8px;margin-top:28px}
.testi-dot{width:8px;height:8px;border-radius:50%;background:var(--border);cursor:pointer;transition:background .3s,transform .3s;border:none}
.testi-dot.active{background:var(--accent);transform:scale(1.3)}
/* CONTACT */
section.contact-section{padding:110px 48px}
.contact-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start}
.contact-info h2{font-size:clamp(32px,3.5vw,48px);font-weight:900;letter-spacing:-1px;margin-bottom:40px}
.info-row{display:flex;gap:18px;margin-bottom:26px;align-items:flex-start}
.info-icon{width:46px;height:46px;border-radius:13px;background:var(--bg2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0}
.info-label{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:5px;font-weight:600}
.info-value{font-size:15px;font-weight:600}
.hours-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}
.hours-day{font-size:13px;color:var(--muted)}
.hours-time{font-size:13px;font-weight:600;text-align:right}
form{display:flex;flex-direction:column;gap:14px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
input,textarea,select{width:100%;padding:14px 18px;border-radius:13px;border:1.5px solid var(--border);background:var(--bg2);color:var(--text);font-family:var(--font);font-size:14px;transition:border-color .2s;outline:none}
input:focus,textarea:focus{border-color:var(--accent)}
textarea{resize:vertical;min-height:130px}
.form-submit{background:var(--accent);color:var(--accent-text);padding:16px;border-radius:13px;font-weight:700;font-size:15px;cursor:pointer;border:none;font-family:var(--font);transition:opacity .2s,transform .2s}
.form-submit:hover{opacity:.88;transform:translateY(-1px)}
.form-success{display:none;padding:14px;border-radius:13px;background:${isLight ? "#f0fdf4" : "rgba(34,197,94,.1)"};color:${isLight ? "#15803d" : "#4ade80"};font-size:14px;text-align:center;font-weight:600}
/* FOOTER */
footer{padding:48px;border-top:1px solid var(--border)}
.footer-inner{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
.footer-logo{font-size:18px;font-weight:900}
.footer-copy{font-size:13px;color:var(--muted)}
.footer-links{display:flex;gap:24px}
.footer-links a{font-size:13px;color:var(--muted);text-decoration:none;transition:color .2s}
.footer-links a:hover{color:var(--text)}
/* ANIMATIONS */
.fade-up{opacity:0;transform:translateY(28px);transition:opacity .65s ease,transform .65s ease}
.fade-up.visible{opacity:1;transform:none}
/* MOBILE NAV */
.mobile-nav{display:none;position:fixed;inset:0;z-index:99;background:var(--bg);padding:90px 32px 40px;flex-direction:column;gap:0}
.mobile-nav.open{display:flex}
.mobile-nav a{font-size:28px;font-weight:800;color:var(--text);text-decoration:none;border-bottom:1px solid var(--border);padding:20px 0}
.mobile-nav a:last-child{background:var(--accent);color:var(--accent-text);text-align:center;border-radius:16px;border:none;margin-top:24px;padding:18px}
/* RESPONSIVE */
@media(max-width:768px){
  nav{padding:16px 20px}
  nav.scrolled{padding:12px 20px}
  .nav-links,.nav-cta{display:none}
  .nav-burger{display:flex}
  section.hero{padding:0 20px}
  .hero-stats{gap:0}
  .hero-stats>div{padding:0 14px}
  .stat-num{font-size:28px}
  .about-inner{grid-template-columns:1fr;gap:36px}
  .testi-card{flex:0 0 280px}
  .contact-inner{grid-template-columns:1fr;gap:48px}
  section.about,section.menu-section,section.testimonials,section.contact-section{padding:70px 20px}
  .form-row{grid-template-columns:1fr}
  footer{padding:32px 20px}
  .footer-inner{flex-direction:column;text-align:center}
}
</style>
</head>
<body>

<nav id="navbar">
  <a href="#accueil" class="nav-logo" aria-label="Accueil"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></a>
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
  <div class="hero-content">
    <div class="hero-tag">${content.heroTag}</div>
    <h1>${content.heroTitle1}<br><em>${content.heroTitle2}</em></h1>
    <p class="hero-sub">${content.heroSub}</p>
    <div class="hero-btns">
      <a href="#menu" class="btn-primary">${content.heroCta1} →</a>
      <a href="#contact" class="btn-secondary">📞 ${content.heroCta2}</a>
    </div>
    <div class="hero-stats">
      <div><span class="stat-num">${content.stat1Num}</span><div class="stat-label">${content.stat1Label}</div></div>
      <div><span class="stat-num">${content.stat2Num}</span><div class="stat-label">${content.stat2Label}</div></div>
      <div><span class="stat-num">${content.stat3Num}</span><div class="stat-label">${content.stat3Label}</div></div>
    </div>
  </div>
</section>

<section class="about" id="histoire">
  <div class="about-inner">
    <div class="about-left fade-up">
      <div class="section-tag">${content.aboutTag}</div>
      <h2>${content.aboutTitle}</h2>
    </div>
    <div class="about-right fade-up" style="transition-delay:.1s">
      <p>${content.aboutP1}</p>
      <p>${content.aboutP2}</p>
      <a href="#contact" class="btn-primary" style="display:inline-flex">${content.aboutCta} →</a>
    </div>
  </div>
</section>

<section class="menu-section" id="menu">
  <div class="menu-inner">
    <div class="section-header fade-up">
      <div class="section-tag" style="text-align:center">Notre carte</div>
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
<section class="testimonials">
  <div class="testi-inner">
    <div class="section-header fade-up">
      <div class="section-tag" style="text-align:center">Avis clients</div>
      <h2>${content.testiTitle}</h2>
    </div>
    <div class="testi-track-wrap">
      <div class="testi-track" id="testiTrack">
        <div class="testi-card"><div class="stars">★★★★★</div><p class="testi-text">"${content.testi1Text}"</p><div class="testi-author">${content.testi1Name}</div><div class="testi-city">${content.testi1City}</div></div>
        ${content.testi2Text ? `<div class="testi-card"><div class="stars">★★★★★</div><p class="testi-text">"${content.testi2Text}"</p><div class="testi-author">${content.testi2Name}</div><div class="testi-city">${content.testi2City}</div></div>` : ""}
        ${content.testi3Text ? `<div class="testi-card"><div class="stars">★★★★★</div><p class="testi-text">"${content.testi3Text}"</p><div class="testi-author">${content.testi3Name}</div><div class="testi-city">${content.testi3City}</div></div>` : ""}
      </div>
    </div>
    <div class="testi-dots" id="testiDots"></div>
  </div>
</section>` : ""}

<section class="contact-section" id="contact">
  <div class="contact-inner">
    <div class="fade-up">
      <div class="section-tag">Contact</div>
      <h2>${content.contactTitle}</h2>
      <div class="info-row"><div class="info-icon">📍</div><div><div class="info-label">Adresse</div><div class="info-value">${content.address}</div></div></div>
      <div class="info-row"><div class="info-icon">📞</div><div><div class="info-label">Téléphone</div><div class="info-value">${content.phone}</div></div></div>
      <div class="info-row"><div class="info-icon">✉️</div><div><div class="info-label">Email</div><div class="info-value">${content.email}</div></div></div>
      <div class="info-row"><div class="info-icon">🕐</div><div><div class="info-label">Horaires</div><div class="hours-grid">${hoursHtml}</div></div></div>
    </div>
    <div class="fade-up" style="transition-delay:.15s">
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
  <div class="footer-inner">
    <div class="footer-logo">${businessName}</div>
    <div class="footer-copy">© ${content.year} ${businessName} · Tous droits réservés</div>
    <div class="footer-links">
      <a href="#accueil">Accueil</a>
      <a href="#menu">Menu</a>
      <a href="#contact">Contact</a>
    </div>
  </div>
</footer>

<script>
// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Mobile menu
function toggleMenu() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// Fade-up animations (skip hero - always visible)
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Menu category filter
document.querySelectorAll('.menu-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.menu-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    document.querySelectorAll('.menu-item').forEach(item => {
      item.style.display = (cat === 'all' || item.dataset.cat === cat) ? 'block' : 'none';
    });
  });
});

// Contact form
// Carrousel avis
(function(){
  const track = document.getElementById('testiTrack');
  const dotsEl = document.getElementById('testiDots');
  if (!track) return;
  const cards = track.querySelectorAll('.testi-card');
  const count = cards.length;
  if (count <= 1) return;
  let current = 0;
  const dots = [];
  for (let i = 0; i < count; i++) {
    const d = document.createElement('button');
    d.className = 'testi-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Avis ' + (i+1));
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
    dots.push(d);
  }
  function goTo(n) {
    current = n;
    const cardW = cards[0].offsetWidth + 24;
    track.style.transform = 'translateX(-' + (cardW * n) + 'px)';
    dots.forEach((d, i) => d.classList.toggle('active', i === n));
  }
  setInterval(() => goTo((current + 1) % count), 4000);
})();

document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  btn.textContent = 'Envoi en cours...';
  btn.disabled = true;
  setTimeout(() => {
    btn.style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
  }, 1200);
});
</script>
</body>
</html>`;
}
