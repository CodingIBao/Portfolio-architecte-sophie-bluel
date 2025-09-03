
// ./js/scripts/api.js

/** URL de base de l'API.
 * @type {string}
 */
export const baseURL = "http://localhost:5678/api";


/**
 * Récupère la liste complète des projets (works).
 *
 * @function getWorks
 * @returns {Promise<Array<{id:number|string, title:string, imageUrl:string, category:{name:string}}>>}
 * @throws {Error} Si la réponse HTTP n'est pas OK (4xx/5xx) ou en cas d'erreur réseau.
 */
export async function getWorks() {
  return fetchData(`${baseURL}/works`);
}


/**
 * Récupère la liste des catégories disponibles.
 *
 * @function getCategories
 * @returns {Promise<Array<{id:number|string, name:string}>>}
 * @throws {Error} Si la réponse HTTP n'est pas OK (4xx/5xx) ou en cas d'erreur réseau.
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
 * @throws {Error} Si la réponse HTTP n'est pas OK (4xx/5xx) ou en cas d'erreur réseau.
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
 * @returns {Promise<{ userId:number, token:string }>}
 *
 * - Si `response.ok` est faux, lève une `Error` avec un message provenant du backend si disponible, sinon générique.
 */
export async function loginUser(email, password) {
  return fetchData(`${baseURL}/users/login`, "POST", {
    "Content-Type": "application/json",
  }, { email, password});
}


/**
 * Crée un nouveau projet (multipart).
 * @param {FormData} formData - image, title, category
 * @param {string} token - Bearer JWT
 * @returns {Promise<{id:number|string,title:string,imageUrl:string,category:{id:number|string,name:string}}>}
 * @throws {Error} Si la réponse HTTP n'est pas OK (4xx/5xx) ou en cas d'erreur réseau.
 */
export async function createWork(formData, token) {
  return fetchData(`${baseURL}/works`, "POST", {
    Authorization: `Bearer ${token}`,
  }, formData);
}


/**
 * Indique si la valeur `body` fournie est un objet `FormData` utilisable
 * dans l'environnement courant (retourne `false` si `FormData` n'existe pas).
 *
 * @function isFormData
 * @param {unknown} body - Valeur à tester.
 * @returns {boolean} `true` si `body` est une instance de `FormData`, sinon `false`.
 */
function isFormData(body) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}


/**
 * Exécute une requête HTTP générique (GET/POST/PUT/DELETE/PATCH).
 *
 * Comportement :
 * - Sérialise automatiquement `body` en JSON si c'est un objet simple.
 * - Accepte `FormData` sans forcer le `Content-Type`.
 * - Si `response.ok` est faux, lève une `Error` avec un message générique.
 * - Retourne le JSON si `Content-Type` contient `application/json`, sinon `undefined`.
 * - Retourne `undefined` si le statut est `204 No Content`.
 *
 * @async
 * @template T
 * @param {string} url
 * @param {"GET"|"POST"|"PUT"|"DELETE"|"PATCH"} [method="GET"]
 * @param {Record<string, string>} [headers={}]
 * @param {unknown} [body=null]
 * @returns {Promise<T|undefined>}
 * @throws {Error} Si la réponse HTTP n'est pas OK (4xx/5xx) ou en cas d'erreur réseau.
 */
export async function fetchData(
  url,
  method = "GET",
  headers = {},
  body = null,
) {
  const init = {
    method: String(method).toUpperCase(),
    headers: { ...headers },
  };

  if (body != null) {
    if (isFormData(body)) {
      init.body = body;
      delete init.headers["Content-Type"];
      
    } else {
      init.headers["Content-Type"] = init.headers["Content-Type"] || "application/json";
      init.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, init);

  if (!response.ok) {
    const err = new Error("Une erreur est survenue. Réessayez plus tard.");
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) return;

  const contentType = (response.headers.get("Content-Type") || "").toLowerCase();
  if(!contentType.includes("application/json")) return;

  return response.json();
}