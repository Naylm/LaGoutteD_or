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

### Hébergement simple

```bash
cp .env.example .env
# Modifier EDITOR_TOKEN
docker-compose up -d --build
```

Le site est accessible sur http://localhost:3000.

### Hébergement derrière Traefik (sous-domaine)

Éditez `docker-compose.traefik.yml`, remplacez `lagouttedor.example.com` par votre sous-domaine, puis :

```bash
docker-compose -f docker-compose.traefik.yml up -d --build
```

Assurez-vous d'être dans le réseau `traefik` externe.

## Mode éditeur

Accédez à `/editeur/<EDITOR_TOKEN>` pour créer/modifier les cocktails, ingrédients et catégories. Le token par défaut est `dev-token-secret` en développement.

## Fonctionnalités

- Navigation par onglets sur une seule page défilante
- Jauge Guinness indiquant la progression du défilement
- Cartes cocktails tactiles affichant les ingrédients au tap
- Filtrage par catégories/sous-catégories d'ingrédients
- Suppression automatique des cocktails non réalisables si un ingrédient manque
- Design mobile-first avec palette personnalisée
