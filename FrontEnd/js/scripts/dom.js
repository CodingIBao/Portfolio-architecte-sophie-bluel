// ./js/scripts/dom.js

import { 
  createElement, 
  slugify, 
  validateImageFile, 
  cleanFileName, 
  UI_ERROR_MESSAGES 
} from "./utils.js";

import { 
  getCategories, 
  deleteWork, 
  createWork 
} from "./api.js";


/**
 * @module dom
 * Utilitaires DOM pour l’UI (galerie, modale, erreurs, accessibilité).
 * Dépend des helpers API (`getCategories`, `deleteWork`, `createWork`) et de `slugify`.
 */


/** =========================
 *  Types JSDoc (pour l’IDE)
 *  ========================= */
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
 * @property {{ id?: number|string, name?: string } | null} [category]
 * @property {number|string} [categoryId]
 */
/**
 * @typedef {Object} CreateFigureOptions
 * @property {boolean} [withDelete=false]
 */


/** =========================
 *  Sélecteurs & constantes
 *  ========================= */

const gallery = document.querySelector(".gallery");


const focusableSelectors = `
  a[href], 
  button:not([disabled]), 
  textarea, 
  input[type="text"], 
  input[type="email"], 
  input[type="file"], 
  select,
  [tabindex]:not([tabindex="-1"])
`;


/** IDs d’erreurs */
const ERROR_IDS = {
  upload: "error-add-project",
  del: "error-delete-project",
  image: "error-message-image",
  title: "error-message-title",
  category: "error-message-category",
  gallery: "error-display-gallery",
};


/** Cibles d’affichage des erreurs */
const ERROR_TARGETS = {
  generic: "#portfolio",
  upload: "#step-two",
  delete: ".modal-gallery-container",
  categories: ".select-wrapper",
  gallery: "#portfolio",
};


/** =========================
 *  Bloc: Helpers / Erreurs
 *  ========================= */

/**
 * Affiche un message d’erreur accessible selon le contexte UI.
 * @param {"generic"|"upload"|"delete"|"categories"|"gallery"} context
 * @param {string} [id] - id du <p> d’erreur (défaut: "error-<context>")
 */
function showUiError(context = "generic", id) {
  const target = ERROR_TARGETS[context] || ERROR_TARGETS.generic;
  const pid = id || `error-${context}`;
  const msg = UI_ERROR_MESSAGES[context] || UI_ERROR_MESSAGES.generic;
  renderErrorMessage(target, pid, msg);
}


/**
 * Supprime un ou plusieurs messages d’erreur par id.
 * @param {...string|string[]} ids - Un ou plusieurs ids (ou un tableau d’ids).
 */
function clearErrorMessage(...ids) {
  const flat = ids.flat();
  flat.forEach((id) => document.getElementById(String(id))?.remove());
}


/**
 * Crée (ou remplace) un message d’erreur accessible dans un conteneur.
 * @param {HTMLElement|string} container
 * @param {string} id
 * @param {string} message
 * @param {string} [className="error-message"]
 * @param {"off"|"polite"|"assertive"} [ariaLive="polite"]
 * @returns {HTMLParagraphElement|undefined}
 */
export function renderErrorMessage(container, id, message, className = "error-message", ariaLive = "polite" ) {
  const parent = typeof container === "string" ? document.querySelector(container) : container;
  if (!parent) return;

  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const errorElement = document.createElement("p");
  errorElement.id = id;
  errorElement.classList.add(className);
  errorElement.textContent = message;
  errorElement.setAttribute("role", "alert");
  errorElement.setAttribute("aria-live", ariaLive);

  parent.appendChild(errorElement);
  return errorElement;
}


/** Affiche une erreur globale à la place de la galerie principale. */
export function renderGalleryError() {
  gallery.innerHTML = "";
  showUiError("gallery", ERROR_IDS.gallery);
}


/** =========================
 *  Bloc: Admin UI (header)
 *  ========================= */

/** Met à jour le lien login/logout dans le header.
 * @param {boolean} isAuth - Utilisateur connecté ?
 * @returns {void}
 */
export function domModificationLogIn(isAuth) {
  const link = document.getElementById("link-login");
  if (!link) return;

  if (isAuth) {
    link.textContent = "logout";
    link.setAttribute("aria-label", "Se déconnecter");
    
  } else {
    link.textContent = "login";
    link.setAttribute("aria-label", "Se connecter");
    link.href = "./login.html";
  }
}


/** Ajoute la bannière admin en haut de page (si absente).
 * @returns {void}
 */
export function addAdminBanner() {
  if (document.querySelector(".admin-banner")) return;

  const banner = createElement("div", { class: "admin-banner" });

  const icon = createElement("i", { class: "fa-regular fa-pen-to-square" });
  const iconLink = createElement("a", { href: "#", class: "icon-link edit-link" });
  iconLink.appendChild(icon);

  const text = createElement("span", {}, "Mode édition");
  const textLink = createElement("a", { href: "#", class: "text-link edit-link" });
  textLink.appendChild(text);

  banner.append(iconLink, textLink);
  document.body.prepend(banner);

  const toggleHover = (add) => {
    icon.classList[add ? "add" : "remove"]("banner-hover-sync");
    text.classList[add ? "add" : "remove"]("banner-hover-sync");
  };

  textLink.addEventListener("mouseenter", () => toggleHover(true));
  iconLink.addEventListener("mouseenter", () => toggleHover(true));

  textLink.addEventListener("mouseleave", () => toggleHover(false));
  iconLink.addEventListener("mouseleave", () => toggleHover(false));
}


/** Ajoute le lien “Modifier” à côté du titre portfolio (si absent).
 * @returns {void}
 */
export function addEditLink() {
  if (document.querySelector(".portfolio-title-wrapper")) return;

  const h2 = document.querySelector("#portfolio h2");
  if (!h2) return;

  const wrapper = createElement("div", { class: "portfolio-title-wrapper" });
  const linkContainer = createElement("div", { class: "link-container" });

  const icon = createElement("i", { class: "fa-regular fa-pen-to-square" });
  const iconLink = createElement("a", { href: "#", class: "icon-link edit-link" });
  iconLink.appendChild(icon);

  const text = createElement("span", {}, "Modifier");
  const textLink = createElement("a", { href: "#", class: "text-link edit-link" });
  textLink.appendChild(text);

  linkContainer.append(iconLink, textLink);
  h2.replaceWith(wrapper);
  wrapper.append(h2, linkContainer);

  const toggleHover = (add) => {
    icon.classList[add ? "add" : "remove"]("portfolio-hover-sync");
    text.classList[add ? "add" : "remove"]("portfolio-hover-sync");
  };

  textLink.addEventListener("mouseenter", () => toggleHover(true));
  iconLink.addEventListener("mouseenter", () => toggleHover(true));
  
  textLink.addEventListener("mouseleave", () => toggleHover(false));
  iconLink.addEventListener("mouseleave", () => toggleHover(false));
}


/** =========================
 *  Bloc: Filtres catégories
 *  ========================= */

/**
 * Met à jour l’état visuel et ARIA du filtre actif.
 * @param {HTMLButtonElement} activeButton - Le bouton à activer
 * @param {HTMLElement} container - Le conteneur qui contient tous les boutons de filtres
 * @returns {void}
 */
function setActiveFilter(activeButton, container) {
  if (!activeButton || !container) return;

  const previous = container.querySelector("button.active");
  
  if (previous && previous !== activeButton) {
    previous.classList.remove("active");
    previous.setAttribute("aria-pressed", "false");
  };

  activeButton.classList.add("active");
  activeButton.setAttribute("aria-pressed", "true");
}


/** Affiche les filtres catégorie et synchronise l’URL.
 * @param {Category[]} categories
 * @param {Work[]} works
 * @returns {void}
 */
export function displayFilters(categories, works) {
  const filtersContainer = document.getElementById("filters");
  if(!filtersContainer) return;

  filtersContainer.setAttribute("role", "group");
  filtersContainer.setAttribute("aria-label", "Filtres des catégories");
  filtersContainer.innerHTML = "";

  const catById = new Map(categories.map(c => [String(c.id), c.name]));

  const getWorkCategorySlug = (work) => {
    if (work?.category?.name) return slugify(work.category.name);

    if (work?.category?.id != null) {
      const name = catById.get(String(work.category.id)) || "";
      return name ? slugify(name) : null;
    }
    if (work?.categoryId != null) {
      const name = catById.get(String(work.categoryId)) || "";
      return name ? slugify(name) : null;
    }
    return null;
  }

  const updateURL = (categorySlug) => {
    const url = new URL(window.location);
    if (!categorySlug || categorySlug === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", categorySlug);
    }
    window.history.pushState({}, "", url);
  };

  const allButton = createElement("button", {
    "type": "button",
    "data-category-slug": "all"
  }, "Tous");
  filtersContainer.appendChild(allButton);

  allButton.addEventListener("click", () => {
    setActiveFilter(allButton, filtersContainer);
    updateURL(null);
    displayWorks(works);
  });
  
  categories.forEach(category => {
    const slug = slugify(category.name);
    const button = createElement("button", {
      "type": "button",
      "data-category-slug": slug
    }, category.name);
    filtersContainer.appendChild(button);

    button.addEventListener("click", () => {
      const filteredWorks = works.filter(w =>
        getWorkCategorySlug(w) === slug);
        setActiveFilter(button, filtersContainer);
        updateURL(slug);
        displayWorks(filteredWorks);
      });
    });

  const raw = new URLSearchParams(window.location.search).get("category");
  const selectedSlug = raw ? raw.toLowerCase() : null;
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


/** =========================
 *  Bloc: Galerie principale
 *  ========================= */

/**
 * Crée un élément <figure> représentant un projet (work) pour la galerie.
 *
 * - Contient toujours une <img> avec src/alt basés sur le work
 * - Si `withDelete` est vrai :
 *   → Ajoute un bouton "supprimer" (accessible avec aria-label) + icône corbeille
 *   → Le bouton contient data-id pour identifier le work
 * - Sinon :
 *   → Ajoute un <figcaption> avec le titre du projet
 *
 * @param {Work} work - Objet projet (id, title, imageUrl, category…)
 * @param {{ withDelete?: boolean }} [options={}] - Options, `withDelete` pour ajouter le bouton supprimer
 * @returns {HTMLFigureElement} La figure DOM prête à être insérée dans la galerie
 */
function createWorkFigure(work, {withDelete = false} = {}) {
  const figure = document.createElement("figure");
  figure.setAttribute("data-id", String(work.id));

  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;

  figure.append(img);

  if (withDelete) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "delete-btn";
    btn.dataset.id = String(work.id);
    btn.setAttribute("aria-label", `Supprimer « ${work.title || "ce projet"} »`);

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-trash-can";
    icon.setAttribute("aria-hidden", "true");

    btn.appendChild(icon);
    figure.prepend(btn);

  } else {
    figure.appendChild(createElement("figcaption", {}, work.title));
  }

  return figure;
}


/** Affiche la galerie principale.
 * @param {Work[]} works
 * @returns {void}
 */
export function displayWorks(works) {
  gallery.innerHTML = "";
  works.forEach(work => gallery.appendChild(createWorkFigure(work)));
}


/** =========================
 *  Bloc: Modale – Focus trap
 *  ========================= */

let currentTrapTarget = null;

/** Active le focus trap dans la modale (sur l’étape actuellement visible).
 * @returns {void}
 */
export function trapFocusInModal() {
  const modal = document.querySelector(".modal");
  if (!modal) return;

  currentTrapTarget = [...modal.querySelectorAll(".modal-content")]
    .find(step => getComputedStyle(step).display !== "none");

  if (!currentTrapTarget) return;

  modal.removeEventListener("keydown", handleTrap);
  modal.addEventListener("keydown", handleTrap);
}


/**
 * Gestionnaire clavier du focus trap dans la modale.
 *
 * - Bloque Tab/Shift+Tab pour garder le focus dans les éléments focusables
 * - Empêche le focus de sortir de l’étape visible de la modale
 *
 * @param {KeyboardEvent} e - Événement clavier
 * @returns {void}
 */
function handleTrap(e) {
  if (!currentTrapTarget || e.key !== "Tab") return;

  const focusableElements = currentTrapTarget.querySelectorAll(focusableSelectors);
  if (!focusableElements.length) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault();
    lastElement.focus();

  } else if (!e.shiftKey && document.activeElement === lastElement) {
    e.preventDefault();
    firstElement.focus();
  }
}


/** =========================
 *  Bloc: Modale – Shell (ouvrir/fermer)
 *  ========================= */

/** Monte l’ouverture de la modale sur les liens .edit-link.
 * @returns {void}
 */
export function displayModal() {
  const editLinks = document.querySelectorAll(".edit-link");
  if (!editLinks.length) return;

  const onOpen = (e) => {
    e.preventDefault();
    const modal = document.querySelector(".modal");
    const stepOne = document.getElementById("step-one");
    if (!modal || !stepOne) return;

    modal.style.display = "block";
    stepOne.style.display = "flex";

    const focusables = stepOne.querySelectorAll(focusableSelectors);
    if (focusables.length) focusables[0].focus();
    trapFocusInModal();
  };

  editLinks.forEach(link => {
    link.addEventListener("click", onOpen);
  });
}


/** Monte la navigation entre step-one et step-two (Ajouter photo).
 * @returns {void}
 */
export function mountModalNavigation() {
  const stepOne = document.getElementById("step-one");
  const stepTwo = document.getElementById("step-two");
  const btnNext = document.querySelector(".btn-add-gallery");
  const btnBack = document.querySelector(".modal-icon-back");
  if (!stepOne || !stepTwo) return;

  if (btnNext) {
    btnNext.addEventListener("click", async () => {
      stepOne.style.display = "none";
      stepTwo.style.display = "flex";
      await loadCategoryOptions();
      clearErrorMessage(ERROR_IDS.upload);
      const f = stepTwo.querySelectorAll(focusableSelectors); if (f.length) f[0].focus();
      trapFocusInModal();
    });
  }

  if (btnBack) {
    btnBack.addEventListener("click", () => {
      stepTwo.style.display = "none";
      stepOne.style.display = "flex";
      clearErrorMessage(
        ERROR_IDS.upload, 
        ERROR_IDS.image, 
        ERROR_IDS.title, 
        ERROR_IDS.category);
      const f = stepOne.querySelectorAll(focusableSelectors); if (f.length) f[0].focus();
      trapFocusInModal();
    });
  }
}


/** Monte les moyens de fermer la modale (croix, overlay, Escape) et reset si besoin.
 * @returns {void}
 */
export function exitModal() {
  const closeIcons = document.querySelectorAll(".modal-icon-close");
  const modalContainer = document.querySelector(".modal-container");
  const modal = document.querySelector(".modal");
  const modalContentStepOne = document.getElementById("step-one");
  const modalContentStepTwo = document.getElementById("step-two");

  const closeModal = () => {
  const stepTwoWasOpen = getComputedStyle(modalContentStepTwo).display !== "none";

    modal.style.display = "none";
    modalContentStepOne.style.display = "none";
    modalContentStepTwo.style.display = "none";
    
    if (stepTwoWasOpen) {
      resetImageField();
      resetTitleField();
      resetCategoryField();
      clearErrorMessage(
        ERROR_IDS.upload,
        ERROR_IDS.del,
        ERROR_IDS.image,
        ERROR_IDS.title,
        ERROR_IDS.category,
        ERROR_IDS.gallery
      );
    }
  }

  closeIcons.forEach(icon => {
    icon.addEventListener("click", closeModal);
  });

  modalContainer.addEventListener("click", (e)=> {
    if (e.target === modalContainer) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e)=> {
    if (e.key === "Escape" && modal.style.display === "block") {
      closeModal();
    }
  });
}


/** =========================
 *  Bloc: Modale – Galerie interne (step-one)
 *  ========================= */

/** Affiche la galerie interne de la modale (step-one) avec boutons “supprimer”.
 * @returns {void}
 */
export function displayModalGallery(works) {
  const content = document.querySelector(".modal-gallery-content");

  if (!content) return;
  content.innerHTML = "";

  works.forEach(w => content.appendChild(createWorkFigure(w, { withDelete: true })));
  
  setupModalDeleteDelegation();
}


/**
 * Active la suppression déléguée des projets dans la galerie modale.
 *
 * - Capte les clics sur `.delete-btn` (event delegation).
 * - Désactive le bouton + aria-busy pendant l’opération.
 * - Supprime le projet côté modale et galerie principale si succès.
 * - Émet l’événement `work:deleted` pour MAJ l’état global.
 * - Affiche une erreur si l’API échoue.
 *
 * @fires document#work:deleted
 * @returns {void}
 */
function setupModalDeleteDelegation() {
  const modalGallery = document.querySelector(".modal-gallery-content");
  if (!modalGallery) return;

  modalGallery.addEventListener("click", async (e)=> {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;
    
    const figure = btn.closest("figure");
    const workIdStr = btn.dataset.id;
    const workId = Number(workIdStr);
    const token = localStorage.getItem("token");

    const galleryFigure = document.querySelector(`.gallery figure[data-id="${workIdStr}"]`);

    btn.disabled= true;
    figure?.setAttribute("aria-busy", "true");

    const finish = () => {
      btn.disabled = false;
      figure?.removeAttribute("aria-busy");
    };

    try {
      await deleteWork(workIdStr, token);
      clearErrorMessage(ERROR_IDS.del);

      figure?.remove();
      galleryFigure?.remove();

      document.dispatchEvent(
        new CustomEvent("work:deleted", { detail: { id: workId } })
      );

    } catch {
      showUiError("delete", ERROR_IDS.del);
    } finally {
      finish();
    }
  });
}


/** =========================
 *  Bloc: Modale – Upload (step-two)
 *  ========================= */

/** ---- Prévisualisation & reset image ---- */

/**
 * Libère l’URL de prévisualisation associée à un <input type="file">.
 *
 * @param {HTMLInputElement} input - L’input file qui possède potentiellement une URL de preview
 * @returns {void}
 */
function revokePreviewURL(input) {
  const url = input?.dataset?.previewURL;
  if (url) {
    URL.revokeObjectURL(url);
    input.dataset.previewURL = "";
  }
}

/**
 * Rend une image de prévisualisation interactive comme un bouton :
 * @param {HTMLInputElement} fileInput - L’<input type="file"> associé
 * @param {HTMLImageElement} imageElement - L’image de prévisualisation à rendre interactive
 * @returns {void}
 */
function makePreviewImageClickable(fileInput, imageElement) {
  imageElement.addEventListener("click", () => fileInput.click())

  imageElement.tabIndex = 0;

  imageElement.setAttribute("role", "button");
  imageElement.setAttribute("aria-label", "Changer l'image sélectionnée");

  imageElement.addEventListener("keydown", (e) => {
    if (e.key ==="Enter") {
      e.preventDefault();
      fileInput.click();
    }
  });
}


/**
 * Réinitialise le champ image du formulaire d’upload.
 * @returns {void}
 */
function resetImageField() {
  const container = document.getElementById("form-group-header");
  const fileInput = document.getElementById("image");

  if (!container || !fileInput) return;

  revokePreviewURL(fileInput);
  fileInput.value = "";

  container.innerHTML = "";

  const icon = document.createElement("i");
  icon.className = "fa-regular fa-image icon-placeholder";

  const label = document.createElement("label");
  label.htmlFor = "image";
  label.className = "upload-label";
  label.tabIndex = 0;
  label.innerHTML = `<span class="upload-text">+ ajouter photo</span>`;

  label.appendChild(fileInput);

  const info = document.createElement("span");
  info.className = "upload-info";
  info.textContent = "jpg, png 4mo max";

  label.addEventListener("keydown", (e) => {
    if (e.key === "Enter") fileInput.click();
  });

  container.append(icon, label, info);
  
  clearErrorMessage(ERROR_IDS.image);
}


/**
 * Crée/replace la prévisualisation d’image dans le container.
 * @returns {void}
 */
function renderImagePreview(fileInput, container, file) {
  revokePreviewURL(fileInput);

  const url = URL.createObjectURL(file);
  fileInput.dataset.previewURL = url;

  const img = document.createElement("img");
  img.src = url;
  img.alt = `Prévisualisation de l'image ${cleanFileName(file.name)}`;
  img.classList.add("preview-image");

  makePreviewImageClickable(fileInput, img);

  container.innerHTML = "";
  container.append(fileInput, img);

  img.focus();
}


/**
 * Monte la logique du champ image de l’upload (step-two).
 * @returns {void}
 */
export function setupImageField() {
  const fileInput = document.getElementById("image");
  const container = document.getElementById("form-group-header");
  const label = document.querySelector(".upload-label");

  if (!fileInput || !container || !label) return;

  label.addEventListener("keydown", (e) => {
    if (e.key === "Enter") fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    if (!fileInput.files || fileInput.files.length === 0) return;

    clearErrorMessage(ERROR_IDS.image);
    const file = fileInput.files[0];

    const v = validateImageFile(file);
    if (!v.ok) {
      revokePreviewURL(fileInput);
      fileInput.value = "";
      resetImageField();
      renderErrorMessage(container, ERROR_IDS.image, v.message);
      label.focus();
      return;
    }

    renderImagePreview(fileInput, container, file);
  });

  const validatePresence = () => {
    const hasImage = container.querySelector(".preview-image") || (fileInput.files && fileInput.files.length > 0);

    hasImage
      ? clearErrorMessage(ERROR_IDS.image)
      : (!document.getElementById(ERROR_IDS.image) && renderErrorMessage(container, ERROR_IDS.image, UI_ERROR_MESSAGES.image));
  };

  container.addEventListener("focusout", (e) => {
    const t = e.target;
    if (t instanceof Element && t.closest(".upload-label")) validatePresence();
  });

  fileInput.addEventListener("change", validatePresence);
}


/** Monte la logique du champ titre: nettoyage, validation.
 * @returns {void}
 */
export function setupTitleField() {
  const input = document.getElementById("title");
  if (!input) return;

  input.setAttribute("maxlength", "100");

  const cleanse = (t) =>
    String(t)
      .replace(/[^A-Za-z0-9\s\u00C0-\u024F\-'"`]/gu, "")
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+/g, "")
      .slice(0, 100);

  // Nettoyage + validation en continu
  input.addEventListener("input", () => {
    const c = cleanse(input.value);
    if (c !== input.value) input.value = c;
    markTouched();
    validate();
  });

  // Collage contrôlé : on intercepte, on nettoie et on replace le caret
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const txt = (e.clipboardData || window.clipboardData)?.getData("text") || "";
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd   ?? input.value.length;

    const pasted = cleanse(txt);
    const before = input.value.slice(0, start);
    const after = input.value.slice(end);
    const next = (before + pasted + after).slice(0, 100);

    input.value = next;

    const newCaret = Math.min(before.length + pasted.length, next.length);
    input.setSelectionRange(newCaret, newCaret);

    // Validation après collage
    markTouched();
    validate();
  });

  const container = document.getElementById("form-group-main");
  const touched = () => input.dataset.touched === "true";
  const markTouched = () => { input.dataset.touched = "true"; };

  const validate = () => {
    const v = input.value.trim();
    if (!v) {
      touched()
        ? renderErrorMessage(container, ERROR_IDS.title, UI_ERROR_MESSAGES.title)
        : clearErrorMessage(ERROR_IDS.title);
      return;
    }

    clearErrorMessage(ERROR_IDS.title);
  };

  input.addEventListener("focus", markTouched);
  input.addEventListener("blur", validate);
}


/**
 * Réinitialise le champ titre du formulaire d’upload :
 * - Vide la valeur de l’input <input id="title">
 * - Réinitialise l’état "touched" à "false"
 * - Supprime tout message d’erreur associé
 *
 * @returns {void}
 */
function resetTitleField() {
  const titleInput = document.getElementById("title");

  if (titleInput) {
    titleInput.value = "";
    titleInput.dataset.touched = "false";
  }

  clearErrorMessage(ERROR_IDS.title);
}


/** Active la validation de la catégorie (message si vide).
 * @returns {void}
 */
export function setupCategoryValidation() {
  const categoryInput = document.getElementById("category");
  if (!categoryInput) return;
  
  const container = document.getElementById("form-group-footer");
  
  const validate = () => {
    if (categoryInput.value === "") {
      renderErrorMessage(container, ERROR_IDS.category, UI_ERROR_MESSAGES.category);
      return;
    }
    
    clearErrorMessage(ERROR_IDS.category);
  };
  
  categoryInput.addEventListener("change", validate);
  categoryInput.addEventListener("blur", validate);
}


/**
 * Réinitialise le champ de sélection de catégorie :
 * - Vide la valeur du <select id="category"> si présent
 * - Supprime tout message d’erreur associé
 *
 * @returns {void}
 */
function resetCategoryField() {
  const categoryInput = document.getElementById("category");

  if (categoryInput) {
    categoryInput.value = "";
  }

  clearErrorMessage(ERROR_IDS.category);
}


/** Active l’état du bouton submit en fonction des champs.
 * @returns {void}
 */
export function setupUploadButtonState() {
  const form = document.getElementById("upload-form");
  const fileInput = document.getElementById("image");
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("category");
  const submitBtn = form.querySelector(".btn-form-validate");

  if (!form || !fileInput || !titleInput || !categorySelect || !submitBtn) return;

  const updateState = () => {
    const hasFile = !!fileInput.files?.length;
    const hasTitle = titleInput.value.trim().length > 0;
    const hasCategory = categorySelect.value !== "";
    const isValid = hasFile && hasTitle && hasCategory
  
    submitBtn.disabled = !isValid;
    submitBtn.classList.toggle("btn-form-is-valid", isValid);
    submitBtn.classList.toggle("btn-form-not-valid", !isValid);
  }

  updateState();

  fileInput.addEventListener("change", updateState);
  titleInput.addEventListener("input", updateState);
  categorySelect.addEventListener("change", updateState);
}


/** ---- Chargement des catégories ---- */

/** Charge les catégories dans le <select> du step-two.
 * @returns {Promise<void>}
 */
export async function loadCategoryOptions() {
  const categorySelect = document.getElementById("category");
  if (!categorySelect) return;
  
  try {
    if (categorySelect.dataset.loaded === "true" && categorySelect.options.length > 1) {
      clearErrorMessage(ERROR_IDS.category);
      return;  
    }
    
    const categories = await getCategories();
    
    categorySelect.innerHTML = "";

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.disabled = true;
    emptyOption.selected = true;
    emptyOption.hidden = true;

    categorySelect.appendChild(emptyOption);

    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;

      categorySelect.appendChild(option);
    });
    categorySelect.dataset.loaded = "true";

  } catch {
    showUiError("categories", ERROR_IDS.category);
  }
}


/** ---- Soumission upload ---- */

/**
 * Soumet l’upload (FormData), met à jour les galeries
 * et appelle le callback fourni avec le work créé.
 *
 * @param {(work: Work) => void} [onCreated] - Callback exécuté après création réussie
 * @returns {void}
 */
export function setupUploadSubmit(onCreated) {
  const form = document.getElementById("upload-form");

  const modalGallery = document.querySelector(".modal-gallery-content");
  const mainGallery = document.querySelector(".gallery");
  const fileInput = document.getElementById("image");
  const titleInput = document.getElementById("title");
  const categorySel = document.getElementById("category");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector(".btn-form-validate");

    const file = fileInput?.files?.[0] || null;
    const title = (titleInput?.value || "").trim();
    const category = categorySel?.value || "";

    if (!file || !title || !category) return;
    const v = validateImageFile(file);
    if (!v.ok) return;

    const normalizeWork = (work) => {
      if (work?.category?.name) return work;
      const opt = categorySel.selectedOptions[0];

      return {
        ...work,
        category: {
          id: Number(category),
          name: opt.textContent
        }
      };
    };

    const fd = new FormData();
    fd.append("image", file);
    fd.append("title", title);
    fd.append("category", category);

    submitBtn.disabled = true;
    try {
      const token = localStorage.getItem("token");
      const created = await createWork(fd, token);
      const work = normalizeWork(created);

      modalGallery?.appendChild(createWorkFigure(work, { withDelete: true }));
      mainGallery?.appendChild(createWorkFigure(work));

      if (typeof onCreated === "function") onCreated(work);

      document.querySelector(".modal-icon-close")?.click();

    } catch {
      showUiError("upload", ERROR_IDS.upload);
    } finally {
      submitBtn.disabled = false;
    }
  });
}