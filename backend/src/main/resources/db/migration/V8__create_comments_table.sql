CREATE TABLE IF NOT EXISTS comments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    article_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT comments_author_id_fkey
        FOREIGN KEY (author_id) REFERENCES users (id)
        ON UPDATE NO ACTION ON DELETE RESTRICT,
    CONSTRAINT comments_article_id_fkey
        FOREIGN KEY (article_id) REFERENCES articles (id)
        ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE INDEX comments_article_created_at_index
    ON comments (article_id, created_at ASC);

CREATE INDEX comments_author_id_index
    ON comments (author_id);
