import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- user ka training data (words ya digits)
CREATE TABLE IF NOT EXISTS training_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('word', 'digit')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- har prediction ki history
CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    kind TEXT NOT NULL,
    prompt TEXT NOT NULL,
    result TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
"""


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    with get_conn() as conn:
        conn.executescript(SCHEMA)


# ---------- users ----------
def create_user(username, password_hash):
    try:
        with get_conn() as conn:
            cur = conn.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                (username, password_hash),
            )
            return cur.lastrowid
    except sqlite3.IntegrityError:
        return None


def get_user_by_username(username):
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()


def get_user_by_id(user_id):
    with get_conn() as conn:
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


# ---------- training data ----------
def add_training(user_id, kind, content):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO training_data (user_id, kind, content) VALUES (?, ?, ?)",
            (user_id, kind, content),
        )


def get_training(user_id, kind):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT content FROM training_data WHERE user_id = ? AND kind = ? ORDER BY id",
            (user_id, kind),
        ).fetchall()
    return [r["content"] for r in rows]


def count_training(user_id):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT kind, COUNT(*) AS n FROM training_data WHERE user_id = ? GROUP BY kind",
            (user_id,),
        ).fetchall()
    out = {"word": 0, "digit": 0}
    for r in rows:
        out[r["kind"]] = r["n"]
    return out


def clear_training(user_id):
    with get_conn() as conn:
        conn.execute("DELETE FROM training_data WHERE user_id = ?", (user_id,))


# ---------- predictions ----------
def save_prediction(user_id, kind, prompt, result):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO predictions (user_id, kind, prompt, result) VALUES (?, ?, ?, ?)",
            (user_id, kind, prompt, result),
        )


def get_history(user_id, limit=10):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT kind, prompt, result, created_at FROM predictions "
            "WHERE user_id = ? ORDER BY id DESC LIMIT ?",
            (user_id, limit),
        ).fetchall()
    return [dict(r) for r in rows]
