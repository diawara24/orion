# Orion

Orion est une application communautaire autour de la programmation. Un utilisateur peut créer un compte, suivre des thèmes, publier des articles et échanger au moyen de commentaires.

Le projet suit une approche **API first** : le contrat [openapi/openapi.yaml](openapi/openapi.yaml) est la source de vérité de l’API. Il sert à générer les interfaces et DTO du backend Spring, ainsi que le client Angular.

## Structure du projet

- `frontend/` : application Angular 22.
- `backend/` : API REST Spring Boot 4, PostgreSQL et Flyway.
- `openapi/` : contrat OpenAPI.

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

PostgreSQL est alors disponible sur le port `5433`, avec la base, l’utilisateur et le mot de passe `orion`.

### Backend

Lors de la première configuration locale, créer `backend/.env` à partir du modèle :

```powershell
cd backend
Copy-Item .env.example .env
```

Le fichier `backend/.env` est chargé automatiquement par la dépendance `spring-dotenv` au démarrage et est ignoré par Git.

La clé `JWT_SECRET` doit être encodée en Base64 et contenir au moins 32 octets. Exécuter cette commande dans PowerShell pour en générer une :

```powershell
$randomNumberGenerator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
try {
    $randomNumberGenerator.GetBytes($bytes)
    [Convert]::ToBase64String($bytes)
} finally {
    $randomNumberGenerator.Dispose()
}
```

Copier la valeur affichée dans `backend/.env`, après `JWT_SECRET=` :

```env
JWT_SECRET=collez-ici-la-valeur-generee
```

```powershell
mvn spring-boot:run
```

L'API est disponible sous `http://localhost:8080/api/v1`.

La documentation interactive est accessible à l'adresse `http://localhost:8080/api/v1/swagger-ui/index.html`.

### Compte de démonstration

Après l'exécution des migrations Flyway, un compte local permet de tester le fil d’actualité

- Nom d’utilisateur : `demo`
- E-mail : `scroll-demo@orion.local`
- Mot de passe : `Orion2026!`

### Frontend

```powershell
cd frontend
npm install
npm start
```

L'application Angular est disponible sur `http://localhost:4200`.

## Fonctionnalités du MVP

- Inscription et connexion avec JWT Bearer.
- Consultation et modification du profil.
- Liste des thèmes, abonnement et désabonnement.
- Fil des articles des thèmes suivis, avec pagination et tri.
- Publication et consultation détaillée d’articles.
- Lecture et ajout de commentaires.
- Réponses d’erreur au format RFC 9457 `ProblemDetail`.

## Mettre à jour le contrat API

Après une modification de `openapi/openapi.yaml`, regénérer les sources avant de compiler :

```powershell
cd backend
mvn generate-sources

cd ../frontend
npm run api:generate
```

## Tests et couverture

### Backend

```powershell
mvn clean test
```

Cette commande exécute les tests, génère les sources à partir du contrat OpenAPI et produit le rapport de couverture JaCoCo dans `backend/target/site/jacoco/index.html`.

### Frontend

```powershell
cd frontend
npm test
npm run cypress:run
```

## État actuel

- Contrat OpenAPI, génération de code et Swagger UI configurés.
- Authentification JWT stateless avec rôles `USER` et `ADMIN`.
- PostgreSQL, migrations Flyway et base H2 isolée pour les tests.
- Tests unitaires, d’intégration backend et tests end-to-end Cypress.
