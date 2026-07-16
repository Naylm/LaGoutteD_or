# La Goutte d'Or

Site de recettes de cocktails, avec un mode éditeur pour gérer les cocktails, les ingrédients et les catégories.

## Stack

- React + Vite + TailwindCSS
- Express.js + SQLite (sqlite3)
- Docker + docker-compose

## Développement local

```bash
# Installer les dépendances
cd client && npm install
cd ../server && npm install

# Lancer le serveur (sert le frontend buildé)
cd ../server && npm start

# Ou, pour le développement frontend avec rechargement
npm run dev
```

Le serveur est sur http://localhost:3001 et sert le frontend buildé.

## Production avec Docker

### Déploiement complet (Traefik + SSL)

Pour déployer sur un serveur Ubuntu avec Docker, voir `DEPLOY.md`.

Résumé rapide :

```bash
cp .env.example .env
# Modifier EDITOR_USERNAME et EDITOR_PASSWORD
docker compose -f docker-compose.prod.yml up -d --build
```

Le site sera accessible sur `https://lagouttedor.agartha.cc`.

### Hébergement simple (local)

```bash
cp .env.example .env
# Modifier les identifiants
docker compose up -d --build
```

Le site est accessible sur http://localhost:3000.

### Hébergement derrière un Traefik externe

Éditez `docker-compose.traefik.yml`, remplacez `lagouttedor.example.com` par votre sous-domaine, puis :

```bash
docker compose -f docker-compose.traefik.yml up -d --build
```

Assurez-vous d'être dans le réseau `traefik` externe.

## Déploiement automatisé depuis Windows

Le script `deploy.sh` envoie le code sur le serveur et redémarre les conteneurs :

```bash
# Sous Git Bash / WSL / Ubuntu
bash deploy.sh
```

> Nécessite `rsync` et une connexion SSH configurée.

## Mode éditeur

Accédez à `/editeur` pour créer/modifier les cocktails, ingrédients, catégories et pages. Les identifiants par défaut sont définis dans `.env` (`EDITOR_USERNAME` / `EDITOR_PASSWORD`).

## Fonctionnalités

- Navigation par onglets sur une seule page défilante
- Jauge Guinness indiquant la progression du défilement
- Cartes cocktails tactiles affichant les ingrédients au tap
- Filtrage par catégories/sous-catégories d'ingrédients
- Gestion des pages, cocktails, ingrédients et catégories via éditeur sécurisé
- Upload d'images par drag & drop
- Design mobile-first avec palette personnalisée
