/**
 * Main entry point of the application.
 * 
 * Initializes the app by:
 * - Fetching project data from the API.
 * - Extracting unique categories.
 * - Displaying the category filters.
 * - Rendering the project gallery.
 * 
 * This module runs an asynchronous IIFE to bootstrap the UI.
 * 
 * @module main
 */

import { fetchData } from "./scripts/api.js";
import { displayWorks } from "./scripts/dom.js";
import { getUniqueCategories } from "./scripts/utils.js";
import { displayFilters } from "./scripts/dom.js";

(async function init() {

  const works = await fetchData("http://localhost:5678/api/works");

  const uniqueCategories = getUniqueCategories(works);

  displayFilters(uniqueCategories, works);

  displayWorks(works);
})();