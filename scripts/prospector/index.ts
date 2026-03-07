#!/usr/bin/env ts-node
/**
 * Agent de prospection IA — AlexandreDev
 * Usage:
 *   npx ts-node scripts/prospector/index.ts
 *   npx ts-node scripts/prospector/index.ts --test
 *   npx ts-node scripts/prospector/index.ts --departement=38 --max=50
 */

import * as fs from "fs";
import * as path from "path";
import { searchCompanies, TARGET_NAF_CODES, PappersEntreprise } from "./pappers";
import { hasWebsite, extractEmail } from "./check-website";
import { sendProspectionEmail } from "./emailer";
import { findEmailForCompany } from "./find-email";

// Load .env.local
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

// ---- Config ----
const CONTACTED_FILE = path.join(process.cwd(), "scripts/prospector/contacted.csv");
const MIN_REVENUE = 150_000;
const MAX_REVENUE = 2_000_000;
const DELAY_MS = 500;

// ---- ANSI colors ----
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgBlue: "\x1b[44m",
  bgGreen: "\x1b[42m",
};

// ---- Dashboard ----
interface Stats {
  emailsSent: number;
  maxEmails: number;
  skippedHasSite: number;
  skippedNoEmail: number;
  skippedAlreadyContacted: number;
  errors: number;
  currentCompany: string;
  currentNaf: string;
  startTime: number;
  lastEmails: string[];
}

let dashboardInterval: ReturnType<typeof setInterval> | null = null;
const stats: Stats = {
  emailsSent: 0,
  maxEmails: 20,
  skippedHasSite: 0,
  skippedNoEmail: 0,
  skippedAlreadyContacted: 0,
  errors: 0,
  currentCompany: "Démarrage...",
  currentNaf: "",
  startTime: Date.now(),
  lastEmails: [],
};

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

function renderDashboard() {
  const elapsed = Math.floor((Date.now() - stats.startTime) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${mins}m${secs.toString().padStart(2, "0")}s`;

  const barWidth = 30;
  const filled = Math.round((stats.emailsSent / stats.maxEmails) * barWidth);
  const bar = "█".repeat(filled) + "░".repeat(barWidth - filled);
  const pct = Math.round((stats.emailsSent / stats.maxEmails) * 100);

  clearScreen();
  console.log(`${C.bold}${C.magenta}╔══════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}${C.magenta}║   🤖  Agent Prospection AlexandreDev             ║${C.reset}`);
  console.log(`${C.bold}${C.magenta}╚══════════════════════════════════════════════════╝${C.reset}`);
  console.log();

  // Progress bar
  console.log(`${C.bold}  Progression${C.reset}`);
  console.log(`  ${C.cyan}${bar}${C.reset} ${C.bold}${pct}%${C.reset}`);
  console.log(`  ${C.green}${C.bold}${stats.emailsSent}${C.reset}${C.gray} / ${stats.maxEmails} emails envoyés${C.reset}   ${C.gray}⏱ ${timeStr}${C.reset}`);
  console.log();

  // Stats grid
  console.log(`${C.bold}  Statistiques${C.reset}`);
  console.log(`  ${C.green}✉  Envoyés        ${C.bold}${stats.emailsSent}${C.reset}`);
  console.log(`  ${C.yellow}⏭  Ont un site    ${C.bold}${stats.skippedHasSite}${C.reset}`);
  console.log(`  ${C.gray}📭  Sans email      ${C.bold}${stats.skippedNoEmail}${C.reset}`);
  console.log(`  ${C.blue}📋  Déjà contactés ${C.bold}${stats.skippedAlreadyContacted}${C.reset}`);
  if (stats.errors > 0) {
    console.log(`  ${C.red}❌  Erreurs        ${C.bold}${stats.errors}${C.reset}`);
  }
  console.log();

  // Current activity
  console.log(`${C.bold}  En cours${C.reset}`);
  console.log(`  ${C.gray}NAF : ${C.cyan}${stats.currentNaf || "—"}${C.reset}`);
  console.log(`  ${C.gray}→ ${C.white}${stats.currentCompany}${C.reset}`);
  console.log();

  // Last sent emails
  if (stats.lastEmails.length > 0) {
    console.log(`${C.bold}  Derniers emails envoyés${C.reset}`);
    stats.lastEmails.forEach((e) => {
      console.log(`  ${C.green}✓${C.reset} ${C.gray}${e}${C.reset}`);
    });
    console.log();
  }

  console.log(`${C.dim}  Ctrl+C pour arrêter${C.reset}`);
}

function startDashboard() {
  renderDashboard();
  dashboardInterval = setInterval(renderDashboard, 1000);
}

function stopDashboard() {
  if (dashboardInterval) {
    clearInterval(dashboardInterval);
    dashboardInterval = null;
  }
}

// ---- Utils ----
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadContactedSirens(): Set<string> {
  if (!fs.existsSync(CONTACTED_FILE)) return new Set();
  const content = fs.readFileSync(CONTACTED_FILE, "utf-8");
  const sirens = new Set<string>();
  for (const line of content.split("\n").slice(1)) {
    const siren = line.split(",")[0]?.trim();
    if (siren) sirens.add(siren);
  }
  return sirens;
}

function saveContacted(company: PappersEntreprise, email: string) {
  const isNew = !fs.existsSync(CONTACTED_FILE);
  const line = [
    company.siren,
    `"${company.nom_entreprise}"`,
    email,
    company.siege?.ville || "",
    new Date().toISOString().split("T")[0],
  ].join(",");
  if (isNew) {
    fs.writeFileSync(CONTACTED_FILE, "siren,nom,email,ville,date_contact\n" + line + "\n");
  } else {
    fs.appendFileSync(CONTACTED_FILE, line + "\n");
  }
}

function getDirectorName(company: PappersEntreprise): string | undefined {
  const rep = company.representants?.[0];
  if (!rep) return undefined;
  return rep.prenom ? `${rep.prenom} ${rep.nom || ""}`.trim() : rep.nom;
}

// ---- Main ----
async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes("--test");
  const maxArg = args.find((a) => a.startsWith("--max="));
  const deptArg = args.find((a) => a.startsWith("--departement="));
  const maxEmails = maxArg ? parseInt(maxArg.split("=")[1]) : isTest ? 1 : 20;
  const departement = deptArg ? deptArg.split("=")[1] : undefined;

  stats.maxEmails = maxEmails;
  stats.startTime = Date.now();

  const contacted = loadContactedSirens();
  stats.skippedAlreadyContacted = contacted.size;

  startDashboard();

  let page = 1;

  for (const nafCode of TARGET_NAF_CODES) {
    if (stats.emailsSent >= maxEmails) break;

    stats.currentNaf = nafCode;
    stats.currentCompany = "Recherche en cours...";

    try {
      const response = await searchCompanies({
        minRevenue: MIN_REVENUE,
        maxRevenue: MAX_REVENUE,
        page,
        perPage: 50,
        departement,
        codeNaf: nafCode,
      });

      for (const company of response.resultats || []) {
        if (stats.emailsSent >= maxEmails) break;

        stats.currentCompany = company.nom_entreprise;

        if (contacted.has(company.siren)) {
          stats.skippedAlreadyContacted++;
          continue;
        }

        const hasSite = await hasWebsite(company.nom_entreprise, company.siege?.site_web);
        if (hasSite) {
          stats.skippedHasSite++;
          continue;
        }

        let email = extractEmail(company);
        if (!email) {
          stats.currentCompany = `🔍 ${company.nom_entreprise} — recherche email...`;
          email = await findEmailForCompany(company.nom_entreprise, company.siege?.ville) ?? undefined;
          if (!email) {
            stats.skippedNoEmail++;
            continue;
          }
        }

        const directorName = getDirectorName(company);
        const city = company.siege?.ville;

        try {
          await sendProspectionEmail({
            to: email,
            companyName: company.nom_entreprise,
            directorName,
            city,
          });

          saveContacted(company, email);
          contacted.add(company.siren);
          stats.emailsSent++;

          // Garder les 5 derniers emails envoyés
          const entry = `${company.nom_entreprise} → ${email}`;
          stats.lastEmails = [entry, ...stats.lastEmails].slice(0, 5);

          if (stats.emailsSent < maxEmails) await sleep(DELAY_MS);
        } catch {
          stats.errors++;
        }
      }
    } catch {
      stats.errors++;
    }

    page++;
  }

  stopDashboard();
  clearScreen();

  const elapsed = Math.floor((Date.now() - stats.startTime) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  console.log(`\n${C.bold}${C.green}✅ Prospection terminée !${C.reset}\n`);
  console.log(`  ${C.green}✉  Emails envoyés    : ${C.bold}${stats.emailsSent}${C.reset}`);
  console.log(`  ${C.yellow}⏭  Ont un site       : ${C.bold}${stats.skippedHasSite}${C.reset}`);
  console.log(`  ${C.gray}📭  Sans email         : ${C.bold}${stats.skippedNoEmail}${C.reset}`);
  console.log(`  ${C.gray}⏱  Durée              : ${C.bold}${mins}m${secs}s${C.reset}`);
  console.log(`\n  ${C.gray}Log : ${CONTACTED_FILE}${C.reset}\n`);

  if (stats.lastEmails.length > 0) {
    console.log(`${C.bold}  Emails envoyés :${C.reset}`);
    stats.lastEmails.forEach((e) => console.log(`  ${C.green}✓${C.reset} ${e}`));
    console.log();
  }
}

main().catch((err) => {
  stopDashboard();
  console.error("\n❌ Erreur fatale:", err);
  process.exit(1);
});
