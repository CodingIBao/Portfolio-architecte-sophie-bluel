// ./js/script/utils.js


/* =========================================================
 * CONSTANTES — messages d’erreurs UI
 * =======================================================*/

// Table de messages UI (au niveau module)
export const UI_ERROR_MESSAGES = Object.freeze({
  categories: "Impossible de charger les catégories.",
  category: "Veuillez choisir une catégorie",
  delete: "Suppression échouée. Veuillez réessayer plus tard.",
  email: "Adresse email invalide.",
  extension: "Formats acceptés : JPEG ou PNG.",
  form: "Veuillez remplir tous les champs.",
  gallery: "Impossible de charger les projets. Veuillez réessayer plus tard.",
  generic: "Une erreur est survenue. Réessayez plus tard.",
  image: "Veuillez ajouter une image",
  login: "Identifiants incorrects. Veuillez réessayer.",
  title: "Veuillez saisir un titre",
  size: "Image trop lourde (4 Mo max).",
  upload: "Échec de l’envoi. Veuillez réessayer plus tard."
});


/* =========================================================
 * STRINGS — formatage de chaînes (slugs, noms de fichiers)
 * =======================================================*/

/**
 * Convertit un texte en slug URL-safe.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")  // enlève les accents
    .replace(/[\u0300-\u036f]/g, "")  // enlève les caractères diacritiques restants
    .replace(/&/g, "et")  // remplace & par "et"
    .replace(/\s+/g, "-")  // remplace espaces par tirets
    .replace(/[^\w-]/g, "")  // supprime tout ce qui n’est pas alphanum ou tiret
    .trim();
}


/**
 * Nettoie un nom de fichier pour affichage/alt.
 * @param {string} fileName
 * @returns {string}
 */
export function cleanFileName(fileName) {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, ""); // Supprime l'extension du fichier
  const cleanedName = nameWithoutExt.replace(/[^a-zA-ZÀ-ÿ0-9\s\-']/g, " "); // Remplace tout caractère qui n’est PAS une lettre (a-z, A-Z, accentuée), chiffre, espace, tiret ou apostrophe par un espace
  return cleanedName.length > 100
   ? cleanedName.slice(0,100) + "..."
   :cleanedName;
}


/* =========================================================
 * URL — lecture/écriture de paramètres d’URL
 * =======================================================*/

/**
 * Lit `?category=...` et renvoie le slug en minuscule (ou null).
 * @returns {string|null}
 */
export function getCategoryNameFromQueryParam () {
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category");

  return (!selectedCategory || selectedCategory === "all") ? null : selectedCategory.toLowerCase();
}


/* =========================================================
 * AUTH — état d’authentification & déconnexion
 * =======================================================*/

/**
 * Indique si un token d’auth existe en localStorage.
 * @returns {boolean}
 */
export function isLogIn() {
  return !!localStorage.getItem("token");
}


/**
 * Attache le handler de déconnexion (si connecté).
 * @param {boolean} isAuth
 * @returns {void} Ne retourne rien
 */
export function logOut(isAuth) {
  const logoutLink = document.getElementById("link-login");

  if (!logoutLink || !isAuth) return;

  if (logoutLink.dataset.bound === "true") return;
  logoutLink.dataset.bound = "true";

  logoutLink.addEventListener("click", (e)=> {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.replace("./login.html");
  })
}


/* =========================================================
 * DOM — petits helpers DOM génériques
 * =======================================================*/

/**
 * Crée un élément avec attributs et texte.
 * @param {keyof HTMLElementTagNameMap} tag
 * @param {Record<string, string>} [attributes={}]
 * @param {string} [textContent=""]
 * @returns {HTMLElement}
 */
export function createElement(tag, attributes = {}, textContent = "") {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  if (textContent != undefined && textContent !== null) {
    element.textContent = String(textContent);
  }
  return element;
}


/* =========================================================
 * VALIDATION — contrôles de fichiers & formulaires
 * =======================================================*/

/**
 * Valide un fichier image (type/poids).
 * @param {File} file
 * @returns {{ok:true} | {ok:false, message:string}}
 */
export function validateImageFile(file) {
  const MAX = 4 * 1024 * 1024;
  const ALLOWED = ["image/jpeg", "image/png"];

  if (!ALLOWED.includes(file.type)) {
    return {ok: false, message: UI_ERROR_MESSAGES.extension};
  }
  if (file.size > MAX) {
    return {ok: false, message: UI_ERROR_MESSAGES.size}
  }
  return { ok: true};
}