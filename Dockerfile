# Image de base Node.js
FROM node:18-alpine

# Installer les dépendances système
RUN apk add --no-cache \
    python3 \
    py3-pillow \
    py3-pip \
    make \
    g++ \
    jpeg-dev \
    zlib-dev

# Créer un utilisateur non-root pour pip
RUN adduser -D pythonuser

# Installer piexif en tant qu'utilisateur non-root
USER pythonuser
RUN pip3 install --user --no-cache-dir piexif

# Revenir à l'utilisateur root pour la suite
USER root

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances Node.js
RUN npm install --production --silent && \
    npm cache clean --force

# Copier le reste des fichiers de l'application
COPY . .

# Créer le dossier images s'il n'existe pas
RUN mkdir -p public/images && \
    chown -R pythonuser:pythonuser public/images

# Générer l'image du challenge 2 en tant qu'utilisateur non-root
USER pythonuser
RUN PYTHONPATH=/home/pythonuser/.local/lib/python3.11/site-packages python3 scripts/generate_challenge2_image.py

# Revenir à root pour le démarrage
USER root

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application
CMD ["node", "app.js"] 