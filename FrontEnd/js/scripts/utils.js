// ./js/script/utils.js

/** @typedef {import("./dom.js").Work} Work */
/** @typedef {import("./dom.js").Category} Category */


/**
 * Retourne les catégories uniques (par id) à partir des works.
 * @param {Work[]} works
 * @returns {Category[]}
 */
export function getUniqueCategories(works) {
  const seen = new Set();
  /** @type {Category[]} */
  const out = [];

  for (const w of (Array.isArray(works) ? works : [])) {
    const c = w?.category || null;
    const id = (c && c.id != null) ? c.id : (w?.categoryId != null ? w.categoryId : null);
    if (id == null) continue;

    const key = String(id);
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      id,
      name: (c && typeof c.name === "string") ? c.name : ""
    });
  }
  return out;
}


/**
 * Lit `?category=...` et renvoie le slug en minuscule (ou null).
 * @returns {string|null}
 */
export function getCategoryNameFromQueryParam () {
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category");

  return (!selectedCategory || selectedCategory === "all") ? null : selectedCategory.toLowerCase();
}


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
 * Indique si un token d’auth existe en localStorage.
 * @returns {boolean}
 */
export function isLogIn() {
  return !!localStorage.getItem("token");
}


/**
 * Attache le handler de déconnexion (si connecté).
 * @param {boolean} isAuth
 * @returns {void}
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


/**
 * Nettoie un nom de fichier pour affichage/alt.
 * @param {string} fileName
 * @returns {string}
 */
export function cleanFileName(fileName) {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  const cleanedName = nameWithoutExt.replace(/[^a-zA-ZÀ-ÿ0-9\s\-']/g, " ");
  return cleanedName.length > 100
   ? cleanedName.slice(0,100) + "..."
   :cleanedName;
}


/**
 * Valide un fichier image (type/poids).
 * @param {File} file
 * @returns {{ok:true} | {ok:false, message:string}}
 */
export function validateImageFile(file) {
  const MAX = 4 * 1024 * 1024;
  const ALLOWED = ["image/jpeg", "image/png"];

  if (!ALLOWED.includes(file.type)) {
    return {ok: false, message: UI_ERROR_MSG.extension};
  }
  if (file.size > MAX) {
    return {ok: false, message: UI_ERROR_MSG.size}
  }
  return { ok: true};
}


// Table de messages UI (au niveau module)
export const UI_ERROR_MSG = {
  delete: "Suppression échouée. Veuillez réessayer plus tard.",
  upload: "Échec de l’envoi. Veuillez réessayer plus tard.",
  categories: "Impossible de charger les catégories.",
  gallery: "Impossible de charger les projets. Veuillez réessayer plus tard.",
  form: "Veuillez remplir tous les champs.",
  email: "Adresse email invalide.",
  login: "Identifiants incorrects. Veuillez réessayer.",
  extension: "Formats acceptés : JPEG ou PNG.",
  size: "Image trop lourde (4 Mo max).",
  generic: "Une erreur est survenue. Réessayez plus tard."
};