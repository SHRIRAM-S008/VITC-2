from flask import Flask
from .database import init_db


def create_app(database_url=None):
    """Application factory."""
    app = Flask(__name__)

    if database_url is None:
        app.config["DATABASE"] = "infrastructure.db"
    else:
        app.config["DATABASE"] = database_url

    init_db(app)

    from .routes import bp
    app.register_blueprint(bp)

    return app
