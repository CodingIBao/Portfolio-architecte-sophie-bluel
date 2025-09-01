// ./js/main.js

/**
 * @module main
 * @description
 * Point d’entrée de l’application.
 * - Prépare l’UI
 * - Charge les données distantes
 * - Active la modale (si authentifié)
 * - Synchronise les filtres/URL
 *
 * Effets de bord :
 * - Mutations DOM (bannière admin, liens "Modifier", modale, galerie, filtres)
 * - Lecture/écriture du token (auth) via `localStorage`
 * - Historique navigateur modifié (`pushState`) via les filtres
 *
 * Événements écoutés :
 * - `work:created` (après upload, pour MAJ galerie/filtre courant)
 * - `work:deleted` (après suppression, pour MAJ galerie/filtre courant)
 */
import {
  getWorks
} from "./scripts/api.js";

import {
  displayWorks,
  displayFilters,
  displayGalleryError,
  domModificationLogIn,
  addAdminBanner,
  addEditLink,
  displayModal,
  exitModal,
  displayModalGallery,
  mountModalNavigation,
  mountImageField,
  mountTitleField,
  enableCategoryValidation,
  enableUploadFormValidation,
  handleUploadSubmit
} from "./scripts/dom.js";

import {
  getCategoryNameFromQueryParam,
  getUniqueCategories,
  isLogIn,
  logOut,
  slugify,
  UI_ERROR_MSG
} from "./scripts/utils.js";


/**
 * Ré-affiche la galerie selon le slug courant dans l’URL.
 * @param {Work[]} works
 */
function renderByCurrentFilter(works) {
  const slug = getCategoryNameFromQueryParam();
  const list = slug && slug !== "all"
    ? works.filter(w => slugify(w.category?.name || "") === slug)
    : works;
  displayWorks(list);
}


/**
 * Initialise l’application :
 * 1) Vérifie l’authentification et applique l’UI admin si nécessaire
 * 2) Récupère les projets via l’API (`getWorks`)
 * 3) Monte la modale + validations si connecté
 * 4) Affiche la galerie + les filtres, puis applique le filtre issu de l’URL (`?category=...`)
 *
 * Gestion d’erreur :
 * - Log technique en console (pour les devs)
 * - Message utilisateur dans la section portfolio via `displayGalleryError`
 *
 * @async
 * @function init
 * @returns {Promise<void>} Résout une fois l’UI prête.
 *
 * @example
 * // Chargement automatique au démarrage de la page
 * (async function init() {})();
 */
(async function init() {
  try {
    const isAuth = isLogIn();

    const fetched = await getWorks();
    /** @type {Work[]} */
    const works = Array.isArray(fetched) ? fetched : [];
    
    if (isAuth) {
      addAdminBanner();
      addEditLink();
      logOut(isAuth);
      domModificationLogIn(isAuth);

      //modal
      displayModal();
      exitModal();
      displayModalGallery(works);
      mountModalNavigation();
      mountImageField();
      mountTitleField();
      enableCategoryValidation();
      enableUploadFormValidation();
      handleUploadSubmit();
    }

    /** @type {Category[]} */
    const uniqueCategories = getUniqueCategories(works);
    displayFilters(uniqueCategories, works);

    /**
     * @event document#work:created
     * @type {CustomEvent<Work>}
     * @property {Work} detail - Nouveau projet créé
     * @listens document#work:created
     */
    document.addEventListener("work:created", (e) => {
      if (!e?.detail) return;
      const newWork = e.detail;   
      works.push(newWork);
      
      renderByCurrentFilter(works)
    });

    /**
     * @event document#work:deleted
     * @type {CustomEvent<{id:number}>}
     * @property {number} detail.id - Identifiant du projet supprimé
     * @listens document#work:deleted
     */
    document.addEventListener("work:deleted", (e) => {
      const deletedId = Number(e.detail?.id);   
      const idx = works.findIndex(w => Number(w.id) === deletedId);
      if (idx !== -1) works.splice(idx, 1);

      renderByCurrentFilter(works)
    });

    window.addEventListener("popstate", () => {
      renderByCurrentFilter(works);
    });

  } catch (error) {
    displayGalleryError();
  }
})();