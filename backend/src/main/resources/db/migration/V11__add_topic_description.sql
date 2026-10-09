ALTER TABLE topics
    ADD COLUMN description VARCHAR(255);

UPDATE topics
SET description = 'Suivez ce thème pour retrouver ses articles dans votre fil d’actualité.'
WHERE description IS NULL;

ALTER TABLE topics
    ALTER COLUMN description SET NOT NULL;