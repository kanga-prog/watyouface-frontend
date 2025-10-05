# 🔹 Image Python légère
FROM python:3.11.8-slim

# 🔹 Variables d'environnement pour pip
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 🔹 Répertoire de travail
WORKDIR /app

# 🔹 Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 🔹 Copier uniquement les requirements pour bénéficier du cache Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 🔹 Copier l'ensemble de l'application
COPY . .

# 🔹 Exposer le port utilisé par Gunicorn
EXPOSE 5000

# 🔹 Commande par défaut pour lancer le backend
CMD ["gunicorn", "-b", "0.0.0.0:5000", "run:app"]
