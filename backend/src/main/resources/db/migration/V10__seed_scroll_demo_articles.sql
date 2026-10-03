-- Compte de démonstration local pour tester le fil d’actualité et sa pagination.
INSERT INTO users (username, email, password_hash, role)
VALUES (
    'demo',
    'scroll-demo@orion.local',
    crypt('Orion2026!', gen_salt('bf', 12)),
    'USER'
)
ON CONFLICT (username) DO UPDATE
SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    updated_at = CURRENT_TIMESTAMP;

-- Le compte suit tous les thèmes présents afin de voir tous les articles de démonstration.
INSERT INTO subscriptions (user_id, topic_id)
SELECT users.id, topics.id
FROM users
CROSS JOIN topics
WHERE users.username = 'demo'
ON CONFLICT (user_id, topic_id) DO NOTHING;

WITH seed_articles (position, title, slug, content, topic_name) AS (
    VALUES
        (1, 'Préparer une API REST', 'preparer-une-api-rest',
         'Une API REST claire commence par des ressources bien nommées, des statuts HTTP cohérents et un contrat partagé. Cette base facilite le travail du front comme du back.', 'Spring Boot'),
        (2, 'Bien démarrer avec Spring', 'bien-demarrer-avec-spring',
         'Un projet Spring Boot reste plus simple à faire évoluer lorsque les contrôleurs restent minces et que les règles métier vivent dans des services dédiés.', 'Spring Boot'),
        (3, 'Écrire un test utile', 'ecrire-un-test-utile',
         'Un test utile vérifie un comportement important pour l utilisateur ou le métier. Il doit donner confiance sans reproduire l implémentation ligne par ligne.', 'Java'),
        (4, 'Comprendre les signaux Angular', 'comprendre-les-signaux-angular',
         'Les signaux représentent un état réactif lisible dans Angular. Ils sont pratiques pour exposer une liste, un chargement ou une erreur à un composant.', 'Angular'),
        (5, 'Organiser un projet Angular', 'organiser-un-projet-angular',
         'Une structure par fonctionnalités réunit les pages, services et composants liés à un besoin. Le code devient plus facile à trouver quand le projet grandit.', 'Angular'),
        (6, 'Choisir une migration Flyway', 'choisir-une-migration-flyway',
         'Chaque évolution du schéma mérite une migration courte et explicite. Flyway permet de reproduire la même base de données sur chaque environnement.', 'DevOps'),
        (7, 'Lire des logs efficacement', 'lire-des-logs-efficacement',
         'Des logs structurés avec un identifiant de ressource et le contexte métier permettent de diagnostiquer un problème sans afficher de données sensibles.', 'DevOps'),
        (8, 'Sécuriser une API JWT', 'securiser-une-api-jwt',
         'Un token JWT doit être vérifié à chaque appel protégé. Le backend valide sa signature et ses dates avant de construire l identité de l utilisateur.', 'Spring Boot'),
        (9, 'Créer un DTO clair', 'creer-un-dto-clair',
         'Un DTO décrit précisément les données échangées par une API. Il évite de rendre une entité de persistance dépendante des besoins de l interface.', 'Java'),
        (10, 'Éviter les requêtes N plus un', 'eviter-les-requetes-n-plus-un',
         'Une requête N plus un apparaît lorsqu une collection charge une relation pour chaque élément. Observer les requêtes SQL permet de la repérer rapidement.', 'Java'),
        (11, 'Déboguer une erreur HTTP', 'debuguer-une-erreur-http',
         'Pour comprendre une erreur HTTP, commencez par le statut, le message ProblemDetail et la requête envoyée. Ces éléments indiquent souvent la bonne frontière à examiner.', 'JavaScript'),
        (12, 'Utiliser Git au quotidien', 'utiliser-git-au-quotidien',
         'Des commits petits et cohérents facilitent la relecture et le retour en arrière. Un message de commit doit expliquer l intention de la modification.', 'DevOps'),
        (13, 'Tester un formulaire Angular', 'tester-un-formulaire-angular',
         'Les tests de formulaire vérifient les règles de validation, l appel au service et la réaction aux erreurs. Les scénarios de parcours complet restent pour Cypress.', 'Angular'),
        (14, 'Construire une page responsive', 'construire-une-page-responsive',
         'Une page responsive part des petits écrans puis adapte sa grille aux écrans larges. Les composants gardent ainsi une structure stable quel que soit le viewport.', 'Angular'),
        (15, 'Déployer une application simple', 'deployer-une-application-simple',
         'Un déploiement fiable commence par une configuration externalisée et une procédure reproductible. Les secrets ne doivent jamais être intégrés au dépôt.', 'DevOps'),
        (16, 'Comprendre les index SQL', 'comprendre-les-index-sql',
         'Un index accélère les recherches fréquentes mais a un coût lors des écritures. Il doit correspondre aux filtres et aux tris réellement utilisés.', 'Java'),
        (17, 'Écrire un commentaire utile', 'ecrire-un-commentaire-utile',
         'Un commentaire utile explique une décision ou une contrainte qui ne peut pas être comprise en lisant seulement le code. Il ne répète pas le code.', 'JavaScript'),
        (18, 'Gérer les erreurs API', 'gerer-les-erreurs-api',
         'ProblemDetail fournit un format uniforme pour les erreurs HTTP. Le front peut afficher le détail sans dépendre de messages construits localement.', 'Spring Boot'),
        (19, 'Préparer une revue de code', 'preparer-une-revue-de-code',
         'Une revue est plus efficace quand la modification est petite, testée et accompagnée du contexte nécessaire. Les remarques doivent rester précises et actionnables.', 'DevOps'),
        (20, 'Automatiser la CI', 'automatiser-la-ci',
         'La CI exécute les contrôles importants à chaque changement : compilation, tests et analyse. Elle donne un retour rapide avant la livraison.', 'DevOps'),
        (21, 'Améliorer la pagination', 'ameliorer-la-pagination',
         'La pagination évite de transférer une liste entière. Le front demande des pages courtes et ajoute les résultats quand l utilisateur arrive en bas du fil.', 'JavaScript'),
        (22, 'Comprendre Docker Compose', 'comprendre-docker-compose',
         'Docker Compose décrit les services locaux nécessaires au projet. Il rend le démarrage de la base de données plus reproductible pour toute l équipe.', 'DevOps'),
        (23, 'Planifier une évolution', 'planifier-une-evolution',
         'Avant une évolution, identifier le contrat, les données et les écrans concernés limite les surprises. Des étapes petites rendent le travail plus facile à vérifier.', 'JavaScript'),
        (24, 'Documenter une décision', 'documenter-une-decision',
         'Documenter une décision importante aide les personnes qui arrivent sur le projet. Le document doit expliquer le contexte, le choix et ses conséquences.', 'Python')
)
INSERT INTO articles (title, slug, content, author_id, topic_id, created_at, updated_at)
SELECT
    seed_articles.title,
    seed_articles.slug,
    seed_articles.content,
    users.id,
    topics.id,
    CURRENT_TIMESTAMP - (seed_articles.position * INTERVAL '2 hours'),
    CURRENT_TIMESTAMP - (seed_articles.position * INTERVAL '2 hours')
FROM seed_articles
JOIN users ON users.username = 'demo'
JOIN topics ON topics.name = seed_articles.topic_name
ON CONFLICT (slug) DO NOTHING;
