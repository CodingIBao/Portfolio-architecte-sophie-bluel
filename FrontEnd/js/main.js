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

(async function init() {

  const works = await fetchData("http://localhost:5678/api/works");
  
  displayWorks(works);
})();