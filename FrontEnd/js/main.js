/**
 * Point d'entrée principal de l'application.
 *
 * Initialise l’interface utilisateur en exécutant les étapes suivantes :
 * - Vérification de l’état de connexion de l’utilisateur
 * - Affichage conditionnel de la bannière admin et du lien "Modifier"
 * - Activation de la logique de déconnexion (logout)
 * - Mise en place de l’ouverture et de la fermeture de la modale
 * - Affichage de la galerie modale avec possibilité de suppression
 * - Activation du passage à l’étape d’ajout de projet dans la modale
 * - Récupération des projets depuis l'API
 * - Extraction des catégories uniques
 * - Affichage des filtres et de la galerie principale (avec possibilité de filtrage)
 *
 * Ce module exécute une IIFE asynchrone (fonction immédiatement invoquée)
 * pour lancer automatiquement l'application dès le chargement du script.
 *
 * @module main
 */
import { fetchData } from "./scripts/api.js";
import { displayWorks, displayFilters, displayError, domModificationLogIn, addAdminBanner, addEditLink, displayModal, exitModal, displayModalGallery, displayModalAddPhoto } from "./scripts/dom.js";
import { getCategoryNameFromQueryParam, getUniqueCategories, isLogIn, logOut, slugify } from "./scripts/utils.js";

(async function init() {
  try {
    const isAuth = isLogIn();
    const works = await fetchData("http://localhost:5678/api/works");
    
    if (isAuth) {
      addAdminBanner();
      addEditLink();
      logOut(isAuth);
      domModificationLogIn(isAuth);
      displayModal();
      exitModal();
      displayModalGallery(works);
      displayModalAddPhoto()
    }

    const categorySlug = getCategoryNameFromQueryParam();
    const filteredWorks = categorySlug
      ? works.filter(work => slugify(work.category.name) === categorySlug)
      : works;

    const uniqueCategories = getUniqueCategories(works);
    displayFilters(uniqueCategories, works);
    displayWorks(filteredWorks);
  } catch (error) {
    displayError("Impossible de charger les projets. Veuillez réessayer plus tard.");
    console.error("[main.js]", error.message);
  }
})();