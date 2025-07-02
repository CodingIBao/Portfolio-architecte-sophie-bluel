/**
 * @file login.js
 * Gère la logique de connexion utilisateur depuis la page de login.
 *
 * Ce module :
 * - Intercepte la soumission du formulaire de connexion
 * - Envoie une requête POST à l’API pour authentifier l’utilisateur
 * - Stocke le token JWT dans le localStorage si la connexion est réussie
 * - Redirige l’utilisateur vers la page d’accueil (index.html)
 * - Affiche un message d’erreur dans le DOM si la connexion échoue
 */
import { fetchData } from "./api.js";

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorElement = document.getElementById("login-error");

  errorElement.textContent = "";

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
    if (error.message.includes("404")) {
      errorElement.textContent = "Adresse email introuvable.";
    } else if (error.message.includes("401")) {
      errorElement.textContent = "Mot de passe incorrect.";
    } else {
      errorElement.textContent = "Une erreur est survenue. Veuillez réessayer plus tard.";
    }
  }
});