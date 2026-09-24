INSERT INTO topics (name)
VALUES
    ('Java'),
    ('Spring Boot'),
    ('Angular'),
    ('JavaScript'),
    ('Python'),
    ('DevOps')
ON CONFLICT (name) DO NOTHING;
