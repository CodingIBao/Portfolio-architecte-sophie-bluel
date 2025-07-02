/**
 * Gère la soumission du formulaire de connexion.
 *
 * Empêche le comportement par défaut du navigateur (rechargement de page),
 * récupère les valeurs des champs email et mot de passe, et envoie une
 * requête POST à l’API d’authentification. Si la réponse est valide, le
 * token JWT renvoyé est stocké dans le localStorage pour permettre
 * l’accès aux fonctionnalités réservées aux utilisateurs connectés.
 * En cas d’erreur (identifiants invalides ou problème réseau),
 * un message est affiché sous le formulaire.
 *
 * @event submit
 * @param {SubmitEvent} e - L’événement déclenché lors de la soumission du formulaire.
 *
 * @example
 * // L'utilisateur saisit ses identifiants dans le formulaire,
 * // clique sur "Se connecter" et, si les informations sont valides,
 * // il est redirigé vers la page d’accueil avec un token enregistré.
 */
document.getElementById("login-form").addEventListener("submit", async(e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorElement = document.getElementById("login-error");

  errorElement.textContent = "";

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) throw new Error("Identifiant ou mot de passe incorrecte");

    const data = await response.json();
    const token = data.token;

    localStorage.setItem("token", token);
    window.location.href = "index.html";
  } catch (error) {
    errorElement.textContent = error.message;
  }
});