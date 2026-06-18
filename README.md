# Dashboard CEO — Groupe Meridian Immobilier

Dashboard multi-sources pour le dirigeant d'une agence immobilière, avec une
couche IA conversationnelle. Trois sources de données (finances, activité
commerciale, portefeuille de biens) sont consolidées en une vue de pilotage,
des alertes sont générées automatiquement au chargement, et un assistant Claude
répond aux questions du CEO à partir de ces données.

> Test technique — poste développeur fullstack.

---

## Stack

- **React + Vite + TypeScript** côté front
- **Tailwind CSS** pour le style
- **Recharts** pour le graphique de chiffre d'affaires
- **Express** (serveur local minimal) pour relayer les appels à l'API Anthropic
- **@anthropic-ai/sdk** — modèle `claude-sonnet-4-6` (`claude-sonnet-4-20250514` n'étant plus disponible)

Aucune authentification, aucune base de données : les données sont des fichiers
JSON mock statiques.

---

## Lancer le projet en local

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer la clé API

Copier le fichier d'exemple puis renseigner votre clé Anthropic :

```bash
cp .env.example .env
# puis éditer .env :
# ANTHROPIC_API_KEY=sk-ant-...
```

La clé n'est lue que par le serveur Express. Elle n'est **jamais** exposée au
navigateur ni committée (`.env` est dans `.gitignore`).

> **Modèle.** Le serveur utilise par défaut le modèle imposé par le brief,
> `claude-sonnet-4-20250514`. Si votre clé n'y a pas accès, surchargez-le via la
> variable `ANTHROPIC_MODEL` dans `.env` (ex. `ANTHROPIC_MODEL=claude-sonnet-4-6`).

### 3. Démarrer le front et le serveur

Deux terminaux :

```bash
# Terminal 1 — serveur API (port 3001)
npm run server

# Terminal 2 — front Vite (port 5173)
npm run dev
```

Ou bien tout en une commande :

```bash
npm run dev:all
```

Puis ouvrir **http://localhost:5173**.

> Le front interroge le serveur via `/api/*`, redirigé vers `http://localhost:3001`
> par le proxy Vite (voir `vite.config.ts`) — pas de souci de CORS en dev.
> Le port du serveur est surchargeable via la variable `PORT` (défaut : 3001).

Le dashboard et les alertes fonctionnent **sans clé API**. Seul le chat IA
nécessite une clé valide ; en son absence, il affiche un message d'erreur clair.

---

## Fonctionnalités

- **Vue consolidée CEO** — 5 KPIs en cartes : CA du mois vs objectif, trésorerie
  vs 30 j, taux d'occupation vs objectif, valeur du pipeline, total des impayés.
  Indicateurs visuels de tendance (vert au-dessus / rouge en-dessous).
- **Alertes intelligentes** générées côté client au chargement (logique simple,
  sans IA) : impayés > 60 j, occupation sous l'objectif, bail commercial
  expirant, relances critiques en retard, trésorerie en baisse. Triées par
  criticité, code couleur rouge / orange / jaune.
- **Vue Financier** — graphique CA 12 mois (barres colorées selon l'objectif),
  impayés triés par ancienneté décroissante, factures en attente.
- **Vue Activité** — performance des agents, pipeline par étape, relances triées
  par priorité (critique > haute > moyenne), avis Google.
- **Vue Biens** — portefeuille avec statut coloré (occupé / vacant / travaux /
  vente), alertes patrimoine, alertes par bien.
- **Assistant IA** — chat envoyant la question + le contexte des 3 JSON au
  serveur, qui appelle Claude avec un prompt système strict (citer les chiffres
  exacts, ne jamais halluciner). Rendu markdown basique, état de chargement.

---

## Choix techniques

- **Vite plutôt que Next.js** : setup quasi instantané, démarrage rapide, pas
  besoin de SSR ni de routing serveur pour un dashboard mono-page.
- **Tailwind** : itération rapide sur l'UI sans quitter le JSX, rendu lisible et
  cohérent sans écrire de CSS dédié.
- **Express minimal (un seul fichier, un seul endpoint)** : le seul besoin
  serveur est de garder la clé API hors du navigateur. Un framework complet
  serait disproportionné. La route `POST /api/chat` injecte le contexte des
  données dans le prompt système et relaie la réponse.
- **Données importées statiquement** côté front : ce sont des fichiers mock, ils
  n'ont pas besoin de transiter par le serveur pour être affichés.
- **Alertes calculées côté client** : la logique est déterministe et simple
  (seuils, tris), un appel IA serait inutile et coûteux.
- **Pas de state global (Redux…)** : `useState` / `useMemo` suffisent à ce périmètre.

---

## Déploiement (Vercel)

Le projet est prêt pour Vercel. L'architecture s'adapte automatiquement :

- le **front** est servi en statique depuis `dist/` (build Vite) ;
- la route `/api/chat` est assurée en local par le serveur **Express**
  (`server/index.js`) et en production par une **fonction serverless**
  (`api/chat.js`). Les deux partagent la même logique (`server/chat-core.js`),
  donc aucune duplication.

Étapes :

1. Pousser le dépôt sur GitHub.
2. Sur Vercel : **New Project → importer le dépôt**. Le framework Vite et le
   dossier `/api` sont détectés automatiquement (voir `vercel.json`).
3. Dans **Settings → Environment Variables**, ajouter `ANTHROPIC_API_KEY`
   (et au besoin `ANTHROPIC_MODEL`). **Ne jamais** committer la clé.
4. Déployer. Le front et `/api/chat` sont servis sur le même domaine — aucun
   souci de CORS en production.

## Sécurité

- La clé API n'apparaît jamais dans le code source ni dans le bundle client.
- Tous les appels à l'API Anthropic passent par le serveur (Express en local,
  fonction serverless en production) — jamais depuis le navigateur.
- `.env` est ignoré par git ; seul `.env.example` (sans valeur) est versionné.
- En production, la clé vit dans les variables d'environnement Vercel.

---

## Limites assumées

- Pas de tests automatisés.
- Pas de persistance (aucune base, l'historique de chat est en mémoire de session).
- Gestion d'erreur volontairement basique (clé manquante, erreur réseau / API).
- Design fonctionnel et lisible, sans recherche graphique poussée.
- Seuls 10 des 28 biens sont détaillés dans les données fournies (le reste n'est
  présent que dans les compteurs de synthèse).
- Le rendu markdown du chat est minimal (gras, listes, sauts de ligne).

---

## Avec plus de temps

- Cache des réponses IA (questions récurrentes).
- Streaming de la réponse Claude (affichage token par token).
- Historique de conversation envoyé à l'API pour un vrai fil multi-tours.
- Tests unitaires sur la logique de génération d'alertes.
- Pagination / filtres sur les listes longues (biens, impayés).
- Authentification du endpoint `/api/chat` (actuellement ouvert) pour éviter
  tout usage non maîtrisé de la clé en production.
```
