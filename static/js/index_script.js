document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to signup and login buttons
    document.getElementById('login-button').addEventListener('click', handleLogin);
    document.getElementById('signup-button').addEventListener('click', handleSignup);
    
    document.getElementById('login-close').addEventListener('click', handleClose)
    document.getElementById('signup-close').addEventListener('click',handleClose)
    
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    // Add event listener to the form submit event
    document.getElementById('search-form').addEventListener('submit', async function(event) {
        // Prevent the default form submission behavior
        event.preventDefault();
        
        // Get the search query from the input field
        const searchQuery = document.getElementById('search-bar').value;
        
        // Call the function to fetch and display cards with the search query
        if (searchQuery) {
            await fetchAndDisplayCards(searchQuery);
            
            await refreshSavedRecipes();

        }       
    });

    // check logged in status
    checkLoggedInStatus();
});


// Function to fetch and display cards dynamically
async function fetchAndDisplayCards(ingredients) {
    try {
        const response = await fetch(`/search?ingredients=${ingredients}`);
        const recipes = await response.json();

        // Get the container to insert cards
        const cardsContainer = document.getElementById('cards-row');
        cardsContainer.innerHTML = ''; // Clear previous cards
        
        // Check if the recipes array is empty
        if (recipes.length === 0) {
            // Create a styled message for empty search result
            const emptyMessage = `
                <div class="empty-message">
                    <div class="icon-container">
                        <svg width="48" height="48" viewBox="0 0 20 20" fill="none" fill-rule="evenodd"
                            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15.5 4.8c2 3 1.7 7-1 9.7h0l4.3 4.3-4.3-4.3a7.8 7.8 0 01-9.8 1m-2.2-2.2A7.8 7.8 0 0113.2 2.4M2 18L18 2"></path>
                        </svg>
                    </div>
                    <p class="message">No results for "<strong>${ingredients}</strong>"</p>
                </div>
            `;
            cardsContainer.innerHTML = emptyMessage;
            return; // Exit the function early
        }
        
        // Iterate over the recipes and create card elements
        recipes.forEach(recipe => {

            const cardHtml = `
            <div class="col md-4">
                <div class="row card clickable-card recipe g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative"
                    style="width: 18rem; cursor: pointer;" data-recipe-id="${recipe.id}">
                    <img src="${recipe.image}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="line-clamp card-title">${recipe.label}</h5>
                        <p class="line-clamp line-clamp-5 card-text">${recipe.ingredientLines}</p>
                    </div>
                    <div class="card-body">
                        <hr>
                        <div class="btn-toolbar justify-content-between">
                            <div class="btn-group">
                                <button href="${recipe.url}" class="goto-recipe btn btn-outline-primary">Go to recipe</button>  
                            </div>
                            <div class="btn-group">
                                <button href="#" class="save-recipe btn btn-outline-danger">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                        class="unsaved-icon bi bi-bookmark-heart" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd"
                                            d="M8 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z">
                                        </path>
                                        <path
                                            d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z">
                                        </path>
                                    </svg>
                                    <svg style="display: none;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" 
                                        class="saved-icon bi bi-bookmark-check-fill" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M2 15.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5m8.854-9.646a.5.5 0 0 0-.708-.708L7.5 7.793 6.354 6.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;

            
            // Insert the card HTML into the container
            cardsContainer.innerHTML += cardHtml;
        });

        // Get the containers to insert their respective modals
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = ''; // Clear previous modals

        // Iterate over the recipes and create modal elements
        recipes.forEach(recipe => {

            const modalHtml = `
            <div class="modal fade recipe" id="${recipe.id}" data-recipe-id="${recipe.id}" tabindex="-1" aria-hidden="true" role="dialog" style="display: none;">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
              <div class="modal-content">
                <div class="modal-header">
                  <h1 class="modal-title fs-5" id="modalTitle">View Recipe</h1>
                  <button type="button" class="recipeModal btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body row" id="modalBody">
                  <div class="col-md-6">
                    <h2>${recipe.label}</h2>
                    <br>
                    <h5>Ingredients:</h5>
                    <ul id="ingredientsList${recipe.id}"></ul> <!-- Unique ID for the ingredients list -->
                    <p><strong>Cuisine Type:</strong> ${recipe.cuisineType}</p>
                    <p><strong>Meal Type:</strong> ${recipe.mealType}</p>
                    <p><strong>Calories:</strong> ${recipe.calories}</p>
                    <h5>Health Labels:</h5>
                    <ul id="healthLabelsList${recipe.id}"></ul> <!-- Unique ID for the health labels list -->
                   </div>
                   <div class="col-md-6">
                     <img width="512" length="512" src="${recipe.image}" class="img-fluid mb-3" alt="Recipe Image">
                   </div>
                </div>
                <div class="modal-footer justify-content-between">
                  <div class="btn-group">
                  <button href="${recipe.url}" class="goto-recipe btn btn-outline-primary   ">Go to recipe</button>  
                  </div>
                  <div class="btn-group">
                    <button href="#" class="save-recipe btn btn-outline-danger">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                        class="unsaved-icon bi bi-bookmark-heart" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z">
                        </path>
                        <path
                          d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z">
                        </path>
                      </svg>
                      <svg style="display: none;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                        class="saved-icon bi bi-bookmark-check-fill" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                          d="M2 15.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5m8.854-9.646a.5.5 0 0 0-.708-.708L7.5 7.793 6.354 6.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0z">
                        </path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
            `;

            //Insert the modal HTML into the container
            modalContainer.innerHTML += modalHtml;

            // Dynamically populate the ingredients list
            const ingredientsList = document.getElementById(`ingredientsList${recipe.id}`);
            recipe.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient;
                ingredientsList.appendChild(li);
            });

            // Dynamically populate the health labels list
            const healthLabelsList = document.getElementById(`healthLabelsList${recipe.id}`);
            recipe.healthLabels.forEach(label => {
                const li = document.createElement('li');
                li.textContent = label;
                healthLabelsList.appendChild(li);
            });

        });        

        // Add click event listener to all cards with the class 'clickable-card'
        const cards = document.querySelectorAll('.clickable-card');
        Array.prototype.forEach.call(cards, (card) => {
            card.style.cursor = 'pointer';
            card.addEventListener('mousedown', handleCardClick);
        });

        // Add click event listener to all buttons with the class 'save-recipe'
        const saveButtons = document.querySelectorAll('.save-recipe');
        saveButtons.forEach(button => {
            button.addEventListener('click', toggleSaveRecipe);
        });

        // Add click event listener to all buttons with the class 'goto-recipe'
        const gotoRecipeButtons = document.querySelectorAll('.goto-recipe');
        gotoRecipeButtons.forEach(button => {
            button.addEventListener('click', handleGotoRecipe);
        });

    } catch (error) {
        console.error('Error fetching and displaying cards:', error);
    }
}

// Functions to handle cards-click-save-goto

// Function to handle card click events
async function handleCardClick(event) {
    // Check if the left mouse button is clicked (event.button === 0)
    if (event.button === 0) {
        let down = +new Date();
        let up;

        const card = event.currentTarget;
        card.addEventListener('mouseup', (event) => {
            // Check if the left mouse button is released (event.button === 0)
            if (event.button === 0) {
                up = +new Date();
                // Calculate the duration between mouse down and up events
                const clickDuration = up - down;
                // Check if the duration is less than 250 milliseconds
                if (clickDuration < 250) {
                    // Check if the click event is not coming from a nested button
                    if (!event.target.closest('.save-recipe') && !event.target.closest('.goto-recipe')) {
                        // Get the modal element associated with the card's id
                        const modalId = card.getAttribute('data-recipe-id');
                        const modalElement = document.getElementById(modalId);
                        // Show the modal
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                    }
                }
            }
        });
    }
}

async function toggleSaveRecipe(event) {
    event.preventDefault(); 
    event.stopPropagation();
    
    if (localStorage.getItem('logged_in') === 'false') {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();

        const modalBackDrops = document.querySelectorAll('.modal-backdrop');
        const lastModalBackDrop = modalBackDrops.item(modalBackDrops.length - 1);
        lastModalBackDrop.style.zIndex = 1499;

    } else {

        try {
            const recipeId = this.closest('.recipe').getAttribute('data-recipe-id');
            console.log(`Recipe ID: ${recipeId}`);

            // Toggle save button icons and classes for both modal and card
            toggleSaveButton(recipeId);
            
            // Send a toggle request
            const response = await fetch('/toggle-save-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'id': recipeId,
                    'username': localStorage.getItem('logged_username')                    
                })                
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                console.log(data.message);
                
            }
            
        } catch (error) {
            console.error('Error saving recipe:', error);
        }
    }
}

function toggleSaveButton(recipeId) {
    // Get the corresponding save button in the modal
    const modalSaveButton = document.querySelector(`.modal.recipe[data-recipe-id="${recipeId}"] .save-recipe`);
    // Get the corresponding save button in the card
    const cardSaveButton = document.querySelector(`.card.recipe[data-recipe-id="${recipeId}"] .save-recipe`);

    // For the Modal
    let unsavedIcon = modalSaveButton.querySelector('.unsaved-icon');
    let savedIcon = modalSaveButton.querySelector('.saved-icon');
    
    unsavedIcon.style.display = unsavedIcon.style.display === 'none' ? 'block' : 'none';
    savedIcon.style.display = savedIcon.style.display === 'none' ? 'block' : 'none';
    modalSaveButton.classList.toggle('btn-outline-danger');
    modalSaveButton.classList.toggle('btn-danger');

    // For the Card 
    unsavedIcon = cardSaveButton.querySelector('.unsaved-icon');
    savedIcon = cardSaveButton.querySelector('.saved-icon');
    
    unsavedIcon.style.display = unsavedIcon.style.display === 'none' ? 'block' : 'none';
    savedIcon.style.display = savedIcon.style.display === 'none' ? 'block' : 'none';
    cardSaveButton.classList.toggle('btn-outline-danger');
    cardSaveButton.classList.toggle('btn-danger');
}

async function handleGotoRecipe(event) {
    // Prevent the default button click behavior
    event.preventDefault(); 

    // Stop the event propagation to prevent triggering the parent clickable card
    event.stopPropagation();

    // Get the URL associated with the clicked button
    const recipeUrl = this.getAttribute('href');

    // For example, you can redirect the user to the recipe URL
    window.location.href = recipeUrl;
}

async function refreshSavedRecipes() {
    

    // Check if the user is logged in
    const loggedIn = localStorage.getItem('logged_in');
    if (!loggedIn) {
        console.log('User is not logged in');
        return; // Exit if the user is not logged in
    }

    try {
        // Send a request to the server to get saved recipes
        const response = await fetch('/get-saved-recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: localStorage.getItem('logged_username') // Send the username from local storage
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch saved recipes');
        }

        // Parse the response JSON
        const savedRecipes = await response.json();

        // Get all cards with the class 'clickable-card'
        const cards = document.querySelectorAll('.clickable-card');

        // Iterate through each card
        cards.forEach(card => {
            const recipeId = card.getAttribute('data-recipe-id');

            // Check if the recipe ID is in the saved recipes array
            if (savedRecipes.some(recipe => recipe.id === recipeId)) {

                // Toggle both the card and the modal save button
                toggleSaveButton(recipeId);
            }
        });

    } catch (error) {
        console.error('Error fetching saved recipes:', error);
    }
}


// Functions to handle login-signup-auth

async function handleSignup(event) {
    event.preventDefault();

    // Get form data
    const firstName = document.getElementById('signup-floatingfname').value;
    const lastName = document.getElementById('signup-floatinglname').value;
    const emailOrUsername = document.getElementById('signup-floatingInput').value;
    const password = document.getElementById('signup-floatingPassword').value;
    const confirmPassword = document.getElementById('signup-floatingCPassword').value;
    
    const msgContainer = document.getElementById('signup-message');
    msgContainer.innerHTML = ''; // Clear previous message


    // Validate form data (you can add more validation as needed)
    if (!firstName || !lastName || !emailOrUsername || !password || !confirmPassword) {
        msgContainer.innerHTML = 'Fields cannot be empty!';
    } 

    else if (password !== confirmPassword) {
        msgContainer.innerHTML = 'Passwords do not match!';
    }

    else if (password.length < 8) {
        msgContainer.innerHTML = 'Password must be at least 8 characters long!';
    }
    else {
        // Send data to server
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'firstname': firstName,
                    'lastname': lastName,
                    'username': emailOrUsername,
                    'password': password
                })
            });
            const data = await response.json();
            
            // Handle response from server (e.g., show success message, redirect user, etc.)
            if (data.status==='success') {

                localStorage.setItem('logged_in', 'true');
                localStorage.setItem('logged_username', data.username);
                localStorage.setItem('logged_firstname', data.firstname);
                localStorage.setItem('logged_password', data.password);
                
                console.log("User signed up successfully");
                console.log("is logged_in: " + localStorage.getItem('logged_in'));

                
                 // adding logged user name
                 const loggedName = document.getElementById('logged-username') ;
                 loggedName.innerHTML = data.firstname;
                
                // Toggle between logged-in and logged-in buttons in the account-area class
                const loggedInButtons = document.getElementById('logged-in');
                const loggedOutButtons = document.getElementById('logged-out');
                loggedInButtons.style.display = 'block'
                loggedOutButtons.style.display = 'none'

                // Close the sign-up modal
                document.getElementById('signup-close').click();

                // Refresh savee recipes
                await refreshSavedRecipes();

            }
            
            else {
                msgContainer.innerHTML = data.message;
            }

        } catch (error) {
                console.error('Error signing up:', error);
        }    
    }   
}

async function handleLogin(event) {
    event.preventDefault();

    // Get form data
    const emailOrUsername = document.getElementById('login-floatingInput').value;
    const password = document.getElementById('login-floatingPassword').value;

    const msgContainer = document.getElementById('login-message');
    msgContainer.innerHTML = ''; // Clear previous message

    // Validate form data (you can add more validation as needed)
    if (!emailOrUsername || !password) {
        msgContainer.innerHTML = 'Fields cannot be empty!';
    }
    
    else {
        // Send data to server
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'username': emailOrUsername,
                    'password': password
                })
            });
            const data = await response.json();

            // Handle response from server (e.g., show success message, redirect user, etc.)
            if (data.status==='success') {
                
                // Setting vars
                localStorage.setItem('logged_in','true');
                localStorage.setItem('logged_username', data.username);
                localStorage.setItem('logged_firstname', data.firstname);
                localStorage.setItem('logged_password', data.password);

                console.log("is logged_in: " + localStorage.getItem('logged_in'));
                
                // adding logged user name
                const loggedName = document.getElementById('logged-username') ;
                loggedName.innerHTML = data.firstname;
                
                // Toggle between logged-in and logged-in buttons in the account-area class
                const loggedInButtons = document.getElementById('logged-in');
                const loggedOutButtons = document.getElementById('logged-out');
                loggedInButtons.style.display = 'block'
                loggedOutButtons.style.display = 'none'
               
                // Close the login-up modal
                document.getElementById('login-close').click();

                
                // Refresh savee recipes
                await refreshSavedRecipes();
            }

            else {
                msgContainer.innerHTML = data.message;

            }

        } catch (error) {
            console.error('Error logging in:', error);
        }
    }
    
}

async function handleClose(event) {

    const closeId = event.target.id;
    
    if (closeId === 'signup-close') {
        const msgContainer = document.getElementById('signup-message');
        msgContainer.innerHTML = ''; // Clear previous 
        
        // Reser the form
        document.getElementById('signup-form').reset();

    
    } else if (closeId === 'login-close') {
        const msgContainer = document.getElementById('login-message');
        msgContainer.innerHTML = ''; // Clear previous message

        // Reset the form
        document.getElementById('login-form').reset();
    }
}

async function handleLogout(event) {
    event.preventDefault();
    
    try {
        
        await refreshSavedRecipes();

        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'username': localStorage.getItem('logged_username'),
            })
        });

        const data = await response.json();

        // Handle response from server (e.g., show success message, redirect user, etc.)
        if (data.status === 'success') {

            // Modifying vars
            localStorage.setItem('logged_in','false');
            localStorage.removeItem('logged_username');
            localStorage.removeItem('logged_firstname');
            localStorage.removeItem('logged_password');

            console.log("is logged_in: " + localStorage.getItem('logged_in'));

             // adding logged user name
             const loggedName = document.getElementById('logged-username') ;
             loggedName.innerHTML = '';
            

            // Toggle between logged-in and logged-out buttons in the account-area class
            const loggedInButtons = document.getElementById('logged-in');
            const loggedOutButtons = document.getElementById('logged-out');
            loggedInButtons.style.display = 'none'
            loggedOutButtons.style.display = 'block'

        }

        else {
            console.error('Error logging out:', data.message);
    
        } 
    
    }   catch (error) {
            console.error('Error logging out:', error);
    }
}   

async function checkLoggedInStatus() {
    
    // set logged status if doesn't exists
    if (!localStorage.getItem('logged_in'))
    {
        localStorage.setItem('logged_in', 'false');
    }

    if (localStorage.getItem('logged_in') === 'true') {
        // adding logged user name
        const loggedName = document.getElementById('logged-username') ;
        loggedName.innerHTML = localStorage.getItem('logged_firstname');

        // Toggle between logged-in and logged-in buttons in the account-area class
        const loggedInButtons = document.getElementById('logged-in');
        const loggedOutButtons = document.getElementById('logged-out');
        loggedInButtons.style.display = 'block'
        loggedOutButtons.style.display = 'none'
    }
}

// Modal toggles

// JavaScript function to show the login modal and adjust z-index of the modal backdrop
function showLoginModal() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
  
    const modalBackDrops = document.querySelectorAll('.modal-backdrop');
    const lastModalBackDrop = modalBackDrops.item(modalBackDrops.length - 1);
    lastModalBackDrop.style.zIndex = 1499;
  }
  
  // JavaScript function to show the signup modal and adjust z-index of the modal backdrop
function showSignupModal() {
    const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
    signupModal.show();
  
    const modalBackDrops = document.querySelectorAll('.modal-backdrop');
    const lastModalBackDrop = modalBackDrops.item(modalBackDrops.length - 1);
    lastModalBackDrop.style.zIndex = 1499;
  }
  