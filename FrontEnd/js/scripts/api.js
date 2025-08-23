
// ./js/scripts/api.js

/**
 * URL de base de l'API backend.
 * Ajustez-la selon l'environnement (local, préprod, prod).
 * @type {string}
 * 
 */
export const baseURL = "http://localhost:5678/api";


/**
 * Récupère la liste complète des projets (works).
 *
 * @function getWorks
 * @returns {Promise<Array<{id:number|string, title:string, imageUrl:string, category:{name:string}}>>}
 *
 */
export async function getWorks() {
  return fetchData(`${baseURL}/works`);
}


/**
 * Récupère la liste des catégories disponibles.
 *
 * @function getCategories
 * @returns {Promise<Array<{id:number|string, name:string}>>}
 *
 */
export async function getCategories() {
  return fetchData(`${baseURL}/categories`);
}


/**
 * Supprime un projet par son identifiant.
 *
 * @function deleteWork
 * @param {number|string} id - Identifiant du projet à supprimer.
 * @param {string} token - Jeton JWT (format: Bearer <token>) pour l'authentification.
 * @returns {Promise<void|undefined>} Retourne `undefined` si l'API répond 204 No Content.
 *
 * @throws {Error} Si la réponse HTTP n'est pas OK (4xx/5xx).
 *
 */
export async function deleteWork(id, token) {
  return fetchData(`${baseURL}/works/${id}`, "DELETE", {
    "Authorization": `Bearer ${token}`,
  });
}


/**
 * Authentifie l'utilisateur et renvoie le jeton JWT.
 *
 * @function loginUser
 * @param {string} email - Adresse e-mail de l'utilisateur.
 * @param {string} password - Mot de passe.
 * @returns {Promise<{ token: string }>} Objet contenant le jeton d'authentification.
 *
 * @throws {Error} Si l'email/mot de passe est invalide ou en cas d'erreur réseau.
 *
 */
export async function loginUser(email, password) {
  return fetchData(`${baseURL}/users/login`, "POST", {
    "Content-Type": "application/json",
  }, { email, password});
}


/**
 * Exécute une requête HTTP générique (GET/POST/PUT/DELETE/PATCH) avec gestion d’erreurs.
 *
 * Comportement :
 * - Sérialise automatiquement `body` en JSON si fourni (⚠️ pour `FormData`, ne pas passer par `body` ici sans adapter).
 * - Lève une erreur explicite si `response.ok` est `false` (statuts non 2xx).
 * - Retourne le JSON parsé, ou `undefined` si la réponse est `204 No Content`.
 *
 * @async
 * @template T
 * @param {string} url - URL de la ressource à interroger.
 * @param {"GET"|"POST"|"PUT"|"DELETE"|"PATCH"} [method="GET"] - Méthode HTTP.
 * @param {Record<string, string>} [headers={}] - En-têtes HTTP à inclure.
 * @param {unknown} [body=null] - Corps de la requête (sera `JSON.stringify` s'il est non nul).
 * @returns {Promise<T|undefined>} Données JSON parsées (`T`) ou `undefined` si 204.
 *
 * @throws {Error} En cas d’erreur réseau ou de statut HTTP non 2xx.
 * Le message d’erreur est de la forme `"<status> - <message lisible>"`.
 *
 * @example
 * // GET simple
 * const works = await fetchData("http://localhost:5678/api/works");
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
 * await fetchData(`http://localhost:5678/api/works/123`, "DELETE", {
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
