// ./js/script/login.js

import { loginUser } from "./api.js";
import { logOut, isLogIn, UI_ERROR_MSG } from "./utils.js";
import { domModificationLogIn } from "./dom.js";

/**
 * @file login.js
 * @description Gestion du formulaire de connexion.
 *
 * - Valide l’email et la présence du mot de passe.
 * - Appelle `loginUser`, stocke le JWT (`localStorage.token`) et redirige vers `index.html`.
 * - Affiche l’erreur dans `#login-error` (role="alert", aria-live="assertive").
 * - Initialise l’UI header via `logOut` / `domModificationLogIn`.
 *
 * @listens submit (#login-form)
 * @see loginUser (api.js)
 * @throws {Error} Si `#login-form` est introuvable.
 */
const form = document.getElementById("login-form");
if (!form) throw new Error("Form #login-form introuvable");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const errorElement = document.getElementById("login-error");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.setAttribute("role", "alert");
    errorElement.setAttribute("aria-live", "assertive");
  }

  const submitBtn = e.currentTarget.querySelector(`input[type="submit"]`);
  if (submitBtn) submitBtn.disabled = true;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    if (errorElement) errorElement.textContent = UI_ERROR_MSG.form;
    (email ? passwordInput : emailInput).focus();
    if (submitBtn) submitBtn.disabled = false;
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    if (errorElement) errorElement.textContent = UI_ERROR_MSG.email;
    emailInput.focus();
    emailInput.select?.();
    if (submitBtn) submitBtn.disabled = false;
    return;
  }

  try {
    const data = await loginUser(email, password);

    localStorage.setItem("token", data.token);
    window.location.replace("index.html");

  } catch (error) {
    if (!errorElement) return;
    let msg = "";
    if (error?.status === 401 || error?.status === 400) {
      msg = UI_ERROR_MSG.login;
    } else {
      msg = UI_ERROR_MSG.generic;
    }
    errorElement.textContent = msg;
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

(async function init() {
  const isAuth = isLogIn();
  logOut(isAuth);
  domModificationLogIn(isAuth);
})();
