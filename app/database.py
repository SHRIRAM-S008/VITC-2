import sqlite3
import click
from flask import g


def get_db(app=None):
    """Return a database connection for the current application context."""
    from flask import current_app
    if app is None:
        app = current_app
    if "db" not in g:
        g.db = sqlite3.connect(
            app.config["DATABASE"],
            detect_types=sqlite3.PARSE_DECLTYPES,
        )
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(app):
    """Register database helpers and create tables on first use."""
    app.teardown_appcontext(close_db)

    with app.app_context():
        db = get_db(app)
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS assets (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT    NOT NULL,
                type        TEXT    NOT NULL,
                city        TEXT    NOT NULL,
                status      TEXT    NOT NULL DEFAULT 'active',
                location    TEXT,
                description TEXT,
                created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
                updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
            );
            """
        )
        db.commit()
