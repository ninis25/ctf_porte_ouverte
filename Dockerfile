# Image de base Node.js
FROM node:18-alpine

# Installer les dépendances nécessaires
RUN apk add --no-cache python3 make g++

# Installer Python et pip
RUN apk add --no-cache python3 py3-pip

# Installer les dépendances Python
RUN pip3 install Pillow piexif

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances avec une configuration plus sûre
RUN npm install --production --silent && \
    npm cache clean --force

# Copier le reste des fichiers de l'application
COPY . .

# Générer l'image du challenge 2
RUN python3 scripts/generate_challenge2_image.py

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application
CMD ["node", "app.js"] 