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
 * Displays filter buttons based on category data.
 * 
 * @param {Object[]} categories - Array of category objects.
 */
export function displayFilters(categories) {
  const filtersContainer = document.getElementById("filters")
  const allButton = document.createElement("button");
  allButton.textContent = "Tous";
  allButton.dataset.categoryId ="all";
  filtersContainer.appendChild(allButton);
  
  categories.forEach(category => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.dataset.categoryId = category.id;
    filtersContainer.appendChild(button);
  });
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
 * @function
 * @param {Object[]} works - Array of work objects to display.
 * @param {string} works[].imageUrl - The image URL of the project.
 * @param {string} works[].title - The title of the project.
 */
export function displayWorks(works) {

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