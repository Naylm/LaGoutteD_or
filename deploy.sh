#!/bin/bash
set -e

REMOTE="root@88.214.57.137"
DOMAIN="lagouttedor.agartha.cc"
DIR="/opt/lagouttedor"
# COMPOSE_FILE="docker-compose.prod.yml"  # si tu n'as pas de Traefik
COMPOSE_FILE="docker-compose.traefik-existing.yml"  # si tu as déjà Traefik

echo "Déploiement de La Goutte d'Or sur ${REMOTE}..."

# 1. Vérifier que le fichier .env existe en local
if [ ! -f .env ]; then
  echo "Erreur : fichier .env manquant. Copie .env.example vers .env et remplis-le."
  exit 1
fi

# 2. Envoyer le code sur le serveur (sauf node_modules et dist)
ssh ${REMOTE} "mkdir -p ${DIR}"
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='client/node_modules' \
  --exclude='server/node_modules' \
  --exclude='client/dist' \
  --exclude='data/*.db-shm' \
  --exclude='data/*.db-wal' \
  ./ ${REMOTE}:${DIR}/

# 3. Créer les dossiers de données et uploads
ssh ${REMOTE} "mkdir -p ${DIR}/data ${DIR}/uploads ${DIR}/letsencrypt"

# 4. Construire et démarrer les conteneurs
ssh ${REMOTE} "cd ${DIR} && docker compose -f ${COMPOSE_FILE} down && docker compose -f ${COMPOSE_FILE} up -d --build"

# 5. Afficher les logs
ssh ${REMOTE} "cd ${DIR} && docker compose -f ${COMPOSE_FILE} logs --tail=50 -f"
