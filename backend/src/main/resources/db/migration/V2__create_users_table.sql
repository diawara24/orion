CREATE TABLE IF NOT EXISTS users (
     id UUID NOT NULL DEFAULT gen_random_uuid(),
     username VARCHAR(50) NOT NULL,
     email VARCHAR(255) NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     role VARCHAR(20) NOT NULL DEFAULT 'USER',
     created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

     CONSTRAINT users_pkey PRIMARY KEY (id),
     CONSTRAINT users_username_unique UNIQUE (username),
     CONSTRAINT users_email_unique UNIQUE (email),
     CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN'))
);