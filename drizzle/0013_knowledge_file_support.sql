ALTER TABLE knowledge_sources ADD COLUMN file_url TEXT;
ALTER TABLE knowledge_sources ADD COLUMN file_size INTEGER;
ALTER TABLE knowledge_sources ADD COLUMN mime_type VARCHAR(50);
ALTER TABLE knowledge_sources ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'complete';

ALTER TABLE knowledge_sources DROP CONSTRAINT knowledge_sources_type_check;
ALTER TABLE knowledge_sources ADD CONSTRAINT knowledge_sources_type_check CHECK (type IN ('text', 'pdf'));
ALTER TABLE knowledge_sources ADD CONSTRAINT knowledge_sources_status_check CHECK (status IN ('pending', 'processing', 'complete', 'failed'));

CREATE INDEX IF NOT EXISTS knowledge_sources_status_idx ON knowledge_sources(status);
