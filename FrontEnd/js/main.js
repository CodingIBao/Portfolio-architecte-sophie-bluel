// ./js/main.js

/**
 * @module main
 * @description
 * Point d’entrée de l’application.
 *
 * Rôle :
 * - Prépare l’UI
 * - Charge les données distantes (works + categories)
 * - Active la modale (si authentifié)
 * - Synchronise les filtres/URL
 *
 * Effets de bord :
 * - Mutations DOM (bannière admin, liens "Modifier", modale, galerie, filtres)
 * - Lecture/écriture du token (auth) via `localStorage`
 * - Historique navigateur modifié (`pushState`) via les filtres
 *
 * Intégrations :
 * - Callback passé à `setupUploadSubmit` pour mettre à jour la galerie après upload
 *
 * Événements écoutés :
 * - `work:deleted` (après suppression, pour MAJ galerie/filtre courant)
 */

import {
  getWorks,
  getCategories
} from "./scripts/api.js";

import {
  displayWorks,
  displayFilters,
  renderGalleryError,
  domModificationLogIn,
  addAdminBanner,
  addEditLink,
  displayModal,
  exitModal,
  displayModalGallery,
  mountModalNavigation,
  setupImageField,
  setupTitleField,
  setupCategoryValidation,
  setupUploadButtonState,
  setupUploadSubmit
} from "./scripts/dom.js";

import {
  getCategoryNameFromQueryParam,
  isLogIn,
  logOut,
  slugify
} from "./scripts/utils.js";


/**
 * Ré-affiche la galerie selon le slug courant dans l’URL.
 * - Si `?category=<slug>` est présent : filtre les works par `category.name` sluggifié.
 * - Sinon : affiche tous les works.
 *
 * @param {Array} works - Liste complète des projets à filtrer/afficher.
 * @returns {void}
 */
function renderGalleryByUrlFilter(works) {
  const slug = getCategoryNameFromQueryParam();
  const list = slug
    ? works.filter(w => slugify(w.category?.name || "") === slug)
    : works;
  displayWorks(list);
}


/**
 * Initialise l’application :
 * 1) Vérifie l’authentification et applique l’UI admin si nécessaire
 * 2) Récupère les projets + catégories via l’API (en parallèle)
 * 3) Monte la modale + validations si connecté
 * 4) Affiche la galerie + les filtres, puis applique le filtre issu de l’URL (`?category=...`)
 *
 * Gestion d’erreur :
 * - Message utilisateur dans la section portfolio via `renderGalleryError`
 *
 * @async
 * @function init
 * @returns {Promise<void>} Résout une fois l’UI prête.
 *
 * @example
 * // Chargement automatique au démarrage de la page
 * // (async function init() {})();
 */
(async function init() {
  try {
    const isAuth = isLogIn();

    // Charge works + categories en parallèle
    const [worksFetched, categoriesFetched] = await Promise.all([
      getWorks(),
      getCategories()
    ]);
    
    const works = Array.isArray(worksFetched)
      ? worksFetched
      : [];

    const categories = Array.isArray(categoriesFetched) 
      ? categoriesFetched
      : [];

    if (isAuth) {
      // Header / bandeau / liens d’édition
      addAdminBanner();
      addEditLink();
      logOut(isAuth);
      domModificationLogIn(isAuth);

      // Modale + formulaires (ajout projet)
      displayModal();
      exitModal();
      displayModalGallery(works);
      mountModalNavigation();
      setupImageField();
      setupTitleField();
      setupCategoryValidation();
      setupUploadButtonState();

      // Après création réussie → MAJ état local + re-render filtré
      setupUploadSubmit(
        (newWork) => {
          works.push(newWork);
          renderGalleryByUrlFilter(works);
        }
      );
    }

    // Filtres construits depuis l’API (toutes les catégories)
    displayFilters(categories, works);

    document.addEventListener(
      "work:deleted",
      (e) => {
        const deletedId = Number(e.detail?.id);
        const idx = works.findIndex(w => Number(w.id) === deletedId);
        if (idx !== -1) works.splice(idx, 1);
        renderGalleryByUrlFilter(works);
      }
    );

    // Navigation (retour arrière) → ré-applique le filtre URL
    window.addEventListener("popstate", () => {
      // NOTE: la filtration URL repose sur work.category?.name (l’API renvoie déjà le nom de catégorie et createWork normalise après upload).
      renderGalleryByUrlFilter(works);
    });

  } catch {
    renderGalleryError();
  }
})();