# Epistulae Backend (FastAPI) – für lokale Entwicklung mit Docker
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY firebase.json .firebaserc ./

# Bei Nutzung der Emulatoren: Backend verbindet sich mit Host "firebase" (Service-Name)
ENV FIRESTORE_EMULATOR_HOST=firebase:8080

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
