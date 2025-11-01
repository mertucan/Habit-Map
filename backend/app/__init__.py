from flask import Flask
from flask_cors import CORS
from config import Config
from .extensions import db, migrate, bcrypt, jwt

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(app) 
    from . import models

    @app.route('/')
    def hello():
        return "HabitMap Backend'i Çalışıyor!"
    return app