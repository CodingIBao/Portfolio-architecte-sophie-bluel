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

  const allCategories = works.map(work => work.category);
  const uniqueCategoryIds = new Set();

  const uniqueCategories = allCategories.filter(category => {
    const isDuplicate = uniqueCategoryIds.has(category.id);
    uniqueCategoryIds.add(category.id);
    return !isDuplicate;
  });
  console.log(uniqueCategories);

  // Version concise 'Map'
  // const uniqueCategories = [
  //   ...new Map(works.map(work => [work.category.id, work.category])).values()
  // ];

  
  displayWorks(works);
})();