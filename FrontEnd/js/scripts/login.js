/**
 * Gère la soumission du formulaire de connexion.
 *
 * Empêche le rechargement par défaut du formulaire, récupère les valeurs
 * des champs email et mot de passe, et envoie une requête POST à l'API
 * d'authentification. Si la réponse est valide, le token JWT est stocké
 * dans le localStorage pour authentifier les futures requêtes.
 * En cas d’erreur (réponse invalide ou problème réseau), un message est affiché à l’utilisateur.
 *
 * @event submit
 * @param {SubmitEvent} e - L'événement de soumission du formulaire.
 *
 * @example
 * // L'utilisateur saisit ses identifiants dans le formulaire,
 * // clique sur "Se connecter" et, si les informations sont valides,
 * // il est authentifié et le token est stocké.
 */
document.getElementById("login-form").addEventListener("submit", async(e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) throw new Error("Identifiants invalides");

    const data = await response.json();
    const token = data.token;

    localStorage.setItem("token", token);
    alert("Connexion réussie !");
  } catch (error) {
    alert("Erreur de connexion : " + error.message);
  }
});