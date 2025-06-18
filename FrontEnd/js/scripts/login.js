(async function init() {
  
  document.getElementById("login-form").addEventListener("submit", async()=> {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
      const works = await fetchData("http://localhost:5678/api/works");
  });


})();