/**
 * @file login.js
 * Gère la logique de connexion utilisateur depuis la page de login.
 *
 * Ce module :
 * - Nettoie et valide les données saisies
 * - Intercepte la soumission du formulaire de connexion
 * - Envoie une requête POST à l’API pour authentifier l’utilisateur
 * - Stocke le token JWT dans le localStorage si la connexion est réussie
 * - Redirige l’utilisateur vers la page d’accueil (index.html)
 * - Affiche un message d’erreur dans le DOM si la connexion échoue
 */
import { fetchData } from "./api.js";
import { logOut, isLogIn, } from "./utils.js";
import { domModificationLogIn } from "./dom.js";

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const errorElement = document.getElementById("login-error");
  errorElement.textContent = "";

  let email = document.getElementById("email").value.trim().toLowerCase();
  let password = document.getElementById("password").value.trim();

  if (!email || !password) {
    errorElement.textContent = "Veuillez remplir tous les champs.";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorElement.textContent = "Adresse email invalide.";
    return;
  }

  try {
    const data = await fetchData(
      "http://localhost:5678/api/users/login",
      "POST",
      { "Content-Type": "application/json" },
      { email, password }
    );

    localStorage.setItem("token", data.token);
    window.location.href = "index.html";

  } catch (error) {
    errorElement.textContent = "Identifants incorrects. Veuillez réessayer.";
  }
});

(async function init() {
  const isAuth = isLogIn();
  logOut(isAuth);
  domModificationLogIn(isAuth);
})();
