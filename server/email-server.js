/* ================================================================
   DELOS 2026 — Serveur d'envoi d'emails (Express + Nodemailer/Gmail)
   Endpoints :
     POST /api/admin/send-email   -> validation ou rejet d'une inscription
     GET  /api/health             -> vérification rapide (smtpReady, from)
   Config via server/.env (jamais commité, voir .env.example) :
     SMTP_USER / SMTP_PASS (mot de passe d'application Gmail à 16 lettres)
     MAIL_FROM / ADMIN_TOKEN / PORT
   ================================================================ */

import express from 'express';
import nodemailer from 'nodemailer';
import fs from 'node:fs';
import dns from 'node:dns';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';

/* ---------- Render (gratuit) : sortie IPv6 bloquée vers Gmail ----------
   Nodemailer 10 résout smtp.gmail.com en IPv4+IPv6 (resolve4+resolve6) puis
   tire une IP AU HASARD → 1 fois sur 2 : ENETUNREACH sur l'IPv6.
   Contournement : on neutralise resolve6 (rend une liste vide) AVANT tout
   usage Nodemailer → sa liste d'adresses ne contient que de l'IPv4.
   + dns en ipv4first pour le reste (lookup de repli). */
try { dns.setDefaultResultOrder('ipv4first'); } catch { /* Node <17 : ignoré */ }
try {
  if (dns.Resolver && dns.Resolver.prototype && !dns.Resolver.prototype.__delosNoIPv6){
    dns.Resolver.prototype.resolve6 = function(_host, cb){
      if (typeof cb === 'function') return cb(null, []);
      return Promise.resolve([]);
    };
    dns.Resolver.prototype.__delosNoIPv6 = true;
  }
  if (typeof dns.resolve6 === 'function' && !dns.__delosNoIPv6){
    const origResolve6 = dns.resolve6.bind(dns);
    dns.resolve6 = ((host, opts, cb) => {
      if (typeof opts === 'function'){ cb = opts; return cb(null, []); }
      if (typeof cb === 'function') return cb(null, []);
      return Promise.resolve([]);
    });
    dns.__delosNoIPv6 = true;
    void origResolve6;
  }
} catch (err){ console.warn('[SMTP] ⚠ patch no-IPv6 impossible :', err?.message); }

/* ---------- Chargeur .env minimal (sans dépendance dotenv) ---------- */
(function loadEnv(){
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const raw = fs.readFileSync(path.join(here, '.env'), 'utf8');
    for (const line of raw.split('\n')){
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch { /* pas de .env : on utilise l'environnement existant */ }
})();

const app = express();
app.use(express.json({ limit: '2mb' }));

/* ---------- CORS ----------
   En local : accès libre (site servi sur localhost).
   En production (Render) : si ALLOWED_ORIGINS est défini (séparé par des
   virgules), seules ces origines peuvent appeler l'API — protège contre
   l'utilisation de votre serveur mail par un tiers.
   Normalisation : les '/' finaux sont ignorés des deux côtés
   ("https://delos-pi.vercel.app/" == "https://delos-pi.vercel.app"). */
const normOrigin = s => (s || '').trim().replace(/\/+$/, '');
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(normOrigin).filter(Boolean);
app.use(cors({
  origin(origin, cb){
    if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(normOrigin(origin))) return cb(null, true);
    return cb(null, false);
  }
}));

const PORT      = process.env.PORT || 3001;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const MAIL_FROM = process.env.MAIL_FROM || `DELOS 2026 <${SMTP_USER}>`;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'delos-admin-2026';

/* ---------- Fournisseur d'envoi : Brevo HTTPS (prioritaire) ou SMTP Gmail ----------
   Render gratuit filtre le SMTP sortant de façon aléatoire (timeout selon
   l'IP Gmail résolue) alors que le HTTPS (443) est toujours ouvert.
   Si BREVO_API_KEY est défini → envoi via API Brevo (aucun port SMTP).
   Sinon → repli SMTP Gmail historique. */
const BREVO_API_KEY = (process.env.BREVO_API_KEY || '').trim();
const BREVO_SENDER_EMAIL = (process.env.BREVO_SENDER_EMAIL || SMTP_USER || '').trim();
const BREVO_SENDER_NAME = (process.env.BREVO_SENDER_NAME || 'DELOS 2026').trim();
let EMAIL_PROVIDER = BREVO_API_KEY ? 'brevo' : 'smtp';

async function brevoCheck(){
  try {
    const res = await fetch('https://api.brevo.com/v3/account', {
      headers: { 'api-key': BREVO_API_KEY },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Brevo HTTP ${res.status}`);
    const data = await res.json().catch(() => ({}));
    console.log('[BREVO] ✅ Clé valide (compte :', data.email || data.companyName || 'ok', ')');
    return true;
  } catch (err){ console.error('[BREVO] ❌ Clé invalide/injoignable :', err?.message); return false; }
}

async function brevoSend(to, subject, html){
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(25000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Brevo HTTP ${res.status}`);
  return { messageId: data.messageId || 'brevo-sent', to, subject };
}

/* ---------- Gmail en IPv4 forcée ----------
   Nodemailer 10 résout smtp.gmail.com en IPv4+IPv6 puis tire une IP au
   hasard → 1 fois sur 2 il tombe sur l'IPv6, morte sur Render gratuit
   (ENETUNREACH). On résout nous-mêmes une IPv4 (resolve4) et on se
   connecte à l'IP littérale + SNI smtp.gmail.com : Nodemailer saute alors
   son DNS interne (isIP → pas de tirage IPv6). */
let SMTP_HOST_IP = null;
async function resolveGmailIPv4(){
  try {
    const addrs = await dns.promises.resolve4('smtp.gmail.com');
    if (addrs && addrs.length){
      SMTP_HOST_IP = addrs[0];
      console.log('[SMTP] IPv4 Gmail résolue :', SMTP_HOST_IP);
      return SMTP_HOST_IP;
    }
  } catch (err){ console.warn('[SMTP] ⚠ resolve4 impossible, repli 465 classique :', err?.message); }
  return null;
}

function buildTransporter(port = 465){
  if (!SMTP_USER || !SMTP_PASS) return null;
  const ip = SMTP_HOST_IP;
  const base = {
    host: ip || 'smtp.gmail.com',
    servername: 'smtp.gmail.com',
    port,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { servername: 'smtp.gmail.com' },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 25000,
  };
  // 465 = SSL direct ; 587 = STARTTLS (souvent ouvert quand 465 est filtré)
  return port === 587
    ? nodemailer.createTransport({ ...base, secure: false, requireTLS: true })
    : nodemailer.createTransport({ ...base, secure: true });
}

let transporter = buildTransporter(465);
let SMTP_PORT_USED = 465;

let smtpReady = false;
let smtpLastError = null;
async function checkSmtp(){
  if (BREVO_API_KEY){
    EMAIL_PROVIDER = 'brevo';
    if (!BREVO_SENDER_EMAIL){ smtpReady = false; smtpLastError = 'BREVO_SENDER_EMAIL manquant'; return; }
    const ok = await brevoCheck();
    smtpReady = ok;
    smtpLastError = ok ? null : 'Brevo : clé invalide (voir logs)';
    return;
  }
  EMAIL_PROVIDER = 'smtp';
  if (!SMTP_USER || !SMTP_PASS){ smtpReady = false; return; }
  await resolveGmailIPv4();
  const hostLabel = SMTP_HOST_IP ? `${SMTP_HOST_IP} (IPv4, SNI smtp.gmail.com)` : 'smtp.gmail.com (repli, IPv6 neutralisée)';
  // Essai 465 puis repli 587 : un seul déploiement tranche (filtre port ?)
  for (const port of [465, 587]){
    transporter = buildTransporter(port);
    SMTP_PORT_USED = port;
    console.log(`[SMTP] Transport vers : ${hostLabel} port ${port}${port === 587 ? ' (STARTTLS)' : ' (SSL)'}`);
    try {
      await transporter.verify();
      smtpReady = true; smtpLastError = null;
      console.log(`[SMTP] ✅ Port ${port} OK`);
      return;
    }
    catch (err){
      smtpLastError = err?.message || String(err);
      console.error(`[SMTP] ❌ Port ${port} :`, smtpLastError);
    }
  }
  smtpReady = false;
  console.error('[SMTP] ❌ 465 + 587 injoignables → SMTP bloqué sur cet hébergeur (passe à une API HTTPS type Resend/Brevo).');
}

/* Envoi avec 1 retry : Gmail ferme parfois la première socket
   (« Unexpected socket close ») juste après le démarrage — le 2e
   essai passe. Sans ce retry, l'admin voit un échec alors que tout
   est bien configuré. */
const TRANSIENT_SMTP = /socket close|ECONNRESET|ETIMEDOUT|ENETUNREACH|Greeting never received|Connection timeout|connexion/i;
async function sendWithRetry(mailOptions, retries = 1){
  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    if (retries > 0 && TRANSIENT_SMTP.test(err?.message || '')){
      console.warn('[SMTP] ⚠ Échec transitoire, nouvel essai dans 2s :', err?.message);
      await new Promise(r => setTimeout(r, 2000));
      return await transporter.sendMail(mailOptions);
    }
    throw err;
  }
}

/* ---------- Anti-XSS : tout champ participant est échappé ---------- */
function esc(v){
  return String(v ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}

/* ---------- Données de référence (miroir simplifié delos-data.js) ---------- */
const DAYS = [
  { n:1, date:'Lun. 21 Sept' },
  { n:2, date:'Mar. 22 Sept' },
  { n:3, date:'Mer. 23 Sept' },
  { n:4, date:'Jeu. 24 Sept' },
  { n:5, date:'Ven. 25 Sept' },
  { n:6, date:'Sam. 26 Sept' }
];
const PANELS = [
  { code:'PAN01', day:1, time:'10h20 - 12h00', title:'Le pouvoir des médias dans la transformation des sociétés' },
  { code:'PAN02', day:1, time:'13h30 - 15h30', title:'Cartographier son écosystème d\'influence' },
  { code:'PAN03', day:1, time:'16h00 - 17h00', title:'Démonstration de production audiovisuelle' },
  { code:'PAN04', day:1, time:'18h00 - 19h00', title:'Parcours d\'un créateur' },
  { code:'PAN05', day:1, time:'19h00 - 20h30', title:'Qui façonne l\'imaginaire de notre génération ?' },
  { code:'PAN06', day:2, time:'10h20 - 12h00', title:'De l\'inspiration au scénario : histoires à fort impact' },
  { code:'PAN07', day:2, time:'13h30 - 15h30', title:'Écrire et construire une scène' },
  { code:'PAN08', day:2, time:'16h00 - 18h00', title:'L\'art de la mise en scène & direction d\'acteurs' },
  { code:'PAN09', day:2, time:'18h00 - 19h00', title:'Mon parcours dans le cinéma' },
  { code:'PAN10', day:2, time:'19h00 - 20h30', title:'Le cinéma chrétien peut-il changer l\'imaginaire ?' },
  { code:'PAN11', day:3, time:'10h20 - 12h00', title:'Bâtir une stratégie média et une présence digitale' },
  { code:'PAN12', day:3, time:'13h30 - 15h30', title:'Créer une vidéo de A à Z' },
  { code:'PAN13', day:3, time:'16h00 - 17h00', title:'L\'art de l\'image : signature visuelle' },
  { code:'PAN14', day:3, time:'18h00 - 19h00', title:'Les coulisses de la création de contenu' },
  { code:'PAN15', day:3, time:'19h00 - 20h30', title:'Médias & Réveil : toucher la génération digitale' },
  { code:'PAN16', day:4, time:'10h20 - 12h00', title:'L\'IA au service de la création' },
  { code:'PAN17', day:4, time:'13h30 - 15h30', title:'Générer des visuels, scripts et contenus avec l\'IA' },
  { code:'PAN18', day:4, time:'16h00 - 17h00', title:'AI Live : Production d\'un projet média en direct' },
  { code:'PAN19', day:4, time:'18h00 - 19h00', title:'IA, menace ou opportunité ?' },
  { code:'PAN20', day:4, time:'19h00 - 20h30', title:'L\'IA au service de l\'Évangile et du business' },
  { code:'PAN21', day:5, time:'10h20 - 12h00', title:'Monétiser son talent créatif' },
  { code:'PAN22', day:5, time:'13h30 - 15h30', title:'Construire son offre créative' },
  { code:'PAN23', day:5, time:'16h00 - 17h00', title:'Pitch Lab : Présenter son projet' },
  { code:'PAN24', day:5, time:'18h00 - 19h00', title:'Business Talk : Entreprendre avec sa foi' },
  { code:'PAN25', day:5, time:'19h00 - 20h30', title:'Business chrétien, valeur & influence' },
  { code:'PAN26', day:6, time:'10h00 - 12h30', title:'Masterclass Finale' },
  { code:'PAN27', day:6, time:'13h30 - 15h30', title:'Grande Finale DÉLOS Challenge' },
  { code:'PAN28', day:6, time:'17h30 - 21h00', title:'Grand Panel Final : Quel média pour quel réveil ?' }
];
const fmt = n => (n||0).toLocaleString('fr-FR') + ' FCFA';

function panelOf(code){
  return PANELS.find(p => p.code === code);
}

/* ================================================================
   TEMPLATES EMAIL (charte DELOS : violet profond / or / rouge)
   ================================================================ */
const STYLES = `
  body{margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;background:#0d0618;color:#fff;}
  .wrap{max-width:640px;margin:0 auto;padding:24px;color:#fff;background:linear-gradient(160deg,#1a0f2e,#0d0618);border:1px solid rgba(139,92,246,.3);border-radius:24px;}
  .header{text-align:center;padding:18px 0 24px;border-bottom:1px solid rgba(139,92,246,.25);}
  .brand{font-family:'Cinzel',Georgia,serif;font-size:34px;font-weight:900;letter-spacing:2px;color:#F59E0B;}
  @supports ((-webkit-background-clip:text) or (background-clip:text)){
    .brand{background:linear-gradient(120deg,#7c41b8,#F59E0B,#DC2626);-webkit-background-clip:text;background-clip:text;color:transparent;}
  }
  .sub{font-size:11px;letter-spacing:3px;color:#a78bfa;text-transform:uppercase;margin-bottom:4px;}
  h2{font-family:'Playfair Display',Georgia,serif;font-size:26px;margin:24px 0 8px;color:#F59E0B;}
  p{font-size:14px;line-height:1.7;color:#e5e7eb;}
  .ticket{background:linear-gradient(135deg,rgba(245,158,11,.12),rgba(139,92,246,.18));border:1px dashed rgba(245,158,11,.55);border-radius:16px;padding:14px 16px;margin:10px 0;}
  .ticket .code{font-family:monospace;font-size:18px;font-weight:800;color:#F59E0B;letter-spacing:1px;}
  .ticket .title{font-size:13px;font-weight:700;color:#fff;margin-top:2px;}
  .ticket .meta{font-size:11px;color:#c4b5fd;margin-top:3px;}
  .cta{display:inline-block;background:#F59E0B;color:#111827;font-weight:800;padding:12px 22px;border-radius:99px;text-decoration:none;margin-top:14px;}
  .info{background:rgba(255,255,255,.04);border:1px solid rgba(139,92,246,.25);border-radius:14px;padding:14px 16px;font-size:13px;line-height:1.7;color:#fff;}
  .info div{color:#fff;}
  .info b{color:#F59E0B;}
  .footer{text-align:center;font-size:11px;color:#9ca3af;margin-top:26px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08);}
`;

function layout(content){
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${STYLES}</style></head>
<body><div class="wrap">
  <div class="header">
    <div class="sub">CONFÉRENCE</div>
    <div class="brand">DELOS 2026</div>
    <div style="font-size:11px;color:#fbbf24;letter-spacing:2px;margin-top:4px;">MÉDIA · CINÉMA · IA · RÉVEIL</div>
  </div>
  ${content}
  <div class="footer">
    <div>📍 Centre CEV — Calavi-Tankpè, Bénin</div>
    <div>📅 Du 21 au 26 Septembre 2026</div>
    <div>📱 WhatsApp : +229 01 96 96 29 85 · ✉️ contact@delos2026.org</div>
    <div style="margin-top:8px;opacity:.7">© 2026 DELOS — Tous droits réservés.</div>
  </div>
</div></body></html>`;
}

/* ---------- VALIDATION (Tickets) ---------- */
function ticketCardHTML(t){
  if (t.code.startsWith && t.code.startsWith('DELOS-SP')){
    return `<div class="ticket">
      <div class="code">⭐ ${esc(t.code)}</div>
      <div class="title">PASS PREMIUM — Accès intégral 6 jours</div>
      <div class="meta">21 → 26 Sept 2026 · Centre CEV Calavi-Tankpè</div>
    </div>`;
  }
  const p = panelOf(t.panel);
  const day = p ? DAYS.find(d=>d.n===p.day) : null;
  return `<div class="ticket">
    <div class="code">${esc(t.code)}</div>
    <div class="title">${p ? esc(p.title) : esc(t.panel)}</div>
    <div class="meta">${day?day.date:''} · ${p?esc(p.time):''}</div>
  </div>`;
}

function buildValidationEmail(ins){
  const tickets = ins.tickets || [];
  const ticketsHTML = tickets.map(ticketCardHTML).join('');
  return {
    subject: `✅ Inscription DELOS 2026 confirmée — ${ins.id}`,
    html: layout(`
      <h2>Bienvenue à DELOS 2026 🎬</h2>
      <p>Bonjour <b style="color:#fff">${esc(ins.prenom)} ${esc(ins.nom)}</b>,</p>
      <p>Nous avons le plaisir de vous confirmer la <b>validation de votre paiement</b> pour la Conférence <b>DELOS 2026</b>. Merci pour votre confiance et votre engagement.</p>
      <div class="info">
        <div>👤 <b>Nom :</b> ${esc(ins.prenom)} ${esc(ins.nom)}</div>
        <div>📧 <b>Email :</b> ${esc(ins.email)}</div>
        <div>📱 <b>Téléphone :</b> ${esc(ins.phone)}</div>
        <div>🎫 <b>Formule :</b> ${ins.passType==='premium' ? 'Pass Premium — Accès intégral (6 jours)' : 'Pass à la carte'}</div>
        <div>💰 <b>Montant payé :</b> ${fmt(ins.amount)}</div>
        <div>🔖 <b>Référence :</b> ${esc(ins.ref) || '—'}</div>
      </div>
      <h2 style="margin-top:28px">Vos tickets d'accès</h2>
      <p>Présentez le(s) ticket(s) ci-dessous à l'accueil du <b>Centre CEV</b> pour accéder à l'activité.</p>
      ${ticketsHTML}
      <p style="margin-top:18px"><i>« Devenir les Bâtisseurs de la Culture de Demain »</i></p>
    `)
  };
}

/* ---------- REJET ---------- */
function buildRejectionEmail(ins, reason){
  return {
    subject: `DELOS 2026 — Suite à votre inscription ${ins.id}`,
    html: layout(`
      <h2>À propos de votre inscription</h2>
      <p>Bonjour <b style="color:#fff">${esc(ins.prenom)} ${esc(ins.nom)}</b>,</p>
      <p>Nous vous remercions sincèrement pour l'intérêt que vous portez à la Conférence <b>DELOS 2026</b> et pour le temps consacré à votre inscription.</p>
      <p>Après vérification attentive par notre comité d'organisation, nous sommes au regret de vous informer que <b>votre inscription n'a pas pu être validée</b>.</p>
      <div class="info">
        <div><b>Motif :</b> ${esc(reason)}</div>
        <div style="margin-top:8px"><b>Référence communiquée :</b> ${esc(ins.ref) || '—'}</div>
      </div>
      <h2 style="margin-top:24px">Que faire maintenant ?</h2>
      <p>1️⃣ <b>Vérifiez votre capture d'écran ou le SMS</b> de confirmation de transfert Mobile Money (numéro, montant, référence).</p>
      <p>2️⃣ <b>Contactez le comité DELOS</b> par WhatsApp au <b>+229 01 96 96 29 85</b> pour toute clarification ou aide.</p>
      <p>3️⃣ <b>Soumettez à nouveau le formulaire</b> sur le site officiel, une fois la correction effectuée.</p>
      <p>Nous restons à votre disposition et espérons vous accueillir très bientôt au <b>Centre CEV — Calavi-Tankpè</b>, du <b>21 au 26 septembre 2026</b>.</p>
      <p>Avec nos meilleures salutations,<br><b style="color:#F59E0B">Le Comité d'Organisation DELOS 2026</b></p>
    `)
  };
}

/* ================================================================
   ENDPOINTS
   ================================================================ */
app.get('/api/health', (_req, res) => {
  res.json({ ok:true, smtpReady, smtpLastError, provider: EMAIL_PROVIDER, from: EMAIL_PROVIDER === 'brevo' ? `${BREVO_SENDER_NAME} <${BREVO_SENDER_EMAIL}>` : MAIL_FROM, smtpUser: SMTP_USER || null, smtpHost: SMTP_HOST_IP || 'smtp.gmail.com', smtpPort: SMTP_PORT_USED });
});

app.post('/api/admin/send-email', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== ADMIN_TOKEN){
      console.error('[AUTH] Token admin invalide');
      return res.status(401).json({ ok:false, error:'Token admin invalide' });
    }
    const { type, inscription, reason } = req.body || {};
    if (!type || !inscription || !inscription.email){
      return res.status(400).json({ ok:false, error:'Payload invalide (type, inscription.email requis)' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inscription.email)){
      return res.status(400).json({ ok:false, error:'Adresse email du participant invalide' });
    }

    let mail;
    if (type === 'validate'){
      mail = buildValidationEmail(inscription);
    } else if (type === 'reject'){
      mail = buildRejectionEmail(inscription, reason || 'Paiement non confirmé.');
    } else {
      return res.status(400).json({ ok:false, error:'Type inconnu (attendu: validate|reject)' });
    }

    if (EMAIL_PROVIDER === 'brevo'){
      if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL){
        console.error('[BREVO] ❌ Non configuré (BREVO_API_KEY / BREVO_SENDER_EMAIL manquants)');
        return res.status(503).json({ ok:false, error:'Serveur email non configuré (clé Brevo manquante)' });
      }
      const info = await brevoSend(inscription.email, mail.subject, mail.html);
      console.log('[BREVO] ✅ Email envoyé:', info.messageId, '→', inscription.email);
      return res.json({ ok:true, id: info.messageId, to: inscription.email, subject: mail.subject });
    }

    if (!transporter){
      console.error('[SMTP] ❌ Non configuré (SMTP_USER/SMTP_PASS manquants dans server/.env)');
      return res.status(503).json({ ok:false, error:'Serveur email non configuré (identifiants SMTP manquants)' });
    }

    const info = await sendWithRetry({
      from: MAIL_FROM,
      to: inscription.email,
      subject: mail.subject,
      html: mail.html
    });

    console.log('[SMTP] ✅ Email envoyé:', info.messageId, '→', inscription.email);
    return res.json({ ok:true, id: info.messageId, to: inscription.email, subject: mail.subject });
  } catch(err){
    console.error('[SMTP] ❌ Erreur envoi:', err?.message);
    const msg = /Invalid login|Username and Password not accepted/i.test(err?.message || '')
      ? 'Authentification Gmail refusée (vérifiez le mot de passe d\'application à 16 lettres)'
      : (err?.message || 'Erreur envoi email');
    return res.status(500).json({ ok:false, error: msg });
  }
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[DELOS] Serveur email démarré sur http://0.0.0.0:${PORT}`);
  await checkSmtp();
  if (EMAIL_PROVIDER === 'brevo'){
    console.log(`[DELOS] Email via Brevo HTTPS: ${smtpReady ? '✓ prêt (' + BREVO_SENDER_EMAIL + ')' : '✗ NON PRÊT — vérifiez BREVO_API_KEY'}`);
  } else {
    console.log(`[DELOS] SMTP Gmail: ${smtpReady ? '✓ connecté (' + SMTP_USER + ')' : '✗ NON CONNECTÉ — vérifiez server/.env'}`);
  }
  console.log(`[DELOS] From: ${EMAIL_PROVIDER === 'brevo' ? `${BREVO_SENDER_NAME} <${BREVO_SENDER_EMAIL}>` : MAIL_FROM}`);
});
