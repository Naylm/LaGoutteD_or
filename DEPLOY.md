# Déploiement sur Ubuntu 22.04/24.04

IP serveur : `88.214.57.137`  
Nom de domaine : `lagouttedor.agartha.cc`

## 1. Préparer le serveur

Se connecter en SSH :

```bash
ssh root@88.214.57.137
```

Mettre à jour le système et installer Docker + Docker Compose :

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 2. Cloner le projet

```bash
cd /opt
git clone https://github.com/Naylm/LaGoutteD_or.git lagouttedor
cd lagouttedor
```

## 3. Créer le fichier d'environnement

Créer `/opt/lagouttedor/.env` (il n'est pas dans l'image Docker, il est lu par docker-compose) :

```bash
nano /opt/lagouttedor/.env
```

Contenu à adapter :

```env
PORT=3000
NODE_ENV=production
EDITOR_USERNAME=Topaze
EDITOR_PASSWORD=Mera
DATA_DIR=/app/data
```

> Remplace `Topaze` / `Mera` par tes vrais identifiants éditeur.

## 4. Créer les dossiers persistants

```bash
mkdir -p /opt/lagouttedor/data
mkdir -p /opt/lagouttedor/uploads
mkdir -p /opt/lagouttedor/letsencrypt
```

## 5. Lancer le déploiement

### Scénario A : Tu n'as pas encore de Traefik sur ce serveur

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Ce fichier déploie Traefik en plus de l'application. Vérifie que les ports 80 et 443 sont libres avant.

### Scénario B : Tu as déjà Traefik qui tourne

Si tu as déjà un Traefik avec le réseau Docker `traefik` en place, utilise plutôt :

```bash
docker network create traefik  # si le réseau n'existe pas encore
docker compose -f docker-compose.traefik-existing.yml up -d --build
```

Cela ne lance **qu'un seul container** (l'application) et s'attache à ton Traefik existant. Aucun conflit de port.

Vérifier les logs :

```bash
docker compose -f docker-compose.prod.yml logs -f
# ou
# docker compose -f docker-compose.traefik-existing.yml logs -f
```

Attendre que Traefik génère le certificat Let's Encrypt (1-2 minutes).

## 6. Ouvrir le site

- Site : `https://lagouttedor.agartha.cc`
- Éditeur : `https://lagouttedor.agartha.cc/editeur`

## 7. Redéployer après une mise à jour

```bash
cd /opt/lagouttedor
git pull
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

## 8. Sauvegardes

Les données importantes sont dans :

- `/opt/lagouttedor/data/lagouttedor.db`
- `/opt/lagouttedor/uploads/`

Pour sauvegarder :

```bash
tar czf backup-lagouttedor-$(date +%Y%m%d).tar.gz /opt/lagouttedor/data /opt/lagouttedor/uploads
```

## Notes

- Le port 80 et 443 doivent être ouverts dans le firewall (`ufw allow 80/tcp && ufw allow 443/tcp`).
- Le DNS de `lagouttedor.agartha.cc` doit pointer sur `88.214.57.137`.
- Le certificat SSL est géré automatiquement par Let's Encrypt via Traefik.
