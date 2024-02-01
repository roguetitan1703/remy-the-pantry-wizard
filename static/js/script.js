document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the form submit event
    document.getElementById('search-form').addEventListener('submit', async function(event) {
        // Prevent the default form submission behavior
        event.preventDefault();
        
        // Get the search query from the input field
        const searchQuery = document.getElementById('search-bar').value;
        
        // Call the function to fetch and display cards with the search query
        await fetchAndDisplayCards(searchQuery);
    });

    // Add event listener to the search button (optional, if you still want to handle click separately)
    document.getElementById('search-button').addEventListener('click', async function() {
        // Get the search query from the input field
        const searchQuery = document.getElementById('search-bar').value;
        
        // Call the function to fetch and display cards with the search query
        await fetchAndDisplayCards(searchQuery);
    });
});


// Function to fetch and display cards dynamically
async function fetchAndDisplayCards(ingredients) {
    try {
        const response = await fetch(`/search?ingredients=${ingredients}`);
        const recipes = await response.json();

        // Get the container to insert cards
        const cardsContainer = document.getElementById('cards-row');
        cardsContainer.innerHTML = ''; // Clear previous cards

        // Iterate over the recipes and create card elements
        recipes.forEach(recipe => {

            const cardHtml = `
            <div class="col md-4">
            <div class="row card g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative"
                style="width: 18rem;">
                <img src="${recipe.image}" class="card-img-top" alt="...">
                <div class="card-body">
                <h5 class="line-clamp card-title">${recipe.label}</h5>
                <p class="line-clamp line-clamp-5 card-text">${recipe.ingredientLines}</p>
                </div>
                <div class="card-body">
                <hr>
                <a href="${recipe.url}" class="card-link">Go to recipe</a>
                </div>
            </div>
            </div>
            `;            
            // Insert the card HTML into the container
            cardsContainer.innerHTML += cardHtml;
        });
    } catch (error) {
        console.error('Error fetching and displaying cards:', error);
    }
}

