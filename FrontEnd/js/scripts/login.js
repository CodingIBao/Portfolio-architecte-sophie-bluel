import { loginUser } from "./api.js";
import { logOut, isLogIn } from "./utils.js";
import { domModificationLogIn } from "./dom.js";

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
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const errorElement = document.getElementById("login-error");
  errorElement.textContent = "";

  const submitBtn = e.currentTarget.querySelector(`input[type="submit"]`);
  submitBtn.disabled = true;

  let email = document.getElementById("email").value.trim().toLowerCase();
  let password = document.getElementById("password").value.trim();

  if (!email || !password) {
    errorElement.textContent = "Veuillez remplir tous les champs.";
    submitBtn.disabled = false;
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorElement.textContent = "Adresse email invalide.";
    submitBtn.disabled = false;
    return;
  }

  try {
    const data = await loginUser(email, password);

    localStorage.setItem("token", data.token);
    window.location.href = "index.html";

  } catch (error) {
    errorElement.textContent = "Identifiants incorrects. Veuillez réessayer.";
  } finally {
    submitBtn.disabled = false;
  }
});

(async function init() {
  const isAuth = isLogIn();
  logOut(isAuth);
  domModificationLogIn(isAuth);
})();
