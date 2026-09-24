CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    topic_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT subscriptions_user_topic_unique UNIQUE (user_id, topic_id),
    CONSTRAINT subscriptions_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE NO ACTION ON DELETE CASCADE,
    CONSTRAINT subscriptions_topic_id_fkey
        FOREIGN KEY (topic_id) REFERENCES topics (id)
        ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE INDEX subscriptions_topic_id_index
    ON subscriptions (topic_id);
