/**
 * Exécute une requête HTTP (GET/POST/PUT/DELETE/PATCH) avec gestion d’erreurs.
 *
 * - Sérialise automatiquement `body` en JSON si fourni.
 * - Lève une erreur explicite si `response.ok` est `false` (statuts non 2xx).
 * - Retourne le JSON parsé, ou `undefined` pour les réponses `204 No Content`.
 *
 * @async
 * @template T
 * @param {string} url - URL de la ressource à interroger.
 * @param {"GET"|"POST"|"PUT"|"DELETE"|"PATCH"} [method="GET"] - Méthode HTTP.
 * @param {Record<string, string>} [headers={}] - En-têtes HTTP à inclure.
 * @param {unknown} [body=null] - Corps de la requête (sera `JSON.stringify` si non nul).
 * @returns {Promise<T|undefined>} Données JSON parsées (`T`) ou `undefined` si 204.
 *
 * @throws {Error} En cas d’erreur réseau ou de statut HTTP non 2xx.
 * Le `message` de l’erreur a la forme `"${status} - ${message lisible}"`.
 *
 * @example
 * // GET simple
 * const works = await fetchData("http://localhost:5678/api/works");
 *
 * @example
 * // (Astuce) Typage dans TON code, pas ici dans la JSDoc :
 * // const works = /** @type {import("./types").Work[]} *\/ (await fetchData("http://localhost:5678/api/works"));
 *
 * @example
 * // POST JSON
 * await fetchData("http://localhost:5678/api/works", "POST", {
 *   "Content-Type": "application/json",
 *   "Authorization": `Bearer ${token}`
 * }, { title: "Projet", imageUrl: "/img.png", categoryId: 2 });
 *
 * @example
 * // DELETE (réponse 204 -> retourne undefined)
 * await fetchData(`http://localhost:5678/api/works/${id}`, "DELETE", {
 *   "Authorization": `Bearer ${token}`
 * });
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

      throw new Error(`${errorCode} - ${message}`);
    }
    
    if (response.status === 204) return;
    return await response.json();

  } catch (error) {
    console.error("[API]", error.message);
    throw error;
  }
}
