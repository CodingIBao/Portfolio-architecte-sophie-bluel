/**
 * Récupère des données JSON depuis une URL d’API donnée.
 *
 * Cette fonction envoie une requête HTTP GET vers l’URL spécifiée et retourne
 * les données au format JSON si la requête réussit.
 * En cas d’erreur réseau ou de réponse invalide (statuts 404, 500, etc.),
 * un message d’erreur est affiché à l’utilisateur et un tableau vide est retourné.
 *
 * @async
 * @param {string} url - L’URL de l’API à interroger.
 * @returns {Promise<Object[]>} Une promesse résolue avec un tableau d’objets JSON,
 * ou un tableau vide en cas d’erreur.
 *
 * @example
 * const works = await fetchData("http://localhost:5678/api/works");
 * // Résultat : [{ id: 1, title: "Projet 1", ... }, ...]
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

      throw new Error(`ERREUR ${errorCode} - ${userMessage}`);
    }

    return await response.json();

  } catch (error){
    displayError(error.message || "Une erreur réseau est survenue. Veuillez vérifier votre connexion.");
    return [];
  }
}