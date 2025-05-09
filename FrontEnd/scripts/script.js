/**
 * Fetches work items from the API and dynamically displays them in the gallery.
 *
 * Sends a GET request to the local API to retrieve a list of works,
 * then dynamically creates HTML elements (<figure>, <img>, <figcaption>)
 * for each item and appends them to the gallery section on the page.
 *
 * @function
 * @returns {void}
 */
fetch("http://localhost:5678/api/works")
  .then(response => {
    // Check if the HTTP response status is OK (200–299)
    if (!response.ok) {
      // If not, throw an error with the HTTP status
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    // Parse the response as JSON
    return response.json();
  })
  .then (data => {
    // Select the element that will contain the gallery
    const gallery = document.querySelector(".gallery");
    
    // Iterate through each work item and create the HTML structure
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
    // Log any errors that occur during the fetch process
    console.error("Erreur lors de la récupération des travaux :", error);
  });