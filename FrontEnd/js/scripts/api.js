/**
 * API request utility module.
 * 
 * Provides a generic function for performing HTTP GET requests with error handling.
 * 
 * @module api
 */

/**
 * Fetches JSON data from a given API URL.
 * 
 * @async
 * @function
 * @param {string} url - The API endpoint to fetch data from.
 * @returns {Promise<Object[]|[]>} - The fetched data as an array of objects, or an empty array if an error occurs.
 */
export async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    return [];
  }
}