/**
 * @module main
 * @description
 * Point d’entrée de l’application. Prépare l’UI, charge les données distantes,
 * active les comportements de la modale et synchronise les filtres/URL.
 *
 * Dépendances :
 * - `fetchData` (API HTTP)
 * - Fonctions DOM (`displayWorks`, `displayFilters`, etc.)
 * - Fonctions utilitaires (`isLogIn`, `slugify`, etc.)
 *
 * Effets de bord :
 * - Mutations DOM (bannière admin, liens "Modifier", modale, galerie, filtres)
 * - Lecture du token (auth) via `isLogIn`
 * - Historique navigateur modifié (pushState) via les filtres
 */

/**
 * @typedef {Object} Category
 * @property {number|string} id
 * @property {string} name
 */

/**
 * @typedef {Object} Work
 * @property {number|string} id
 * @property {string} title
 * @property {string} imageUrl
 * @property {{ name: string }} category
 */
import { fetchData } from "./scripts/api.js";
import { displayWorks, displayFilters, displayGalleryError, domModificationLogIn, addAdminBanner, addEditLink, displayModal, exitModal, displayModalGallery, displayModalAddPhoto, handleModalBack, enableUploadLabelTrigger } from "./scripts/dom.js";
import { getCategoryNameFromQueryParam, getUniqueCategories, isLogIn, logOut, slugify } from "./scripts/utils.js";




/**
 * Initialise l’application :
 * 1) Vérifie l’authentification et applique l’UI admin si nécessaire
 * 2) Récupère les projets via l’API
 * 3) Affiche la modale (listeners), la galerie et les filtres
 * 4) Applique un filtrage initial selon l’URL (`?category=...`)
 *
 * Gestion d’erreur :
 * - Log technique en console
 * - Message utilisateur dans la section portfolio via `displayGalleryError`
 *
 * @async
 * @function init
 * @returns {Promise<void>} Résout une fois l’UI prête
 */
(async function init() {
  try {
    const isAuth = isLogIn();

    /** @type {Work[]} */
    const works = await fetchData("http://localhost:5678/api/works");
    
    if (isAuth) {
      addAdminBanner();
      addEditLink();
      logOut(isAuth);
      domModificationLogIn(isAuth);
      displayModal();
      exitModal();
      displayModalGallery(works);
      displayModalAddPhoto();
      handleModalBack();
      enableUploadLabelTrigger();
    }

    const categorySlug = getCategoryNameFromQueryParam();
    const filteredWorks = categorySlug
      ? works.filter(work => slugify(work.category.name) === categorySlug)
      : works;

    /** @type {Category[]} */
    const uniqueCategories = getUniqueCategories(works);
    displayFilters(uniqueCategories, works);
    displayWorks(filteredWorks);
  } catch (error) {
    console.error("[main.js]", error.message);
    displayGalleryError("Impossible de charger les projets. Veuillez réessayer plus tard.");
  }
})();