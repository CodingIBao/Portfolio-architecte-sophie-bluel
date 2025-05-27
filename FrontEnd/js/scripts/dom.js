/**
 * DOM manipulation module for displaying projects.
 * 
 * Contains utility functions to create HTML elements
 * and dynamically populate the gallery section.
 * 
 * @module dom
 */

const gallery = document.querySelector(".gallery");

/**
 * Sets the active filter button by updating the "active" CSS class.
 *
 * Removes the "active" class from all buttons in the container,
 * then applies it to the specified active button.
 *
 * @private
 * @function setActiveFilter
 * @param {HTMLButtonElement} activeButton - The button to set as active.
 * @param {HTMLElement} container - The container holding all filter buttons.
 */
function setActiveFilter(activeButton, container) {
  const buttons = container.querySelectorAll("button");
  buttons.forEach(btn => btn.classList.remove("active"));
  activeButton.classList.add("active");
}

/**
 * Displays filter buttons based on category data.
 * 
 * @function displayFilters
 * @param {Object[]} categories - Array of category objects (e.g., { id, name }).
 * @param {Object[]} works -  Array of all work objects to be filtered.
 */
export function displayFilters(categories, works) {
  const filtersContainer = document.getElementById("filters")

  const updateURL = (categoryId) => {
    const url = new URL(window.location);
    url.searchParams.set("category", categoryId);
    window.history.pushState({}, "", url);
  };

  const allButton = createElement("button", {
    "data-category-id": "all"
  }, "Tous");
  filtersContainer.appendChild(allButton);

  allButton.addEventListener("click", () => {
    setActiveFilter(allButton, filtersContainer);
    updateURL("all");
    displayWorks(works);
  });
  
  categories.forEach(category => {
    const button = createElement("button", {
      "data-category-id": category.id
    }, category.name);
    filtersContainer.appendChild(button);

    button.addEventListener("click", () => {
      const filteredWorks = works.filter(work => work.category.id === category.id);
      setActiveFilter(button, filtersContainer);
      updateURL(category.id);
      displayWorks(filteredWorks);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category");
  const buttons = filtersContainer.querySelectorAll("button");
  const activeButton = Array.from(buttons).find(
    btn => btn.dataset.categoryId === selectedCategory
  );

  if (activeButton) {
    activeButton.click();
  } else {
    allButton.click();
  }
}

/**
 * Creates an HTML element with optional attributes and text content.
 * 
 * @function
 * @param {string} tag - The HTML tag name (e.g., "div", "img", "figcaption").
 * @param {Object} [attributes={}] - An object of key-value pairs for attributes.
 * @param {string} [textContent=""] - Optional text to insert into the element.
 * @returns {HTMLElement} The created DOM element.
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
 * Renders a list of project items into the gallery container.
 * 
 * Each project is rendered as a <figure> with an image and a caption.
 * 
 * @function displayWorks
 * @param {Object[]} works - Array of work objects to display.
 * @param {string} works[].imageUrl - The image URL of the project.
 * @param {string} works[].title - The title of the project.
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
 * Displays an error message inside the gallery container.
 * 
 * Creates a <p> element with the specified error message and appends it
 * to the gallery section of the DOM. Uses the utility function `createElement`.
 * 
 * @function displayError
 * @param {string} message - The error message to display.
 */
export function displayError(message) {

  const errorElement = createElement("p", {class: "error-message"}, message);
  gallery.appendChild(errorElement);
}