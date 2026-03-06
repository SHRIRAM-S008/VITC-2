import os
from app import create_app

if __name__ == "__main__":
    application = create_app()
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    application.run(debug=debug)
