from fastapi import FastAPI, Request, Depends, Form, HTTPException, status, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Local imports
from modules.Edamampy.EdamamRecipeAPI import EdamamRecipeAPI as ERA

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


@app.get('/search', response_class=JSONResponse)
async def search(request: Request, ingredients: str = ''):
    if ingredients != '':
        print(f"Received ingredients: {ingredients}")
        # print(len(ingredients), type(ingredients))
        recipes = ERA.search_recipes(ingredients)
        # Assuming recipes is a list of dictionaries (JSON data)
        return recipes

    # If ingredients are not provided or None, return an empty list
    print("No ingredients recieved")
    return []

@app.get('/recipe', response_class=JSONResponse)
async def recipe(request: Request, recipeLabel: str = ''):
    if recipeLabel != '':
        print(f"Received recipeLabel: {recipeLabel}")
        