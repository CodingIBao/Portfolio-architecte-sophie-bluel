/**
 * Retourne une liste de catégories uniques à partir d’un tableau de projets.
 *
 * Les doublons sont supprimés en se basant uniquement sur `category.id`.
 *
 * @param {Work[]} works - Tableau d’objets projet contenant une propriété `category`.
 * @returns {Category[]} Tableau des catégories uniques.
 *
 * @example
 * const works = [
 *   { id: 1, title: "Abajour Tahina", category: { id: 1, name: "Objets" } },
 *   { id: 2, title: "Appartement Paris V", category: { id: 2, name: "Appartements" } },
 *   { id: 3, title: "Restaurant Sushisen", category: { id: 3, name: "Hotels & restaurants" } },
 *   { id: 4, title: "Villa Balisière", category: { id: 2, name: "Appartements" } }
 * ];
 *
 * getUniqueCategories(works);
 * // => [
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
 * Retourne toujours la valeur en minuscule. Si le paramètre `category`
 * est absent ou égal à `"all"`, retourne `null`.
 *
 * @returns {string|null} Nom de la catégorie en minuscule ou `null`.
 *
 * @example
 * // URL : http://localhost:3000/?category=Salon
 * getCategoryNameFromQueryParam(); // "salon"
 */
export function getCategoryNameFromQueryParam () {
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category");
  return (!selectedCategory || selectedCategory === "all") ? null : selectedCategory.toLowerCase();
}


/**
 * Convertit un texte en slug compatible avec une URL.
 *
 * - Met en minuscule
 * - Supprime les accents et caractères spéciaux
 * - Remplace les espaces par des tirets
 * - Remplace `&` par "et"
 *
 * @param {string} text - Texte à transformer.
 * @returns {string} Slug généré.
 *
 * @example
 * slugify("Hôtels & Restaurants"); // "hotels-et-restaurants"
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
 * Si `isAuth` est vrai :
 * - Ajoute un listener sur le lien "logout"
 * - Supprime le token du `localStorage`
 * - Redirige vers la page de connexion
 *
 * @param {boolean} isAuth - Indique si l'utilisateur est connecté.
 *
 * @example
 * logOut(isLogIn());
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
