import json
import os
import secrets
from functools import wraps

from flask import (
    Flask, flash, jsonify, redirect, render_template, request, session, url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash

import database as db
from predictor import (
    build_digit_model, build_word_model, tokenize_digits, tokenize_words,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_secret_key():
    key = os.environ.get("SECRET_KEY")
    if key:
        return key
    path = os.path.join(BASE_DIR, ".secret_key")
    if os.path.exists(path):
        with open(path) as f:
            return f.read().strip()
    key = secrets.token_hex(32)
    with open(path, "w") as f:
        f.write(key)
    return key


app = Flask(__name__)
app.secret_key = _load_secret_key()
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

db.init_db()


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "user_id" not in session:
            if request.path.startswith("/api/"):
                return jsonify(error="Pehle login karein"), 401
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapped


# ---------------- auth ----------------
@app.route("/")
def index():
    if "user_id" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        if len(username) < 3 or len(password) < 6:
            flash("Username kam az kam 3 aur password kam az kam 6 characters ka ho.")
        else:
            uid = db.create_user(username, generate_password_hash(password))
            if uid is None:
                flash("Ye username pehle se maujood hai.")
            else:
                session.clear()
                session["user_id"] = uid
                session["username"] = username
                return redirect(url_for("dashboard"))
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        user = db.get_user_by_username(username)
        if user and check_password_hash(user["password_hash"], password):
            session.clear()
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            return redirect(url_for("dashboard"))
        flash("Username ya password ghalat hai.")
    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ---------------- pages ----------------
@app.route("/dashboard")
@login_required
def dashboard():
    return render_template(
        "dashboard.html",
        username=session["username"],
        counts=db.count_training(session["user_id"]),
        history=db.get_history(session["user_id"]),
    )


# ---------------- API ----------------
@app.route("/api/train", methods=["POST"])
@login_required
def api_train():
    data = request.get_json(silent=True) or {}
    kind = data.get("kind")
    content = (data.get("content") or "").strip()
    if kind not in ("word", "digit") or not content:
        return jsonify(error="kind (word/digit) aur content zaroori hai"), 400
    if len(content) > 20000:
        return jsonify(error="Content bohat bara hai (max 20000 characters)"), 400
    if kind == "digit" and not tokenize_digits(content):
        return jsonify(error="Digit data me kam az kam ek digit hona chahiye"), 400
    db.add_training(session["user_id"], kind, content)
    return jsonify(ok=True, counts=db.count_training(session["user_id"]))


@app.route("/api/predict", methods=["POST"])
@login_required
def api_predict():
    data = request.get_json(silent=True) or {}
    kind = data.get("kind")
    prompt = (data.get("prompt") or "").strip()
    try:
        steps = max(0, min(int(data.get("steps", 0)), 20))
    except (TypeError, ValueError):
        steps = 0
    if kind not in ("word", "digit") or not prompt:
        return jsonify(error="kind (word/digit) aur prompt zaroori hai"), 400

    uid = session["user_id"]
    if kind == "word":
        model = build_word_model(db.get_training(uid, "word"))
        tokens = tokenize_words(prompt)
        sep = " "
    else:
        model = build_digit_model(db.get_training(uid, "digit"))
        tokens = tokenize_digits(prompt)
        sep = ""

    if not tokens:
        return jsonify(error="Prompt me valid " + ("words" if kind == "word" else "digits") + " nahi mile"), 400

    suggestions = model.predict(tokens, top_k=5)

    # scenario / continuation: top prediction ko bar bar aage barha kar
    continuation = []
    ctx = list(tokens)
    for _ in range(steps):
        nxt = model.predict(ctx, top_k=1)
        if not nxt:
            break
        continuation.append(nxt[0][0])
        ctx.append(nxt[0][0])

    result = {
        "suggestions": [{"token": t, "probability": p} for t, p in suggestions],
        "continuation": sep.join(continuation),
        "full_text": sep.join(tokens + continuation),
    }
    top = suggestions[0][0] if suggestions else "-"
    db.save_prediction(
        uid, kind, prompt,
        json.dumps({"next": top, "continuation": result["continuation"]}, ensure_ascii=False),
    )
    return jsonify(result)


@app.route("/api/history")
@login_required
def api_history():
    return jsonify(history=db.get_history(session["user_id"], 20))


@app.route("/api/reset", methods=["POST"])
@login_required
def api_reset():
    db.clear_training(session["user_id"])
    return jsonify(ok=True, counts=db.count_training(session["user_id"]))


if __name__ == "__main__":
    app.run(debug=False, host="127.0.0.1", port=5000)
