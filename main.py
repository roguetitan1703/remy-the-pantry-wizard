from fastapi import FastAPI, Request, Depends, Form, HTTPException, status, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from passlib.hash import bcrypt
from pymongo import MongoClient

# Local imports
from modules.Edamampy.EdamamRecipeAPI import EdamamRecipeAPI as ERA

# Setting up MongoDB
client = MongoClient('mongodb://localhost:27017')
db = client.remy_tpw
users = db.users
logged_in = False
user = {}
local_db = {} # A local replicating db

# Setting up FastAPI
app = FastAPI()

# Mount static files and configure templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get('/test', response_class=HTMLResponse)
async def test(request: Request):
    return templates.TemplateResponse("test.html", {"request": request})


@app.get('/test2', response_class=HTMLResponse)
async def test2(request: Request):
    return templates.TemplateResponse("test2.html", {"request": request})


@app.get('/index', response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get('/saved-recipes', response_class=HTMLResponse)
async def recipe(request: Request):
    return templates.TemplateResponse("saved_recipes.html", {"request": request})


@app.get('/search', response_class=JSONResponse)
async def search(request: Request, ingredients: str = ''):
    if ingredients != '':
        print(f"Received ingredients: {ingredients}")
        # print(len(ingredients), type(ingredients))
        recipes = ERA.search_recipes(ingredients)
        
        # Save recipe temporarily
        save_recipe_temporarily(recipes)
        
        # Assuming recipes is a list of dictionaries (JSON data)
        return recipes

    # If ingredients are not provided or None, return an empty list
    print("No ingredients recieved")
    return []


@app.post('/save-recipe', response_class=JSONResponse)
async def save_recipe_to_db(request: Request, data: dict):
    username = data["username"]
    recipe_id = data["id"]
    
    print(f"Received request to save recipe with ID: {recipe_id} for user: {username}")

    # Check if the recipe is already saved
    existing_recipe = users.find_one({"username": username, "saved_recipes.id": recipe_id})
    if existing_recipe:
        print("Recipe already saved for this user.")
        return {"status": "success", "message": "Recipe already saved"}

    # Find the recipe in the local database based on recipe_id
    recipe = next((recipe for recipe in local_db if recipe.get("id") == recipe_id), None)

    if not recipe:
        print("Recipe not found in local database.")
        return {"status": "error", "message": "Recipe not found in local db"}

    # Add the recipe to the user's saved recipes
    users.update_one({"username": username}, {"$push": {"saved_recipes": recipe}})
    
    print("Recipe saved successfully.")
    return {"status": "success", "message": "Recipe saved successfully"}


@app.post('/get-saved-recipes', response_class=JSONResponse)
async def get_saved_recipes(request: Request, data: dict):
    
    # Get the user's saved recipes from the database
    saved_recipes = users.find_one({"username": data["username"]}, {"_id": 0, "saved_recipes": 1})
    
    if saved_recipes:
        return saved_recipes["saved_recipes"]
    else:
        return []

@app.post("/login")
async def login(request: Request, user_credentials: dict):
    global user
        
    try:
        username = user_credentials["username"]
        password = user_credentials["password"]
        
        # Check if username exists in the database
        user = users.find_one({"username": username})
        if user is None:
            return {"status": "error", "message": "Username not found"}

        # Verify the password
        if bcrypt.verify(password, user["password"]):
            # Password is correct
            print(f"User logged in successfully: {username}")
            user["logged_in"] = True
            user["username"] = username
            
            return {
                "status": "success",
                "message": "Login successful",
                "username": username,
                "firstname": user["firstname"],
                "password": bcrypt.hash(password) # For security purposes
            }
            
        else:
            # Password is incorrect
            return {"status": "error", "message": "Incorrect password"}

    except Exception as e:
        return {"status": "error", "message": f"Failed to login: {str(e)}"}


@app.post('/signup', response_class=JSONResponse)
async def signup(request: Request, user_credentials: dict):
    global user
    
    try:
        print("Trying to sign up a user")
        
        username = user_credentials["username"]
        password = user_credentials["password"]
        firstname = user_credentials["firstname"]
        lastname = user_credentials["lastname"]
        
        # Check if the user already exists
        if users.find_one({"username": username}):
            print(f"User already exists: {username}")
            return {"status": "error", "message": "User already exists"}

        # Hash the password
        hashed_password = bcrypt.hash(password)

        # Insert the new user into the database with hashed password
        users.insert_one({
            "username": username,
            "password": hashed_password,  # Store the hashed password directly
            "firstname": firstname,
            "lastname": lastname
        })
        
        user["logged_in"] = True
        user["username"] = username
        print(f"User registered successfully {username}")
        
        return {
            "status": "success",
            "message": "User registered successfully",
            "username": username,
            "firstname": firstname,
            "password": hashed_password  # Return the hashed password for security purposes
            }
        
    except Exception as e:
        return {"status": "error", "message": f"Failed to register user: {str(e)}"}

    
@app.post('/logout')
async def logout(request: Request, user_credentials: dict):
    global user
    
    username = user_credentials["username"]
    
    user["logged_in"] = False
    print(f"User logged out successfully: {username}")
    
    return {
        "status": "success",
        "message": "Logged out successfully"
        }


# saves recipe to local_db json temporarily
def save_recipe_temporarily(recipes):
    global local_db
    local_db = recipes
    
    