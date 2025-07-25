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


/**
 * Modifie dynamiquement le texte du lien de connexion en "logout"
 * si l'utilisateur est connecté.
 *
 * @param {boolean} isAuth - Indique si l'utilisateur est connecté.
 * @private
 */
function replaceLogInLink(isAuth) {
  if (!isAuth) return; 
  document.getElementById("link-login").textContent = "logout";
}


/**
 * Applique les modifications DOM liées à l’état de connexion.
 *
 * @param {boolean} isAuth - Indique si l'utilisateur est connecté.
 */
export function domModificationLogIn(isAuth) {
  replaceLogInLink(isAuth);
}


/**
 * Injecte dynamiquement une bannière d'administration en haut de la page.
 *
 * La bannière est uniquement visible pour les utilisateurs connectés (via `isLogIn()`).
 * Elle contient une icône Font Awesome et un texte "Mode édition",
 * centrés horizontalement et visuellement séparés du contenu de la page.
 *
 * Cette fonction est appelée depuis `main.js` après vérification du token
 * pour éviter toute trace visible dans le HTML en cas de déconnexion.
 *
 * @function addAdminBanner
 *
 * @example
 * if (isLogIn()) {
 *   addAdminBanner();
 * }
 */
export function addAdminBanner() {
  const banner = document.createElement("div");
  banner.classList.add("admin-banner");
  
  const iconLink = document.createElement("a");
  iconLink.classList.add("icon-link", "edit-link");
  iconLink.href = "#";
  
  const icon = document.createElement("i");
  icon.classList.add("fa-regular", "fa-pen-to-square");

  const textLink = document.createElement("a");
  textLink.classList.add("text-link", "edit-link");
  textLink.href = "#";

  const text = document.createElement("span");
  text.textContent = "Mode édition";

  iconLink.appendChild(icon);
  textLink.appendChild(text);
  banner.append(iconLink,textLink);
  
  document.body.prepend(banner);

  textLink.addEventListener("mouseenter", ()=> {
    icon.classList.add("banner-hover-sync");
    text.classList.add("banner-hover-sync");
  });
  textLink.addEventListener("mouseleave", ()=> {
    icon.classList.remove("banner-hover-sync");
    text.classList.remove("banner-hover-sync");
  });

  iconLink.addEventListener("mouseenter", ()=> {
    text.classList.add("banner-hover-sync");
    icon.classList.add("banner-hover-sync");
  });
  iconLink.addEventListener("mouseleave", ()=> {
    text.classList.remove("banner-hover-sync");
    icon.classList.remove("banner-hover-sync");
  });
}


/**
 * Ajoute dynamiquement un lien "Modifier" (icône + texte) à côté du titre "Mes Projets".
 *
 * Ce lien est uniquement visible pour les utilisateurs connectés.
 * Il déclenche l'ouverture de la modale au clic et applique un effet visuel synchronisé au survol.
 *
 * @function addEditLink
 *
 * @example
 * if (isLogIn()) {
 *   addEditLink();
 * }
 */
export function addEditLink() {
  const h2 = document.querySelector("#portfolio h2");

  const wrapper = document.createElement("div");
  wrapper.classList.add("portfolio-title-wrapper");

  const linkContainer = document.createElement("div");
  linkContainer.classList.add("link-container");
  
  const iconLink = document.createElement("a");
  iconLink.classList.add("icon-link", "edit-link");
  iconLink.href = "#";

  const icon = document.createElement("i");
  icon.classList.add("fa-regular", "fa-pen-to-square");
  
  const textLink = document.createElement("a");
  textLink.classList.add("text-link", "edit-link");
  textLink.href = "#";

  const text = document.createElement("span");
  text.textContent = "Modifier";
  
  h2.replaceWith(wrapper);
  
  iconLink.appendChild(icon);
  textLink.appendChild(text);
  linkContainer.append(iconLink, textLink);
  wrapper.append(h2,linkContainer);

  textLink.addEventListener("mouseenter", ()=> {
    icon.classList.add("portfolio-hover-sync");
    text.classList.add("portfolio-hover-sync");
  });
  textLink.addEventListener("mouseleave", ()=> {
    icon.classList.remove("portfolio-hover-sync");
    text.classList.remove("portfolio-hover-sync");
  });

  iconLink.addEventListener("mouseenter", ()=> {
    text.classList.add("portfolio-hover-sync");
    icon.classList.add("portfolio-hover-sync");
  });
  iconLink.addEventListener("mouseleave", ()=> {
    text.classList.remove("portfolio-hover-sync");
    icon.classList.remove("portfolio-hover-sync");
  });
}


/**
 * Attache un gestionnaire d'événement à tous les éléments ayant la classe `.edit-link`
 * afin d'afficher la modale lors d'un clic.
 *
 * @function displayModal
 *
 * @example
 * displayModal(); // Active l'ouverture de la modale via les liens "Modifier"
 */
export function displayModal() {
  const editLinks = document.querySelectorAll(".edit-link");

  editLinks.forEach(link => {
    link.addEventListener("click", () => {
      const modal = document.querySelector(".modal");
      modal.style.display = "block";
    });
  });
}


/**
 * Gère la fermeture de la modale de différentes manières :
 * - Clic sur l’icône de fermeture
 * - Clic à l’extérieur du contenu de la modale (fond noir)
 * - Appui sur la touche Échap
 *
 * @function exitModal
 *
 * @example
 * exitModal(); // Active tous les moyens de fermer la modale
 */
export function exitModal() {
  const modalIconClose = document.querySelector(".modal-icon-close");
  const modalContainer = document.querySelector(".modal-container");
  const modal = document.querySelector(".modal");

  modalIconClose.addEventListener("click", ()=> {
    modal.style.display = "none";
  });

  modalContainer.addEventListener("click", (event)=> {
    if (event.target === modalContainer) {
      modal.style.display = "none";
    }
  });

  document.addEventListener("keydown", (event)=> {
    if (event.key === "Escape" && modal.style.display === "block") {
      modal.style.display = "none";
    }
  });
}