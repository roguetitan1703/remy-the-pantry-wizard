# Importing modules to handle requests, server and encoding
import requests, webbrowser, http.server, socketserver, threading
import base64, json
from urllib.parse import urlencode

# Importing modules for paths and environment file
import os, sys, time
from dotenv import load_dotenv, set_key

# Importing logging module
import logging, colorlog

# Adding the project's root directory to the path
project_root = os.getcwd()
sys.path.append(project_root)
# sys.path.append(f'{project_root}/data')

# Importing local modules
# from modules.json_helper.json_helper import read_file

# Initialising the paths for data files
edamam_data_path = f'{project_root}/data/edamam/'
log_data_path = f'{project_root}/data/logs/'

# Loading the .env file
env_file = f'{edamam_data_path}/.env'
load_dotenv(env_file)

# Loading environment variables
app_id = os.getenv('APPLICATION_ID')
app_key = os.getenv('APPLICATION_KEY')

class Logger:
    def __init__(self, log_name, log_file, log_to_console=False, debug_mode=None):
        # Name of the logger to differentiate later
        self.log_name = log_name
        # The log file where the log statements are to be saved
        self.log_file = log_file
        # Whether to log to console or not (only needed when debugging through console)
        self.log_to_console = log_to_console
        # Whether to log in debug mode or not
        self.debug_mode = debug_mode
        
        # Initialising the logger
        self.logger = colorlog.getLogger(self.log_name)
        # Setting the logger to the lowest level DEBUG-> INFO-> WARNING-> ERROR -> CRITICAL, a logger only logs statements which are on or above it's level
        self.logger.setLevel(logging.DEBUG)
        # Managing all the handlers
        self.handlers = {}        
        # Setting up a custom color formatter for better visuals of the log and easy readability
        self.color_formatter = colorlog.ColoredFormatter(
            '%(asctime)s - %(log_color)s%(levelname)-8s%(reset)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S',
            log_colors={
                'DEBUG': 'cyan',
                'INFO': 'green',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'red,bg_white',
            }
        )
        
        # Setting up the loggers handlers
        self.setup_handlers()
        
        
    # Function to setup the file handler which will log to the specified log file 
    def setup_file_handler(self):
        file_handler = logging.FileHandler(self.log_file)
        # Set the level to DEBUG to allow all the logs
        file_handler.setLevel(logging.DEBUG)
        # Add the handler to the handlers dictionary
        self.handlers['file_handler'] = file_handler

        # Add the file handler to the logger
        self.logger.addHandler(file_handler)
        
        # Set the formatter to the color_formatter for the file handler
        file_handler.setFormatter(self.color_formatter)
    
    
    # Function to setup the console handler which will log to the console, and will be usef for immediate feedback during development
    def setup_console_handler(self):
        console_handler = logging.StreamHandler()
        # Set the level to CRITICAL if log_to_console if False making the console_logger to only log statements to console if they are CRITICAL
        console_handler.setLevel(logging.CRITICAL if not self.log_to_console else logging.DEBUG)
        # Add the handler to the handlers dictionary
        self.handlers['console_handler'] = console_handler
        
        # Add the console_handler to the logger
        self.logger.addHandler(console_handler)
        
        # Set the formatter to the color_formatter for the file handler
        console_handler.setFormatter(self.color_formatter)
        

    # Setup all the handlers at once
    def setup_handlers(self):
        self.setup_file_handler()
        self.setup_console_handler() 

        # If a log file is opened to be read, it makes sure the contents are not cleared and vice versa   
        if not self.debug_mode:
            self.clear_log_file()
            # self.log_message('info', 'Starting Program')
        
        
    # Enable console logging if it was disabled previously
    def enable_console_logging(self):
        self.log_to_console = True
        if self.handlers['console_handler'] in self.logger.handlers:
            # Check for the console handler and set its level to DEBUG to allow all logs to log through console 
            self.handlers['console_handler'].setLevel(logging.DEBUG)    
    
    
    # Disable console logging if it was enabled previously or default
    def disable_console_logging(self):
        self.log_to_console = False
        if self.handlers['console_handler'] in self.logger.handlers:
            # Check for the console handler and set its level to CRITICAL to only log to console if they are CRITICAL
            self.handlers['console_handler'].setLevel(logging.CRITICAL)
            
            
    # Remove a handler from the logger permanently
    def remove_handler(self, handler):
        # Deleting the handler from the handlers dictionary
        del self.handlers[handler]
        # Check if the handler is present in the logger's handlers
        for handler_ in self.logger.handlers:
            if handler_ == handler:
                # Remove the handler from the logger permanently
                self.logger.removeHandler(handler_)
                break
            
            
    # Custom log message function which logs the message through all the handlers, It then depends on the handler's level if the log message will pass through
    def log_message(self, log_level, message):
        # Validate the log level provided by the user
        log_level = log_level.upper()
        if log_level not in ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']:
            raise ValueError("Invalid log level. Expected one of: DEBUG, INFO, WARNING, ERROR, CRITICAL")

        # Mapping log levels to corresponding logging methods
        log_level_mapping = {
            'DEBUG': self.logger.debug,
            'INFO': self.logger.info,
            'WARNING': self.logger.warning,
            'ERROR': self.logger.error,
            'CRITICAL': self.logger.critical
        }

        # Log the message with the specified log level using the mapped logging method
        log_level_mapping[log_level](message)
        

    # Read and display the contents of the log file line by line
    def read_log_file(self):
        with open(self.log_file, 'r') as file:
            for line in file:
                line = line.strip()  # To remove any leading/trailing whitespace
                print(line)


    # Clear log file in case of unwanted log statements filling up the log file
    def clear_log_file(self):
        with open(self.log_file, 'w') as file:
            # Opening the file in 'w' mode truncates it, effectively clearing its contents.
            pass

# Initializing logger
logger = Logger('EdamamRecipeAPI', f'{log_data_path}EdamamRecipeAPI.log', log_to_console=True, debug_mode=False)


# The Edamam Recipe API to search for recipes using ingerdients
class EdamamRecipeAPI:
    @staticmethod
    
    def search_recipes(ingerdients):
        logger.log_message('info', f'Searching for recipes using ingerdients: {ingerdients}')
        
        # Send a get request to the api
        response = requests.get(
            os.getenv('RECIPE_SEARCH_URL'),
            headers={
                'Accept': 'application/json'
            },
            params = {
                "type": "public",
                "q": ingerdients,
                "app_id": app_id,
                "app_key": app_key
            }
        )
        
        # if the status code is 200, means the method was successfull
        if response.status_code == 200:
            logger.log_message('info', f'Recipes found using ingerdients: {ingerdients}')
            json_resp = response.json()
            recipes = []
            
            for recipe in json_resp['hits']:
                recipe = recipe['recipe']
                temp = {
                    'uri' : recipe['uri'],
                    'url' : recipe['url'],
                    'label' : recipe['label'],
                    'images' : recipe['images'],
                    'healthLabels' : recipe['healthLabels'],
                    'ingredientLines' : recipe['ingredientLines'],
                    'calories' : recipe['calories'],
                    'cuisineType' : recipe['cuisineType'],
                    'mealType' : recipe['mealType'],
                    'dishType' : recipe['dishType'],
                    'totalNutrients' : recipe['totalNutrients']
                }
                
                recipes.append(temp)
                    
            print(recipes)
        
        else:
            json_resp = response.json()
            print(json_resp)
            logger.log_message('error', f'Status code: {response.status_code} Error: {json_resp["message"]} Url: {response.url}')
            

if __name__ == '__main__':
    ingredients = input("Enter ingredients: ")
    EdamamRecipeAPI.search_recipes(ingredients)
    
    