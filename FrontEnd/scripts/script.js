fetch("http://localhost:5678/api/works")
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    return response.json();
  })
  .then (data => {
    const gallery = document.querySelector(".gallery");
    
    data.forEach(work => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      const caption = document.createElement("figcaption");
      
      img.src = work.imageUrl;
      img.alt = work.title;
      caption.textContent = work.title;

      figure.appendChild(img);
      figure.appendChild(caption);
      gallery.appendChild(figure);
    });
  })
  .catch(error => {
    console.error("Erreur lors de la récupération des travaux :", error);
  });