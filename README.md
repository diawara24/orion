# Orion

Orion est une application communautaire autour de la programmation. Les utilisateurs peuvent s'inscrire, s'abonner à des sujets, publier des articles et interagir via des commentaires.

Le projet est construit selon une approche **API first** : le contrat OpenAPI est la source de vérité de l'API avant son implémentation.

## Structure du projet

- `frontend/` : application Angular.
- `backend/` : API Spring Boot.
- `openapi/openapi.yaml` : contrat de l'API.

## Prérequis

- Java 21
- Maven 3.9 ou supérieur
- Node.js et npm
- Docker Desktop, pour démarrer PostgreSQL localement

## Démarrer l'environnement local

### Base de données

Depuis le dossier `backend/` :

```powershell
docker compose up -d
```

PostgreSQL est alors disponible sur le port `5433`, avec la base, l'utilisateur et le mot de passe `orion`.

### Backend

Le backend nécessite la variable d'environnement `JWT_SECRET`, une clé Base64 d'au moins 32 octets.

```powershell
$env:JWT_SECRET = "votre-cle-base64"
cd backend
mvn spring-boot:run
```

L'API est disponible sous `http://localhost:8080/api/v1`.

La documentation interactive est accessible à l'adresse `http://localhost:8080/api/v1/swagger-ui/index.html`.

### Frontend

```powershell
cd frontend
npm install
npm start
```

L'application Angular est disponible sur `http://localhost:4200`.

## Tests et couverture

Depuis `backend/` :

```powershell
mvn clean test
```

Cette commande exécute les tests, génère les sources à partir du contrat OpenAPI et produit le rapport de couverture JaCoCo dans `backend/target/site/jacoco/index.html`.

## État actuel

- Contrat OpenAPI versionné et génération des interfaces Spring/DTO.
- Gestion des erreurs basée sur `ProblemDetail`.
- Inscription, authentification JWT et accès stateless.
- PostgreSQL, Flyway et tests H2.

Ce README sera complété à mesure que les fonctionnalités et les choix d'architecture évolueront.
