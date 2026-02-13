"""
Epistulae – FastAPI Backend mit SSR.
Erste Oberfläche: Brief von Sokrates, drei Antwortoptionen.
"""
import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from jinja2 import Environment, FileSystemLoader

app = FastAPI(title="Epistulae", version="0.1.0")

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"
STATIC_DIR = Path(__file__).resolve().parent / "static"
env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))

# Statischer erster Brief (später aus DB/AI)
ERSTER_BRIEF = {
    "text": (
        "Grüße, Freund! Ich bin durch eine mir unerklärliche Laune der Götter "
        "in eure Zeit geworfen worden. Alles hier verwirrt mich: die leuchtenden "
        "Schachteln, in die die Menschen starr blicken; die Wagen ohne Pferde; "
        "die Fülle an Dingen, die niemand zu brauchen scheint und doch begehrt. "
        "Sag mir – was hält diese Welt im Innersten zusammen? Und was hält dich?"
    ),
    "antworten": [
        "Vielleicht hält uns gar nichts – wir rennen einfach mit.",
        "Ich denke, es geht um Verbindung: zu anderen, zu etwas, das größer ist als man selbst.",
        "Die Frage stelle ich mir auch. Vielleicht ist das Suchen schon die halbe Antwort.",
    ],
}


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Startseite: Brief von Sokrates mit drei Antwortoptionen (SSR)."""
    template = env.get_template("index.html")
    html = template.render(
        brief=ERSTER_BRIEF,
        use_emulator=os.getenv("USE_FIREBASE_EMULATOR", "false").lower() == "true",
    )
    return HTMLResponse(html)


if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
