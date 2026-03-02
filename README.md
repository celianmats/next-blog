# Republik Multisite

🚀 **Plateforme d'actualités multi-langues inspirée par Republik.ch avec support RTL complet (Anglais, Français, Arabe).**

Ce projet est un monorepo géré par [Turborepo](https://turbo.build/) contenant les applications et packages nécessaires pour faire fonctionner la plateforme.

## �️ Structure du Projet

```text
.
├── apps/
│   ├── admin/      # Dashboard d'administration (Next.js)
│   ├── api/        # Serveur GraphQL (Apollo Server / Node.js)
│   └── web/        # Application publique (Next.js avec i18n)
├── packages/
│   └── ui/         # Composants UI partagés et design system
├── docker-compose.yml # Infrastructure (PostgreSQL, Redis, Elasticsearch)
└── package.json    # Scripts de gestion du monorepo
```

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js**: v20+
- **Yarn**: v1.22+
- **Docker**: Pour l'infrastructure

### 1. Installation & Récupération de la plateforme
```bash
# Cloner le dépôt Republik pour les assets et la structure de base
git clone https://github.com/republik/plattform.git mon-blog
cd mon-blog

# Installer les dépendances du monorepo actuel
yarn install
```

### 2. Configuration Environnement (.env)
Configurez les fichiers d'environnement pour toutes les applications :
```bash
cp apps/www/.env.example apps/www/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/api/.env.example apps/api/.env
cp apps/assets/.env.example apps/assets/.env
```

### 3. Lancer l'infrastructure
Démarrez les services essentiels (Postgres, Redis, Elasticsearch) :
```bash
docker compose up -d
```

### 5. Lancer le développement
Lancez tout le monorepo en une commande :
```bash
yarn dev
```

### Connexion App Admin
```bash
admin@republik.local
admin123
```

Accès :
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **Admin App**: [http://localhost:3001](http://localhost:3001)
- **GraphQL API**: [http://localhost:5010/graphql](http://localhost:5010/graphql)

## �️ Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `yarn dev` | Lance tous les services en développement |
| `yarn build` | Build tous les services pour la production |
| `yarn project:setup` | **Nouveau** : Configure tous les fichiers `.env` |
| `yarn docker:up` | Démarre les containers Docker |
| `yarn db:migrate` | Applique les migrations SQL (recommandé) |
| `yarn db:seed` | Ajoute les données de démonstration |
| `yarn db:reset` | **Attention** : Reset complet (supprime toutes les données !) |

## 🌐 Fonctionnalités Clés

- **Multi-langue**: Support natif de l'Anglais, Français et Arabe.
- **RTL Support**: Détection automatique et mise en page adaptée pour l'Arabe.
- **GraphQL API**: API unifiée pour le web et l'admin.
- **Monorepo**: Partage de code efficace entre les applications via Turborepo.

## � Sécurité
Avant de passer en production, assurez-vous de changer les mots de passe par défaut dans les fichiers `.env` et de suivre la checklist de sécurité dans `DEPLOYMENT_GUIDE.md`.

---
Inspiré par **Republik.ch** | Multi-language | RTL Support | Open Source
