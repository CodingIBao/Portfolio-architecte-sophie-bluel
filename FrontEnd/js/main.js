/**
 * Point d'entrée principal de l'application.
 *
 * Initialise l’interface utilisateur en exécutant les étapes suivantes :
 * - Vérification de l’état de connexion de l’utilisateur
 * - Affichage conditionnel de la bannière admin et du lien "Modifier"
 * - Activation de la logique de déconnexion (logout)
 * - Mise en place de l’ouverture et de la fermeture de la modale
 * - Récupération des projets depuis l'API
 * - Extraction des catégories uniques
 * - Affichage des filtres et de la galerie (avec possibilité de filtrage)
 *
 * Ce module exécute une IIFE asynchrone (fonction immédiatement invoquée)
 * pour lancer automatiquement l'application dès le chargement du script.
 *
 * @module main
 */

import { fetchData } from "./scripts/api.js";
import { displayWorks, displayFilters, displayError, domModificationLogIn, addAdminBanner, addEditLink, displayModal, exitModal } from "./scripts/dom.js";
import { getCategoryNameFromQueryParam, getUniqueCategories, isLogIn, logOut, slugify } from "./scripts/utils.js";

(async function init() {
  try {
    const isAuth = isLogIn();
    
    if (isAuth) {
      addAdminBanner();
      addEditLink();
      logOut(isAuth);
      domModificationLogIn(isAuth);
      displayModal();
      exitModal();
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