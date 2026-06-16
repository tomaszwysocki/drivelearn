import os, re, requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "")
SENDER_EMAIL  = os.environ.get("SENDER_EMAIL", "")   # twoj@gmail.com (zweryfikowany w Brevo)
VIDEO_URL     = os.environ.get("VIDEO_URL", "")

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def send_video_email(to: str):
    requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={"api-key": BREVO_API_KEY, "Content-Type": "application/json"},
        json={
            "sender":      {"name": "DriveLearn", "email": SENDER_EMAIL},
            "to":          [{"email": to}],
            "subject":     "🎬 Twój film instruktażowy — DriveLearn",
            "htmlContent": f"""
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;
                        background:#07090f;color:#e4e8f0;padding:40px 32px;
                        border-radius:16px;border:1px solid #1e2d45">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;
                        text-transform:uppercase;color:#f5a500;font-weight:600">DriveLearn</p>
              <h1 style="margin:0 0 18px;font-size:24px;color:#fff;font-weight:800">
                Twój film jest gotowy 🚗
              </h1>
              <p style="margin:0 0 28px;color:#94a3b8;line-height:1.7;font-size:15px">
                Kliknij poniżej, aby obejrzeć film instruktażowy:
              </p>
              <a href="{VIDEO_URL}"
                 style="display:inline-block;background:#f5a500;color:#07090f;
                        text-decoration:none;padding:14px 32px;border-radius:10px;
                        font-weight:700;font-size:15px">
                ▶&nbsp;&nbsp;Obejrzyj film
              </a>
              <p style="margin:36px 0 0;color:#475569;font-size:12px;
                        border-top:1px solid #1e2d45;padding-top:20px">
                Projekt akademicki · DriveLearn
              </p>
            </div>"""
        },
        timeout=10
    ).raise_for_status()


@app.post("/api/subscribe")
def subscribe():
    data  = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not _EMAIL_RE.match(email):
        return jsonify({"error": "Nieprawidłowy adres e-mail"}), 400

    send_video_email(email)
    return jsonify({"message": "Film wysłany!"}), 200


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)