# ============================================================
# DELOS 2026 — Serveur d'envoi d'emails (Express + Nodemailer/Gmail)
# ============================================================

## 1. Installation

```bash
cd server
npm install
```

## 2. Configuration des variables d'environnement

Copiez `.env.example` vers `.env` puis renseignez vos valeurs :

```env
# Obligatoire — compte Gmail expéditeur
SMTP_USER=delos2026centrecev@gmail.com

# Obligatoire — MOT DE PASSE D'APPLICATION Gmail à 16 lettres
# (Compte Google → Sécurité → Validation 2 étapes →
#  Mots de passe des applications). JAMAIS le mot de passe normal.
SMTP_PASS=xxxxxxxxxxxxxxxx

# Optionnel — adresse expéditrice affichée
MAIL_FROM=DELOS 2026 <delos2026centrecev@gmail.com>

# Optionnel — token admin attendu côté client (header x-admin-token)
ADMIN_TOKEN=delos-admin-2026

# Optionnel — port du serveur
PORT=3001
```

## 3. Démarrage (OBLIGATOIRE avant d'utiliser l'admin)

Sans ce serveur, la validation d'inscription affiche
« Email non envoyé — serveur email injoignable ».

```bash
npm start
# → Serveur en écoute sur http://localhost:3001
# → [DELOS] SMTP Gmail: ✓ connecté (...) si tout est bon
```

Vérification rapide :

```bash
curl http://localhost:3001/api/health
# {"ok":true,"smtpReady":true,...}
```

> `smtpReady:false` → vérifiez `SMTP_USER` / `SMTP_PASS` dans `server/.env`.
> Le serveur réessaie automatiquement 1 fois en cas de coupure
> transitoire Gmail (« Unexpected socket close »).

Endpoints :
- `GET  /api/health` — vérification rapide (`smtpReady`, `smtpLastError`, `from`)
- `POST /api/admin/send-email` — envoi des emails validation/rejet
  - Header : `x-admin-token: <ADMIN_TOKEN>`
  - Body : `{ type: 'validate'|'reject', inscription: {...}, reason?: '...' }`

## 4. Côté front (admin)

Le Dashboard Admin appelle automatiquement `http://localhost:3001/api/admin/send-email`
et affiche l'état du serveur dans le badge `EMAIL OPÉRATIONNEL / EMAIL KO` en haut.
Pour pointer sur un autre serveur, définissez avant le chargement de `admin/index.html` :

```html
<script>
  window.RESEND_API_URL    = 'https://api.votredomaine.com';
  window.RESEND_ADMIN_TOKEN = 'votre-token-secret';
</script>
```

Si un email échoue (serveur éteint au moment de la validation),
rouvrez la fiche de l'inscription et cliquez **« ↻ Renvoyer l'email »**.

## 5. Flux

1. L'admin clique **Valider** ou **Rejeter** une inscription dans le dashboard.
2. Le front génère les codes de tickets (`DELOS-SP-XXX` ou `PANXX-INSXXX`).
3. Le front POST vers `/api/admin/send-email` avec l'inscription + les tickets.
4. Le serveur (Express + Nodemailer/Gmail) construit le template HTML (tickets visuels,
   récapitulatif, motif de rejet) puis envoie via SMTP Gmail (avec 1 retry auto).
5. Le serveur renvoie `{ ok, id }` ou `{ ok:false, error }` — l'admin affiche
   un toast de succès ou d'échec + mémorise `emailSent` sur l'inscription.

## 6. Déploiement PRODUCTION — Render (serveur email) + Vercel (site)

### Vue d'ensemble
RENDER (https://render.com — plan gratuit) = serveur email 24h/24.
VERCEL (https://vercel.com — plan gratuit) = site statique DELOS.
Le site appelle l'API Render pour envoyer les emails de validation/rejet.

### Pull d'abord vers GitHub
1. Créer un dépôt GitHub (ex: `delos-2026`).
2. Depuis la racine du projet :
   ```bash
   git init
   git add .
   git commit -m "DELOS 2026 — site + serveur email (production-ready)"
   git branch -M main
   git remote add origin https://github.com/VOTRE_COMPTE/delos-2026.git
   git push -u origin main
   ```
   (Le `.gitignore` racine exclut déjà `server/.env` et `node_modules/`.)

### Render — Web Service (dossier server/)
1. dashboard.render.com → **New** → **Web Service** → connecter le repo GitHub.
2. Renseigner :
   - **Root Directory** : `server`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : Free
3. Dans **Environment**, ajouter les SECRETS (le port est fourni
   automatiquement par Render, ne pas mettre PORT) :
   - `SMTP_USER` = delos2026centrecev@gmail.com
   - `SMTP_PASS` = mot de passe d'application Gmail (16 lettres)
   - `MAIL_FROM` = DELOS 2026 <delos2026centrecev@gmail.com>
   - `ADMIN_TOKEN` = TOKEN FORT UNIQUE (jamais celui du code !)
   - `ALLOWED_ORIGINS` = https://delos2026.vercel.app
4. **Health Check Path** : `/api/health` → **Create Web Service**.
5. Copier l'URL finale (ex: `https://delos-2026-email.onrender.com`)
   → tester : `curl https://delos-2026-email.onrender.com/api/health`
   doit répondre `{"ok":true,"smtpReady":true,...}`.

### Vercel — Site statique (racine du repo)
1. https://vercel.com/new → importer le même dépôt GitHub → **Deloy**.
2. Aucun build nécessaire (HTML/CSS/JS statiques) — Vercel détecte automatiquement.
3. Le nom de projet définira le domaine (ex: `delos2026.vercel.app`).

### Brancher l'admin sur Render
Dans `admin.html` et `admin/index.html`, le bloc suivant (déjà présent) doit
pointer vers l'URL Render réelle :
```html
<script>
  window.RESEND_API_URL = 'https://delos-2026-email.onrender.com';
  window.RESEND_ADMIN_TOKEN = 'TOKEN-FORT-UNIQUE';
</script>
```
⚠️ Le token dans `window.RESEND_ADMIN_TOKEN` doit correspondre EXACTEMENT
au `ADMIN_TOKEN` défini dans Render. En local (dev) l'admin retombe sur
`http://localhost:3001` si la variable est absente.

### Validation finale
1. Ouvrir `https://delos2026.vercel.app/admin.html` → badge **EMAIL OPÉRATIONNEL**.
2. Tester un envoi réel (validation d'une inscription d'essai).
