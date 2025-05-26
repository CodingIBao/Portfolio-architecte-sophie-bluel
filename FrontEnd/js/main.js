/**
 * Main entry point of the application.
 * 
 * - Fetches project data from the API.
 * - Dynamically displays the projects in the gallery.
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