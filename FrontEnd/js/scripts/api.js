/**
 * Effectue une requête HTTP vers une API avec gestion des erreurs.
 *
 * Peut être utilisée pour des requêtes GET, POST, PUT, DELETE.
 * Gère les réponses incorrectes en lançant une erreur explicite.
 *
 * @async
 * @param {string} url - L'URL à interroger.
 * @param {string} [method="GET"] - La méthode HTTP (GET, POST, etc.).
 * @param {Object} [headers={}] - Les en-têtes HTTP à envoyer.
 * @param {Object|null} [body=null] - Les données à envoyer (pour POST, PUT...).
 * @returns {Promise<Object>} - La réponse convertie en JSON.
 * @throws {Error} - En cas de statut HTTP non 2xx ou d'erreur réseau.
 */
export async function fetchData(url, method = "GET", headers = {}, body = null) {
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      const errorCode = response.status;
      let message = "Une erreur est survenue.";

      if (errorCode === 400) message = "Requête invalide.";
      else if (errorCode === 401) message = "Accès non autorisé.";
      else if (errorCode === 404) message = "Ressource introuvable.";
      else if (errorCode === 500) message = "Erreur interne du serveur.";

      throw new Error(`ERREUR ${errorCode} - ${message}`);
    }
    
    if (response.status === 204) return;
    return await response.json();

  } catch (error) {
    console.error("[API]", error.message);
    throw error;
  }
}
