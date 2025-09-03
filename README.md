# Portfolio Architecte – Sophie Bluel

Code du projet 6 de la formation Intégrateur Web (OpenClassrooms).  
Développement du site portfolio d’une architecte d’intérieur, avec backend Node.js/Express fourni et frontend en HTML/CSS/JavaScript vanilla.

---

## 🎯 Contexte du projet

Vous travaillez comme développeur front-end pour l’agence **ArchiWebos**  
L’architecte d’intérieur Sophie Bluel souhaite mettre en ligne son portfolio, avec une gestion simple de ses projets.

### Missions principales

1. **Page de présentation des travaux**

   - Afficher dynamiquement les projets depuis le backend
   - Permettre le filtrage par catégories

2. **Page de connexion administrateur**

   - Créer une page de login conforme à la maquette
   - Authentifier via l’API (`POST /users/login`) et stocker le token

3. **Modale d’administration**
   - Permettre l’upload de nouveaux projets (image + titre + catégorie)
   - Gérer la suppression de projets existants
   - Assurer que les modifications se reflètent immédiatement dans le DOM (sans recharger la page)

### Points de vigilance

- Conformité aux maquettes fournies (Figma)
- Utilisation de `fetch` pour toutes les requêtes API
- Accessibilité : navigation clavier, messages d’erreurs accessibles
- Responsive : affichage adapté ≤ 767px et ≤ 480px
- Propreté du code : séparation API / DOM / utils, documentation JSDoc

---

## 📂 Architecture

Ce repository contient les deux briques du projet :

- **Frontend** : site statique (HTML/CSS/JS), galerie dynamique, modale d’admin
- **Backend** : API Node.js/Express (Swagger inclus)

---

## ⚙️ Installation & lancement

### Prérequis

- [Node.js](https://nodejs.org/) et npm installés
- Un serveur statique (ex: [VS Code Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)) pour lancer le frontend

---

### 🔙 Backend

1. Ouvrez un terminal dans le dossier `Backend/`
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur :
   ```bash
   npm start
   ```
4. L’API tourne sur [http://localhost:5678](http://localhost:5678)

**Swagger** est dispo ici : [http://localhost:5678/api-docs/](http://localhost:5678/api-docs/)

#### 🔑 Compte de test

| Email                   | Password |
| ----------------------- | -------- |
| `sophie.bluel@test.tld` | `S0phie` |

⚠️ Laissez ce terminal tourner pendant que vous développez/testez.

## 📡 Endpoints de l’API (rappel)

_Base URL :_ `http://localhost:5678`

| Méthode | Route              | Description                                                                 |
| ------: | ------------------ | --------------------------------------------------------------------------- |
|     GET | `/api/works`       | Liste des projets                                                           |
|     GET | `/api/categories`  | Liste des catégories                                                        |
|    POST | `/api/users/login` | Authentification (email, password → token JWT)                              |
|    POST | `/api/works`       | Création d’un projet (**Auth: Bearer** + FormData : image, title, category) |
|  DELETE | `/api/works/:id`   | Suppression d’un projet (**Auth: Bearer**)                                  |

## 🔐 Authentification & Token (JWT)

- **Login** : `POST /api/users/login` avec `{ email, password }`  
  → réponse : `{ userId, token }`
- **Stockage** (exercice) : le token est sauvegardé dans `localStorage` (`localStorage.token`)
- **Utilisation** : envoyer `Authorization: Bearer <token>` sur les routes protégées (`POST /api/works`, `DELETE /api/works/:id`)
- **Déconnexion** : suppression du token (`localStorage.removeItem("token")`) et redirection vers `login.html`
- **Erreurs** :
  - `400/401` → identifiants invalides (affichage `UI_ERROR_MESSAGES.login`)
  - autres → message générique (`UI_ERROR_MESSAGES.generic`)

### Exemples

**Login (cURL)**

```bash
curl -X POST http://localhost:5678/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sophie.bluel@test.tld","password":"S0phie"}'

DELETE /works/:id (avec token)

TOKEN="copiez_le_token_ici"
curl -X DELETE http://localhost:5678/api/works/123 \
  -H "Authorization: Bearer $TOKEN"

POST /works (upload avec token)
TOKEN="copiez_le_token_ici"
curl -X POST http://localhost:5678/api/works \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/chemin/vers/photo.jpg" \
  -F "title=Mon projet" \
  -F "category=2"


🔒 Note sécu (pédagogique) : le token est stocké dans localStorage pour l’exercice.
En production, on privilégie un cookie httpOnly géré côté serveur.

---

### 🖼️ Frontend

1. Ouvrez le dossier `Frontend/`
2. Lancez **Live Server** depuis votre IDE ou servez le dossier avec un serveur statique
3. Accédez à :
   - http://localhost:5500/index.html → Page d’accueil (galerie)
   - http://localhost:5500/login.html → Page de connexion admin

💡 Astuce : ouvrez **2 instances de VSCode** (une pour `Backend/`, une pour `Frontend/`) pour éviter toute confusion.

---

## ✨ Fonctionnalités implémentées

- **Galerie dynamique** : récupération des projets via `GET /works` et rendu DOM
- **Filtres par catégorie** : générés dynamiquement (`/categories`), synchro avec l’URL `?category=...`
- **Connexion admin** :
  - Page login (maquette respectée)
  - Indication de la page active (`aria-current="page"`) sur le lien Login
  - Validation email/mot de passe
  - `POST /users/login`, stockage du JWT dans `localStorage`
  - Gestion UI (login/logout)
- **Modale d’administration** :
  - Deux vues : _Galerie photo_ et _Ajout photo_
  - Ouverture/fermeture (croix, overlay, ESC), **focus trap**
  - **Suppression** : `DELETE /works/:id`, synchro galerie principale + modale
  - **Ajout** :
    - Validation : type/poids image, titre (100 chars max, nettoyage), catégorie requise
    - `FormData` → `POST /works`
    - Ajout dynamique dans les deux galeries sans reload
- **Événement personnalisé** :
  - `work:deleted` → tenir la galerie et l’état en synchro après suppression
- **Accessibilité (a11y)** :
  - Messages d’erreur avec `role="alert"`, `aria-live`
  - `aria-busy` sur suppression
  - Preview image cliquable et focusable (Enter)
- **Responsive** :
  - ≤ 767px : filtres en wrap, galerie en 2 colonnes, modale adaptée
  - ≤ 480px : galerie en 1 colonne, modale grille 3 colonnes

---

## 🧪 Tests recommandés

- Galerie → chargement depuis l’API (aucun projet statique en HTML)
- Filtres → clic, URL `?category=...`, navigation back/forward
- Login → succès (redirection accueil), échec (message d’erreur)
- Modale → open/close, focus trap, validations formulaire
- Suppression → projet disparaît des deux galeries, sans reload
- Ajout → nouveau projet ajouté aux deux galeries, synchro filtres
- Responsive → affichage correct ≤ 767px et ≤ 480px
- Accessibilité → navigation clavier, lecteurs d’écran (erreurs annoncées)

---

## 📜 Commits & code

- Commits structurés selon [Conventional Commits](https://www.conventionalcommits.org/)
- Code commenté avec **JSDoc** (API helpers, DOM utils, validations, modale…)
- Séparation claire :
  - `api.js` → appels HTTP (fetchData)
  - `utils.js` → helpers (slugify, validations, UI_ERROR_MESSAGES…)
  - `dom.js` → gestion DOM (galerie, modale, erreurs, validations)
  - `main.js` → bootstrap accueil
  - `login.js` → logique page connexion

---
```
