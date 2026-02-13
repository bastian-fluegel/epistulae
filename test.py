import os
import warnings
from google import genai
from dotenv import load_dotenv

# Unterdrücke Warnings
warnings.filterwarnings('ignore')

# Lade Umgebungsvariablen aus .env Datei
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ Fehler: Kein API Key gefunden!")
    exit(1)

client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain how AI works in a few words",
)

print(response.text)