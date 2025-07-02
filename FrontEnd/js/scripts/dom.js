import { slugify } from "./utils.js";

/**
 * Module de manipulation du DOM pour l'affichage des projets.
 *
 * Contient des fonctions utilitaires pour créer des éléments HTML
 * et mettre à jour dynamiquement la galerie d'images.
 *
 * @module dom
 */


const gallery = document.querySelector(".gallery");

/**
 * Définit le bouton de filtre actif en mettant à jour la classe CSS "active".
 *
 * Supprime la classe "active" et l’attribut `aria-pressed="true"` de tous les boutons,
 * puis les applique uniquement au bouton sélectionné.
 *
 * Utile pour gérer l’accessibilité dans une interface avec des boutons de filtre à sélection unique.
 *
 * @param {HTMLButtonElement} activeButton - Le bouton à activer.
 * @param {HTMLElement} container - Le conteneur qui regroupe tous les boutons de filtre.
 * @private
 */
function setActiveFilter(activeButton, container) {
  const buttons = container.querySelectorAll("button");
  buttons.forEach(btn => {
    btn.classList.remove("active");
    btn.setAttribute("aria-pressed", "false");
  });
  activeButton.classList.add("active");
  activeButton.setAttribute("aria-pressed", "true");
}


/**
 * Affiche les boutons de filtre à partir d’une liste de catégories.
 *
 * Lorsqu’un filtre est cliqué, la galerie est mise à jour avec les projets
 * correspondant à la catégorie sélectionnée. L’URL est également
 * mise à jour avec `?category=nom`, pour permettre le partage ou la reprise
 * de l’état de filtrage.
 *
 * @param {Object[]} categories - Liste des catégories (ex. : { id, name }).
 * @param {Object[]} works - Liste complète des projets à filtrer.
 *
 * @example
 * displayFilters(
 *   [{ id: 1, name: "Objets" }, { id: 2, name: "Appartements" }],
 *   works
 * );
 */
export function displayFilters(categories, works) {
  const filtersContainer = document.getElementById("filters")

  const updateURL = (categorySlug) => {
    const url = new URL(window.location);
    url.searchParams.set("category", categorySlug);
    window.history.pushState({}, "", url);
  };

  const allButton = createElement("button", {
    "data-category-slug": "all"
  }, "Tous");
  filtersContainer.appendChild(allButton);

  allButton.addEventListener("click", () => {
    setActiveFilter(allButton, filtersContainer);
    updateURL("all");
    displayWorks(works);
  });
  
  categories.forEach(category => {
    const slug = slugify(category.name);
    const button = createElement("button", {
      "data-category-slug": slug
    }, category.name);
    filtersContainer.appendChild(button);

    button.addEventListener("click", () => {
      const filteredWorks = works.filter(work =>
        slugify(work.category.name) === slug
      );
      setActiveFilter(button, filtersContainer);
      updateURL(slug);
      displayWorks(filteredWorks);
    });
  });

  const selectedSlug = new URLSearchParams(window.location.search).get("category");
  const buttons = filtersContainer.querySelectorAll("button");
  const activeButton = Array.from(buttons).find(btn =>
    btn.dataset.categorySlug === (selectedSlug || "all")
  );

  if (activeButton) {
    activeButton.click();
  } else {
    allButton.click();
  }
}


/**
 * Crée dynamiquement un élément HTML avec des attributs et du texte optionnels.
 *
 * @param {string} tag - Le nom de la balise HTML (ex. : "div", "img", "figcaption").
 * @param {Object} [attributes={}] - Objet contenant les paires attribut/valeur à appliquer.
 * @param {string} [textContent=""] - Texte à insérer dans l’élément (facultatif).
 * @returns {HTMLElement} L’élément HTML créé.
 *
 * @example
 * const btn = createElement("button", { class: "active" }, "Tous");
 */
export function createElement(tag, attributes = {}, textContent ="") {

  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}


/**
 * Affiche une liste de projets dans la galerie.
 *
 * Chaque projet est affiché sous forme de balise `<figure>` contenant
 * une image et une légende (`<figcaption>`).
 *
 * @function displayWorks
 * @param {Object[]} works - Liste des projets à afficher.
 * @param {string} works[].imageUrl - URL de l’image du projet.
 * @param {string} works[].title - Titre du projet.
 *
 * @example
 * displayWorks([
 *   { imageUrl: "img/chaise.png", title: "Chaise" },
 *   { imageUrl: "img/table.png", title: "Table" }
 * ]);
 */
export function displayWorks(works) {
  gallery.innerHTML = "";

  works.forEach(work => {
    const img = createElement("img", { src: work.imageUrl, alt: work.title});
    const caption = createElement("figcaption", {}, work.title);
    const figure = createElement("figure");

    figure.appendChild(img);
    figure.appendChild(caption);
    gallery.appendChild(figure);
  });
}


/**
 * Affiche un message d’erreur dans la galerie.
 *
 * Crée un paragraphe avec le message fourni et l’insère dans la galerie.
 * Utilise la fonction utilitaire `createElement`.
 *
 * @function displayError
 * @param {string} message - Le message d’erreur à afficher.
 *
 * @example
 * displayError("Impossible de charger les projets.");
 */
export function displayError(message) {
  gallery.innerHTML = "";
  const errorElement = createElement("p", {class: "error-message"}, message);
  gallery.appendChild(errorElement);
}