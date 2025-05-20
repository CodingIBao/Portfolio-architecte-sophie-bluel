import { displayError } from "./dom.js";

/**
 * Fetches JSON data from a given API URL.
 *
 * Attempts to retrieve data from the specified endpoint and returns it as an array of objects.
 * If an error occurs (HTTP error or network failure), an error message is displayed and an empty array is returned.
 * 
 * @async
 * @function fetchData
 * @param {string} url - The API endpoint to fetch data from.
 * @returns {Promise<Object[]|[]>} A promise that resolves to an array of data objects, or an empty array if the request fails.
 */
export async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorCode = response.status;
      let userMessage = "Impossible de charger les projets. Veuillez réessayer ultérieurement.";

      if (errorCode === 404) {
        userMessage = "Les données demandées sont introuvables.";
      } else if (errorCode === 500) {
        userMessage = "Le serveur rencontre un problème. Merci de patienter.";
      }

      displayError(`ERREUR ${errorCode} - ${userMessage}`);
      return [];
    }

    return await response.json();
  } catch {
    displayError("Une erreur réseau est survenue. Veuillez vérifier votre connexion.");
    return [];
  }
}