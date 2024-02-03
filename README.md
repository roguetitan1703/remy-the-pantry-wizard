---

# 🍽️ Recipe Explorer & Management Yard (REMY)

## a.k.a 🧙‍♂️ The-Pantry-Wizard

## 📝 Description

This is a dynamic web application for managing and exploring recipes. Users can search for recipes, view recipe details, save recipes to their account, and more. The application is built with a modern frontend using Bootstrap 5 and vanilla JavaScript, while the backend is powered by FastAPI with a MongoDB database.

## 🌟 Features

- **Search Recipes:** Users can search for recipes by keywords, ingredients, or categories.
- **View Recipe Details:** Detailed information about each recipe, including ingredients, instructions, and images, is provided.
- **Save Recipes:** Logged-in users can save recipes to their account for later access.
- **User Authentication:** Users can create an account, log in, and log out securely.
- **Dynamic Frontend:** The website is completely dynamic, with all functionalities implemented using Bootstrap 5 and vanilla JavaScript.
- **FastAPI Backend:** The backend is built with FastAPI, a modern Python web framework, providing efficient API endpoints.
- **MongoDB Database:** Recipe data is stored and managed in a MongoDB database, allowing for scalable and flexible data storage.
- **Error Handling:** Proper error handling and logging are implemented throughout the application.
- **Bug Fixing:** While the project has met its goals and requirements, ongoing bug fixing and maintenance are part of the development process.

## 💻 Technologies Used

- **Frontend:** HTML, CSS, Bootstrap 5, JavaScript
- **Backend:** FastAPI (Python)
- **Database:** MongoDB

## 🔐 Authentication

- **Passlib Bcrypt:** User authentication is implemented using Passlib's Bcrypt hashing algorithm. User passwords are securely hashed before being stored in the database.
- **Local Storage:** Some user-related data, such as authentication tokens or session information, is stored securely in the browser's local storage to maintain user sessions and enable features like saving recipes.

## 📚 Additional Libraries

- **Passlib:** Used for password hashing in the backend.
- **PyMongo:** MongoDB driver for Python, used to interact with the MongoDB database.

## 🛠️ Setup Instructions

1. Clone the repository to your local machine.
2. Install the necessary dependencies using `pip install -r requirements.txt`.
3. Set up a MongoDB database and configure the connection in the backend code.
4. Run the backend server using `uvicorn main:app --reload`.
5. Access the application through your web browser.

## 🚀 Usage

1. **Search for Recipes:** Enter keywords or ingredients into the search bar and press Enter to find matching recipes.
2. **View Recipe Details:** Click on a recipe card to view detailed information about the recipe.
3. **Save Recipes:** If logged in, click the "Save" button to save a recipe to your account.
4. **Log In/Sign Up:** If not logged in, click the "Log In" or "Sign Up" button to access your account.

## 🤝 Contributing

Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
