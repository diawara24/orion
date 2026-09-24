CREATE TABLE IF NOT EXISTS articles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    topic_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT articles_pkey PRIMARY KEY (id),
    CONSTRAINT articles_slug_unique UNIQUE (slug),
    CONSTRAINT articles_author_id_fkey
        FOREIGN KEY (author_id) REFERENCES users (id)
        ON UPDATE NO ACTION ON DELETE RESTRICT,
    CONSTRAINT articles_topic_id_fkey
        FOREIGN KEY (topic_id) REFERENCES topics (id)
        ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE INDEX articles_topic_created_at_index
    ON articles (topic_id, created_at DESC);

CREATE INDEX articles_author_id_index
    ON articles (author_id);
