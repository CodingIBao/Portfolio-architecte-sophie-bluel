/**
 * Retourne une liste de catégories uniques à partir d’un tableau de projets.
 *
 * Pour chaque projet, la fonction récupère l’objet `category`, puis filtre
 * les doublons en se basant sur l’identifiant (`category.id`).
 *
 * Bien que l’identifiant soit utilisé pour détecter l’unicité,
 * c’est le nom (`category.name`) qui est utilisé dans l’interface utilisateur pour le filtrage.
 *
 * @function getUniqueCategories
 * @param {Object[]} works - Tableau d’objets projet, chacun contenant une propriété `category`.
 * @param {Object} works[].category - Catégorie associée à un projet.
 * @param {number} works[].category.id - Identifiant unique de la catégorie.
 * @param {string} works[].category.name - Nom lisible de la catégorie.
 * @returns {Object[]} - Tableau des catégories uniques (exemple : { id, name }).
 *
 * @example
 * const works = [
 *   { id: 1, title: "Abajour Tahina", category: { id: 1, name: "Objets" } },
 *   { id: 2, title: "Appartement Paris V", category: { id: 2, name: "Appartements" } },
 *   { id: 3, title: "Restaurant Sushisen", category: { id: 3, name: "Hotels & restaurants" } },
 *   { id: 4, title: "Villa Balisière", category: { id: 2, name: "Appartements" } }
 * ];
 *
 * const uniqueCategories = getUniqueCategories(works);
 * // Résultat :
 * // [
 * //   { id: 1, name: "Objets" },
 * //   { id: 2, name: "Appartements" },
 * //   { id: 3, name: "Hotels & restaurants" }
 * // ]
 */
export function getUniqueCategories(works) {
  const allCategories = works.map(work => work.category);
  const uniqueCategoryIds = new Set();

  const uniqueCategories = allCategories.filter(category => {
    const isDuplicate = uniqueCategoryIds.has(category.id);
    uniqueCategoryIds.add(category.id);
    return !isDuplicate;
  });

  return uniqueCategories;
}


/**
 * Extrait le nom de la catégorie depuis les paramètres de l'URL.
 *
 * Analyse la chaîne de requête de l'URL (ex. : `?category=salon`) et retourne
 * le nom de la catégorie sous forme de chaîne. Si aucun paramètre n'est présent
 * ou si la valeur est "all", la fonction retourne `null`.
 *
 * @returns {string|null} Le nom de la catégorie (ex. : "salon", "cuisine") ou `null`.
 *
 * @example
 * // URL : http://localhost:3000/?category=salon
 * const name = getCategoryNameFromQueryParam(); // "salon"
 *
 * @example
 * // URL : http://localhost:3000/?category=all
 * const name = getCategoryNameFromQueryParam(); // null
 */
export function getCategoryNameFromQueryParam () {
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category");
  return (!selectedCategory || selectedCategory === "all") ? null : selectedCategory.toLowerCase();
}


/**
 * Convertit un texte en slug compatible avec une URL.
 *
 * @param {string} text - Le texte à transformer.
 * @returns {string} - Le slug généré (ex. : "Hôtels & Restaurants" → "hotels-restaurants").
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
 * Vérifie si un utilisateur est connecté en vérifiant la présence d’un token.
 *
 * @returns {boolean} `true` si un token est présent et non vide, sinon `false`.
 *
 * @example
 * if (isLogIn()) {
 *   // Afficher les éléments admin
 * }
 */
export function isLogIn() {
  return !!localStorage.getItem("token");
}


/**
 * Gère la déconnexion de l'utilisateur.
 *
 * Si l'utilisateur est connecté (`isAuth` est `true`), cette fonction
 * ajoute un écouteur sur le lien "logout" pour :
 * - Supprimer le token stocké dans le localStorage
 * - Rediriger vers la page de connexion
 *
 * @param {boolean} isAuth - Indique si l'utilisateur est connecté.
 */
export function logOut(isAuth) {
  const logOut = document.getElementById("link-login");
  if (!logOut || !isAuth) return;
  logOut.addEventListener("click", (e)=> {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.replace("./login.html");
  })
}
