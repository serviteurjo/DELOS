# DELOS

**CONFÉRENCE DELOS 2026 — Média, Cinéma & IA au service de l'Évangile et de l'Entrepreneuriat Chrétien**

21 → 26 septembre 2026 · Centre CEV, Calavi-Tankpè (Bénin)
28 sessions · 12 experts · Pass dès 1 000 FCFA

## Structure

| Dossier | Contenu |
|---|---|
| `/` | Site vitrine statique (HTML/CSS/Tailwind) — déployé sur Vercel |
| `admin.html` / `admin/index.html` | Dashboard d'administration des inscriptions |
| `server/` | Serveur d'envoi d'emails (Express + Nodemailer/Gmail) — déployé sur Render |
| `assets/` | Images, fontes auto-hébergées et CSS Tailwind compilé |

## Déploiement

- **Site** : Vercel (statique, zéro build)
- **Email** : Render (Web Service) — voir `server/README.md` section 6

## Prérequis

- Node ≥ 18
- `server/.env` (voir `server/.env.example`) — **jamais commité**