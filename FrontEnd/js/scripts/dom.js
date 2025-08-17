import { slugify } from "./utils.js";
import { fetchData } from "./api.js";

/**
 * @module dom
 * @description
 * Utilitaires DOM pour l’affichage des projets et la gestion de l’UI (galerie, modale, erreurs, accessibilité).
 * Dépend de `fetchData` pour les appels API et de `slugify` pour les URLs/slug.
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

const gallery = document.querySelector(".gallery");

/**
 * Sélecteurs CSS des éléments interactifs pouvant recevoir le focus via la touche "Tab" dans la modale.
 *
 * Cette constante est utilisée pour :
 * - Identifier tous les éléments focusables au sein de la modale active (étape 1 ou 2)
 * - Mettre en place le piégeage du focus clavier (`trapFocusInModal`) afin d'éviter
 *   que la navigation par Tab ne sorte de la modale
 *
 * **Important :**
 * Lors de l'ajout d'un nouvel élément interactif dans la modale (ex. bouton, champ de formulaire),
 * il faut l'ajouter ici pour qu'il soit inclus dans la navigation clavier.
 *
 * @constant
 * @type {string}
 *
 * @example
 * const focusableElements = modal.querySelectorAll(focusableSelectors);
 * focusableElements[0].focus();
 */
const focusableSelectors = `
  a[href], button:not([disabled]), textarea, input[type="text"],
  input[type="email"], input[type="file"], select,
  [tabindex]:not([tabindex="-1"])
`;


/**
 * Définit le bouton actif (classes + aria-pressed).
 * @param {HTMLButtonElement} activeButton
 * @param {HTMLElement} container
 * @returns {void}
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
 * Affiche des boutons de filtre à partir d'une liste de catégories et met à jour la galerie.
 * Met à jour l’URL avec `?category=<slug>` et gère l’état visuel/ARIA des boutons.
 *
 * @param {Category[]} categories - Liste des catégories.
 * @param {Work[]} works - Tous les projets.
 * @returns {void}
 */
export function displayFilters(categories, works) {
  const filtersContainer = document.getElementById("filters")
  if(!filtersContainer) return;

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
 * @param {keyof HTMLElementTagNameMap} tag
 * @param {Record<string, string>} [attributes={}]
 * @param {string} [textContent=""]
 * @returns {HTMLElement}
 * @example
 * const btn = createElement("button", { class: "btn" }, "Clique moi");
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
 * Rend la galerie principale à partir d’une liste de projets.
 * Écrase le contenu existant de `.gallery`.
 *
 * @param {Work[]} works - Projets à afficher.
 * @returns {void}
 *
 * @example
 * displayWorks([
 *   { id: 1, imageUrl: "img/chaise.png", title: "Chaise", category: { name: "Objets" } },
 *   { id: 2, imageUrl: "img/table.png", title: "Table",  category: { name: "Objets" } }
 * ]);
 */
export function displayWorks(works) {
  gallery.innerHTML = "";

  works.forEach(work => {
    const img = createElement("img", { src: work.imageUrl, alt: work.title});
    const caption = createElement("figcaption", {}, work.title);
    const figure = createElement("figure");
    figure.setAttribute("data-id", work.id);

    figure.appendChild(img);
    figure.appendChild(caption);
    gallery.appendChild(figure);
  });
}


/**
 * Crée (ou remplace) un message d’erreur accessible dans un conteneur.
 * - Supprime l’ancien message ayant le même `id` (évite les doublons).
 * - Ajoute `role="alert"` et `aria-live` pour les lecteurs d’écran.
 *
 * @param {HTMLElement|string} container - Élément parent ou sélecteur CSS où injecter le message.
 * @param {string} id - ID unique du message (permet style ciblé + remplacement).
 * @param {string} message - Texte à afficher (message utilisateur, pas technique).
 * @param {string} [className="error-message"] - Classe(s) CSS pour le style.
 * @param {"off"|"polite"|"assertive"} [ariaLive="polite"] - Priorité d’annonce (accessibilité).
 * @returns {HTMLParagraphElement} Le paragraphe d’erreur injecté.
 *
 * @example
 * // Erreur de catégories (près du select)
 * createErrorMessage(".select-wrapper", "error-message-category", "Impossible de charger les catégories.");
 *
 * @example
 * // Erreur de suppression (dans la modale galerie)
 * createErrorMessage(".modal-gallery-container", "error-delete-project", "La suppression a échoué. Réessayez plus tard.");
 */
export function createErrorMessage(container, id, message, className = "error-message", ariaLive = "polite" ) {
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


/**
 * Affiche un message d’erreur global pour la galerie principale.
 * Vide la galerie, puis affiche le message dans `#portfolio`.
 * @param {string} message - Message utilisateur (ex. « Réessayez plus tard. »).
 * @returns {void}
 */
export function displayGalleryError(message) {
  gallery.innerHTML = "";

  createErrorMessage("#portfolio", "error-display-gallery", message);
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
 * Ajoute le lien "Modifier" à côté du titre "Mes Projets" (icône + texte).
 * Visible uniquement pour les utilisateurs connectés (logique gérée en amont).
 * @returns {void}
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
  
  iconLink.appendChild(icon);
  textLink.appendChild(text);
  linkContainer.append(iconLink, textLink);

  h2.replaceWith(wrapper);
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
 * Prépare l’ouverture de la modale (étape 1) via les liens `.edit-link`.
 * Gère l’affichage, positionne le focus sur le premier élément focusable,
 * puis active le piège de focus clavier.
 * @returns {void}
 */
export function displayModal() {
  const editLinks = document.querySelectorAll(".edit-link");
  if (!editLinks.length) return;

  const onOpen = (e) => {
    e.preventDefault();

    const modal = document.querySelector(".modal");
    const modalContentStepOne = document.getElementById("step-one");

    modal.style.display = "block";
    modalContentStepOne.style.display = "flex";

    const focusableElements = modalContentStepOne.querySelectorAll(focusableSelectors);
    if (focusableElements.length) focusableElements[0].focus();

    trapFocusInModal();
  };

  editLinks.forEach(link => {
    link.removeEventListener("click",onOpen);
    link.addEventListener("click", onOpen);
  });
}


/**
 * Ajoute tous les comportements de fermeture de la modale.
 *
 * Actions gérées :
 * - Clic sur une icône de fermeture `.modal-icon-close`
 * - Clic sur l’overlay (fond noir autour de la modale)
 * - Appui sur la touche `Escape` lorsque la modale est ouverte
 *
 * Lors de la fermeture, cette fonction :
 * - Masque la modale et ses deux contenus (`#step-one` et `#step-two`)
 * - Réinitialise l’UI d’upload d’image en appelant `resetImagePreview()`
 *
 * @function exitModal
 * @returns {void}
 *
 * @example
 * // Active la fermeture de la modale et la réinitialisation du formulaire
 * exitModal();
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
    
    if (stepTwoWasOpen) resetImagePreview();
  }

  closeIcons.forEach(icon => {
    icon.addEventListener("click", closeModal);
  });

  modalContainer.addEventListener("click", (event)=> {
    if (event.target === modalContainer) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event)=> {
    if (event.key === "Escape" && modal.style.display === "block") {
      closeModal();
    }
  });
}


/**
 * Crée la figure de la modale pour un projet.
 * @param {Work} work
 * @returns {HTMLElement}
 * @private
 */
function createModalFigure(work) {
  const figure = document.createElement("figure");

  const img = document.createElement("img");
  img.src = work.imageUrl;

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.setAttribute("data-id", work.id);

  const trashIcon = document.createElement("i");
  trashIcon.className = "fa-solid fa-trash-can";

  deleteBtn.appendChild(trashIcon);
  handleDeleteButton(deleteBtn);

  figure.append(deleteBtn, img);
  return figure;
}


/**
 * Rend la galerie interne de la modale (étape 1) à partir d’une liste de projets.
 *
 * @param {Work[]} works - Projets à afficher dans la modale.
 * @returns {void}
 *
 * @example
 * displayModalGallery([
 *   { id: 1, imageUrl: "img/chaise.png", title: "Chaise", category: { name: "Objets" } },
 *   { id: 2, imageUrl: "img/table.png",  title: "Table",  category: { name: "Objets" } }
 * ]);
 */
export function displayModalGallery(works) {
  const modalGalleryContent = document.querySelector(".modal-gallery-content");
  modalGalleryContent.innerHTML = "";
  
  works.forEach(work => {
    const figure = createModalFigure(work);
    modalGalleryContent.appendChild(figure);
  });
}


/**
 * Attache la logique de suppression API au bouton fourni.
 * En cas de succès : supprime la carte du projet dans la modale ET dans la galerie principale.
 * En cas d’échec : log technique en console + message utilisateur dans la modale.
 *
 * @param {HTMLButtonElement} button - Bouton ayant un `data-id` correspondant à l’ID projet.
 * @returns {void}
 *
 * @example
 * handleDeleteButton(document.querySelector(".delete-btn"));
 */
export function handleDeleteButton(button) {
  button.addEventListener("click", async (e)=> {
    const figure = e.currentTarget.closest("figure");
    const workId = e.currentTarget.dataset.id;
    const token = localStorage.getItem("token");
    const galleryFigure = document.querySelector(`.gallery figure[data-id="${workId}"]`);

    try {
      await fetchData(`http://localhost:5678/api/works/${workId}`, "DELETE", {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      });

      const old = document.getElementById("error-delete-project");
      if (old) old.remove();

      if (figure) figure.remove();
      if (galleryFigure) galleryFigure.remove();

    } catch (error) {
      console.error("[handleDeleteButton]", error.message)
      createErrorMessage(".modal-gallery-container", "error-delete-project", "La suppression a échoué. Réessayez plus tard.");
    }
  });
}


/**
 * Passe de l’étape 1 (galerie) à l’étape 2 (formulaire "Ajout photo").
 * Charge les catégories, focalise le premier élément focusable, et piège le focus.
 * @returns {void}
 */
export function displayModalAddPhoto() {
  const modalContentStepOne = document.getElementById("step-one");
  const modalContentStepTwo = document.getElementById("step-two");
  const buttonAddGallery = document.querySelector(".btn-add-gallery");

  buttonAddGallery.addEventListener("click", async () => {
    modalContentStepOne.style.display = "none";
    modalContentStepTwo.style.display = "flex";

    await populateCategorySelect();

    const focusableElements = modalContentStepTwo.querySelectorAll(focusableSelectors);

    if (focusableElements.length) {
      focusableElements[0].focus();
    }

    trapFocusInModal();
  });
}


/**
 * Revient de l’étape 2 (formulaire) à l’étape 1 (galerie) de la modale.
 * Replace le focus correctement et maintient le piège de focus.
 * @returns {void}
 */
export function handleModalBack() {
  const modalIconBack = document.querySelector(".modal-icon-back");
  const modalContentStepOne = document.getElementById("step-one");
  const modalContentStepTwo = document.getElementById("step-two");

  modalIconBack.addEventListener("click", () => {
    modalContentStepTwo.style.display = "none";
    modalContentStepOne.style.display = "flex";

    const focusableElements = modalContentStepOne.querySelectorAll(focusableSelectors);
    
    if (focusableElements.length) {
      focusableElements[0].focus();
    }

    trapFocusInModal();
  });
}


/**
 * Rend le label d’upload focusable au clavier :
 * Touche `Enter` sur le label déclenche l’ouverture du sélecteur de fichier.
 * @returns {void}
 */
export function enableUploadLabelTrigger() {
  const uploadLabel = document.querySelector(".upload-label");
  const uploadInput = document.getElementById("image");

  uploadLabel.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      uploadInput.click();
    }
 });
}


/**
 * Élément DOM représentant la section active de la modale sur laquelle appliquer le piège clavier.
 * Mis à jour à chaque appel de `trapFocusInModal`.
 * @type {HTMLElement|null}
 * @private
 */
let currentTrapTarget = null;


/**
 * Active le piège de focus clavier sur la section de modale actuellement visible.
 * Empêche la touche Tab de sortir de la modale.
 *
 * @returns {void}
 */
export function trapFocusInModal() {
  const modal = document.querySelector(".modal");

  currentTrapTarget = [...modal.querySelectorAll(".modal-content")]
    .find(step => getComputedStyle(step).display !== "none");

  if (!currentTrapTarget) return;

  modal.removeEventListener("keydown", handleTrap);

  modal.addEventListener("keydown", handleTrap);
}


/**
 * Gère le piégeage du focus (Tab / Shift+Tab).
 * @param {KeyboardEvent} e
 * @returns {void}
 * @private
 */
function handleTrap(e) {
  if (!currentTrapTarget || e.key !== "Tab") return;

  const focusableElements = currentTrapTarget.querySelectorAll(focusableSelectors);

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


/**
 * Charge les catégories via l’API et remplit le `<select id="category">`.
 * - Nettoie un éventuel message d’erreur précédent si le chargement réussit.
 * - Affiche un message utilisateur en cas d’échec et loggue l’erreur technique.
 *
 * @returns {Promise<void>} Résout quand le `<select>` est peuplé ou le message d’erreur affiché.
 * @throws {Error} Propage l’erreur si `fetchData` lance, mais ici elle est capturée pour l’UI.
 */
export async function populateCategorySelect() {
  const categorySelect = document.getElementById("category");
  
  try {
    const categories = await fetchData("http://localhost:5678/api/categories");
    const old = document.getElementById("error-message-category");
    if (old) old.remove();
    
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
  } catch (error) {
    console.error("[populateCategorySelect]", error.message);
    createErrorMessage(".select-wrapper", "error-message-category", "Impossible de charger les catégories. Veuillez réessayer.");
  }
}


/**
 * Nettoie un nom de fichier pour l'utiliser dans un attribut alt ou un affichage.
 * - Supprime l'extension du fichier
 * - Remplace les caractères spéciaux par un espace
 * - Conserve les lettres (y compris accentuées), chiffres, espaces, tirets et apostrophes
 * - Tronque le nom à 100 caractères maximum et ajoute "..." si nécessaire
 *
 * @param {string} fileName - Nom complet du fichier (ex. "photo-vacances@été!.jpg")
 * @returns {string} Nom nettoyé et prêt à l'affichage (ex. "photo vacances été")
 *
 * @example
 * cleanFileName("lampadaire-tokyo@2025!.png");
 * // Retourne: "lampadaire tokyo 2025"
 */
function cleanFileName(fileName) {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  const cleanedName = nameWithoutExt.replace(/[^a-zA-ZÀ-ÿ0-9\s\-']/g, " ");
  return cleanedName.length > 100
   ? cleanedName.slice(0,100) + "..."
   :cleanedName;
}


/**
 * Libère une URL temporaire créée avec `URL.createObjectURL` pour éviter les fuites mémoire.
 *
 * @function revokePreviewURL
 * @param {{ value: string|null }} urlRef - Objet contenant la référence actuelle de l'URL.
 * @returns {void}
 *
 * @example
 * const objectURLRef = { value: URL.createObjectURL(file) };
 * revokePreviewURL(objectURLRef);
 * // Libère l'URL et remet objectURLRef.value à null
 */
function revokePreviewURLFromInput(input) {
  const url = input?.dataset?.previewURL;
  if (url) {
    URL.revokeObjectURL(url);
    input.dataset.previewURL = "";
  }
}


/**
 * Rend une image cliquable et focusable pour rouvrir un sélecteur de fichier.
 * - Clic sur l'image déclenche `fileInput.click()`
 * - Touche `Enter` fait la même action
 * - Ajoute les attributs d’accessibilité nécessaires (`role="button"`, `aria-label`)
 *
 * @function attachImageClickToFileInput
 * @param {HTMLImageElement} imageElement - L'image d'aperçu.
 * @param {HTMLInputElement} fileInput - L'input de type "file" à déclencher.
 * @returns {void}
 *
 * @example
 * attachImageClickToFileInput(document.querySelector(".preview-image"), document.getElementById("image"));
 */
function attachImageClickToFileInput(fileInput, imageElement) {
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
 * Réinitialise l’UI d’upload de la modale (step-two) en remettant le placeholder.
 *
 * - Vide la valeur de l’input file `#image` (supprime la sélection en cours)
 * - Reconstruit le contenu de `.form-group-header` (icône, label, info)
 * - Ré-attache l’input existant au label (évite de recréer un nouvel input et de perdre les listeners)
 * - Active l’accessibilité clavier : touche Enter sur le label ouvre le sélecteur de fichier
 *
 * À appeler lors de la fermeture de la modale (croix / clic hors modale / Échap)
 * et/ou lors du retour à l’étape 1 via la flèche.
 *
 * @function resetImagePreview
 * @returns {void}
 *
 * @example
 * // Fermer la modale puis réinitialiser l’UI d’upload :
 * modal.style.display = "none";
 * resetImagePreview();
 */
function resetImagePreview() {
  const formGroupHeader = document.querySelector(".form-group-header");
  const fileInput = document.getElementById("image");

  if (!formGroupHeader || !fileInput) return;

  revokePreviewURLFromInput(fileInput);
  fileInput.value = "";

  formGroupHeader.innerHTML = "";

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

  formGroupHeader.append(icon, label, info);
}


/**
 * Active la prévisualisation interactive d'une image sélectionnée dans un `<input type="file">`.
 *
 * Fonctionnalités :
 * - Vide le contenu existant du conteneur `.form-group-header`
 * - Affiche une balise `<img>` avec l'aperçu du fichier sélectionné
 * - Génère dynamiquement l'attribut `alt` en nettoyant le nom du fichier (`cleanFileName`)
 * - Applique la classe `.preview-image` pour le style
 * - Rend l'image cliquable et focusable pour permettre de re-sélectionner un fichier
 *   (via clic souris ou touche `Enter`)
 * - Gère la libération de l'URL temporaire (via `revokePreviewURL`) pour éviter les fuites mémoire
 *
 * @function enableImagePreview
 * @returns {void}
 *
 * @example
 * // HTML :
 * // <div class="form-group-header">
 * //   <i class="fa-regular fa-image icon-placeholder"></i>
 * //   <label for="image" class="upload-label">+ ajouter photo</label>
 * //   <span class="upload-info">jpg, png 4mo max</span>
 * // </div>
 * // <input type="file" id="image" accept="image/*" />
 *
 * enableImagePreview();
 * // Après sélection, `.form-group-header` contient :
 * // <img src="blob:..." alt="Prévisualisation de l'image mon-fichier" class="preview-image">
 */
export function enableImagePreview() {
  const fileInput = document.getElementById("image");
  const formGroupHeader = document.querySelector(".form-group-header");

  fileInput.addEventListener("change", () => {
    if (!fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];

    revokePreviewURLFromInput(fileInput);

    const objectURL = URL.createObjectURL(file);
    fileInput.dataset.previewURL = objectURL;

    formGroupHeader.innerHTML = "";

    const previewImage = document.createElement("img");
    previewImage.src = objectURL;
    previewImage.alt = `Prévisualisation de l'image ${cleanFileName(file.name)}`;
    previewImage.classList.add("preview-image");

    attachImageClickToFileInput(fileInput, previewImage);
    
    formGroupHeader.append(fileInput, previewImage);
    previewImage.focus()
  });
}

