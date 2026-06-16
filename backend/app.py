# =====================================================
#  DriveLearn — Backend Flask (Gmail SMTP)
#  Uruchomienie:  python app.py
#  Wymagania:     pip install -r requirements.txt
# =====================================================

import os, re
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message

app = Flask(__name__)
CORS(app)

app.config.update(
    SQLALCHEMY_DATABASE_URI = "sqlite:///drivelearn.db",
    SQLALCHEMY_TRACK_MODIFICATIONS = False,
    # ── Gmail SMTP ──────────────────────────────────
    MAIL_SERVER   = "smtp.gmail.com",
    MAIL_PORT     = 587,
    MAIL_USE_TLS  = True,
    MAIL_USERNAME = os.environ.get("GMAIL_ADDRESS"),
    MAIL_PASSWORD = os.environ.get("GMAIL_APP_PASS"),
)

db   = SQLAlchemy(app)
mail = Mail(app)

VIDEO_URL = os.environ.get("VIDEO_URL", "")


# ─────────────────────────────────────────────────────
#  MODEL
# ─────────────────────────────────────────────────────
class Subscriber(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    email      = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ─────────────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────────────
_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _email_html() -> str:
    return f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;
                background:#07090f;color:#e4e8f0;padding:40px 32px;
                border-radius:16px;border:1px solid #1e2d45">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;
                text-transform:uppercase;color:#f5a500;font-weight:600">DriveLearn</p>
      <h1 style="margin:0 0 18px;font-size:24px;color:#fff;font-weight:800;letter-spacing:-0.5px">
        Twój film jest gotowy 🚗
      </h1>
      <p style="margin:0 0 28px;color:#94a3b8;line-height:1.7;font-size:15px">
        Cześć! Dziękujemy za zainteresowanie materiałami instruktażowymi.<br>
        Kliknij poniżej, aby obejrzeć film:
      </p>
      <a href="{VIDEO_URL}"
         style="display:inline-block;background:#f5a500;color:#07090f;text-decoration:none;
                padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px">
        ▶&nbsp;&nbsp;Obejrzyj film instruktażowy
      </a>
      <p style="margin:36px 0 0;color:#475569;font-size:12px;line-height:1.6;
                border-top:1px solid #1e2d45;padding-top:20px">
        Projekt akademicki · DriveLearn<br>
        Jeśli nie zamawiałeś/aś tego e-maila, możesz go zignorować.
      </p>
    </div>
    """


# ─────────────────────────────────────────────────────
#  ENDPOINT: POST /api/subscribe
# ─────────────────────────────────────────────────────
@app.post("/api/subscribe")
def subscribe():
    data  = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not _EMAIL_RE.match(email):
        return jsonify({"error": "Nieprawidłowy adres e-mail"}), 400

    if Subscriber.query.filter_by(email=email).first():
        return jsonify({
            "message": "Ten adres jest już zarejestrowany — sprawdź swoją skrzynkę!"
        }), 200

    db.session.add(Subscriber(email=email))
    db.session.commit()

    try:
        msg = Message(
            subject    = "🎬 Twój film instruktażowy — DriveLearn",
            sender     = f"DriveLearn <{app.config['MAIL_USERNAME']}>",
            recipients = [email],
        )
        msg.html = _email_html()
        mail.send(msg)
    except Exception as exc:
        app.logger.error("Błąd wysyłki e-mail: %s", exc)

    return jsonify({
        "message": "Gotowe! Film instruktażowy jest już w drodze do Twojej skrzynki."
    }), 201


# ─────────────────────────────────────────────────────
#  HEALTHCHECK
# ─────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"}), 200


# ─────────────────────────────────────────────────────
#  START
# ─────────────────────────────────────────────────────
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("✓ Baza danych gotowa")
    app.run(debug=True, port=5000)
