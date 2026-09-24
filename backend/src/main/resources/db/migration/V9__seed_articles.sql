INSERT INTO users (username, email, password_hash, role)
VALUES (
    'orion-demo',
    'demo@orion.local',
    crypt(gen_random_uuid()::TEXT, gen_salt('bf', 12)),
    'USER'
)
ON CONFLICT DO NOTHING;

WITH seed_articles (title, slug, content, topic_name, created_at) AS (
    VALUES
        (
            'Java 21 : les fonctionnalités à adopter dans un nouveau projet',
            'bien-demarrer-avec-java-21',
            E'Java 21 est une version LTS qui constitue une base solide pour démarrer un projet. Les records restent particulièrement utiles pour représenter des données immuables, par exemple des réponses d API ou des objets de configuration. Les classes scellées permettent quant à elles de modéliser un ensemble fermé de cas métier et rendent le code plus explicite.\n\nAvant d adopter chaque nouveauté, l essentiel est de conserver une convention d équipe simple. Choisir une version LTS, activer les outils de qualité et écrire des tests sur les règles métier apporte davantage de valeur que d utiliser toutes les nouveautés du langage. Java 21 donne surtout un socle durable pour faire évoluer une application sans multiplier les compromis.',
            'Java',
            CURRENT_TIMESTAMP - INTERVAL '6 days'
        ),
        (
            'Concevoir une API REST Spring Boot qui reste facile à faire évoluer',
            'construire-une-api-rest-avec-spring-boot',
            E'Une API REST maintenable commence par un contrat partagé. Décrire les endpoints, les paramètres, les réponses et les erreurs dans OpenAPI donne au front et au back la même référence avant même la première implémentation. Les DTO protègent ensuite le modèle de persistance : une entité JPA ne devrait pas devenir un format de transport par accident.\n\nCôté Spring Boot, regrouper la logique métier dans des services, centraliser les erreurs avec ProblemDetail et valider les requêtes à la frontière de l application rend les évolutions plus prévisibles. Les tests d intégration doivent vérifier les statuts HTTP et les réponses réelles, pas uniquement les méthodes Java isolées.',
            'Spring Boot',
            CURRENT_TIMESTAMP - INTERVAL '5 days'
        ),
        (
            'Structurer une application Angular autour des fonctionnalités métier',
            'organiser-une-application-angular',
            E'Quand une application Angular grandit, classer tous les composants dans un même dossier devient vite difficile à maintenir. Une organisation par fonctionnalité permet au contraire de réunir les pages, composants, services et modèles liés à un même besoin métier. Le module ou dossier articles contient ainsi ce qui concerne la consultation et la publication, tandis que les éléments réutilisables restent dans shared.\n\nCette approche facilite aussi le lazy loading : une fonctionnalité peu consultée peut être chargée seulement quand l utilisateur y accède. Le but n est pas de créer une arborescence complexe, mais de permettre à une personne qui arrive sur le projet de trouver rapidement où effectuer une modification.',
            'Angular',
            CURRENT_TIMESTAMP - INTERVAL '4 days'
        ),
        (
            'TypeScript : cinq habitudes qui évitent beaucoup de bugs côté front',
            'les-bases-de-typescript',
            E'TypeScript apporte surtout une aide à la conception. Décrire les formes de données reçues par une API, éviter any et préférer unknown pour les données non contrôlées permet de détecter de nombreuses erreurs avant l exécution. Les unions discriminées sont également très pratiques pour représenter un état de chargement, de succès ou d erreur dans une interface.\n\nLe compilateur ne remplace pas la validation des données externes. Une réponse HTTP peut être invalide malgré un type déclaré dans le code. Le contrat OpenAPI et une validation au niveau de la frontière restent donc complémentaires des types TypeScript.',
            'JavaScript',
            CURRENT_TIMESTAMP - INTERVAL '3 days'
        ),
        (
            'Automatiser les tâches répétitives sans créer un script impossible à maintenir',
            'automatiser-les-taches-repetitives-avec-python',
            E'Python est un excellent choix pour automatiser une tâche répétitive, à condition de traiter le script comme un vrai logiciel. Un point d entrée clair, une configuration séparée du code et des messages d erreur exploitables font une grande différence quand le script doit être repris plusieurs mois plus tard.\n\nCommencez petit : une commande qui lit une source, transforme une donnée et produit un résultat vérifiable. Ajoutez ensuite des tests sur les transformations importantes et des logs sur les opérations externes. Cette progression évite de transformer une automatisation ponctuelle en dépendance fragile pour toute l équipe.',
            'Python',
            CURRENT_TIMESTAMP - INTERVAL '2 days'
        ),
        (
            'Mettre en place une chaîne CI utile dès les premiers commits',
            'premiers-pas-avec-une-chaine-ci',
            E'Une chaîne d intégration continue ne doit pas attendre que le projet soit terminé. Dès les premiers commits, elle peut compiler le code, exécuter les tests et produire un rapport de couverture. Ces vérifications courtes donnent un retour rapide et empêchent une régression de rester cachée jusqu à la recette.\n\nLa première version doit rester lisible. Ajoutez les étapes dans l ordre naturel : installation des dépendances, analyse statique, tests puis construction de l artefact. Les déploiements et les contrôles plus coûteux peuvent venir ensuite, lorsque l équipe a déjà confiance dans ce socle.',
            'DevOps',
            CURRENT_TIMESTAMP - INTERVAL '1 day'
        )
)
INSERT INTO articles (title, slug, content, author_id, topic_id, created_at, updated_at)
SELECT
    seed_articles.title,
    seed_articles.slug,
    seed_articles.content,
    users.id,
    topics.id,
    seed_articles.created_at,
    seed_articles.created_at
FROM seed_articles
JOIN topics ON topics.name = seed_articles.topic_name
JOIN users ON users.username = 'orion-demo'
ON CONFLICT (slug) DO NOTHING;
