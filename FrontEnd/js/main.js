/**
 * Point d'entrée principal de l'application.
 *
 * Initialise l’interface utilisateur en exécutant les étapes suivantes :
 * - Récupération des projets depuis l'API
 * - Extraction des catégories uniques
 * - Affichage des boutons de filtres par catégorie
 * - Affichage de la galerie de projets (filtrée ou complète)
 *
 * Ce module exécute une IIFE asynchrone (fonction immédiatement invoquée)
 * pour lancer automatiquement l'application dès le chargement du script.
 *
 * @module main
 */

import { fetchData } from "./scripts/api.js";
import { displayWorks, displayFilters, displayError, domModificationLogIn, addAdminBanner } from "./scripts/dom.js";
import { getCategoryNameFromQueryParam, getUniqueCategories, isLogIn, logOut, slugify } from "./scripts/utils.js";

(async function init() {
  try {
    const isAuth = isLogIn();
    
    if (isAuth) {
      addAdminBanner();
      logOut(isAuth);
      domModificationLogIn(isAuth);
    }

    const works = await fetchData("http://localhost:5678/api/works");

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