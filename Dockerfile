# Image de base Python pour générer l'image
FROM python:3.9-slim as builder

# Installer les dépendances Python
RUN pip install --no-cache-dir Pillow piexif

# Copier le script de génération
COPY scripts/generate_challenge2_image.py /app/
WORKDIR /app

# Créer le dossier pour l'image
RUN mkdir -p public/images

# Générer l'image
RUN python generate_challenge2_image.py

# Image finale Node.js
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances Node.js
RUN npm install --production --silent

# Copier les fichiers de l'application
COPY . .

# Copier l'image générée depuis le builder
COPY --from=builder /app/public/images/challenge2.jpg public/images/

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["node", "app.js"] 