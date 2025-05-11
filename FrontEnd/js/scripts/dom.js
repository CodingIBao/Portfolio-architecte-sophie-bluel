/**
 * DOM manipulation module for displaying projects.
 * 
 * Contains utility functions to create HTML elements
 * and dynamically populate the gallery section.
 * 
 * @module dom
 */

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
  const gallery = document.querySelector(".gallery");
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