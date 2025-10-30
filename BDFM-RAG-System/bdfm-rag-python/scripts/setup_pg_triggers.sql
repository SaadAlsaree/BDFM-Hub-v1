-- PostgreSQL Triggers for Auto-Sync
-- This script sets up automatic synchronization between PostgreSQL and Qdrant
-- 1. Create sync queue table
CREATE TABLE IF NOT EXISTS correspondence_sync_queue (
    id SERIAL PRIMARY KEY,
    correspondence_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL,
    -- INSERT, UPDATE, DELETE
    created_at TIMESTAMP DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);
-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_sync_queue_processed ON correspondence_sync_queue(processed, created_at);
-- 2. Create trigger function
CREATE OR REPLACE FUNCTION notify_correspondence_change() RETURNS TRIGGER AS $$ BEGIN -- Insert into queue
    IF (TG_OP = 'DELETE') THEN
INSERT INTO correspondence_sync_queue (correspondence_id, operation)
VALUES (OLD."Id", 'DELETE');
-- Send notification
PERFORM pg_notify(
    'correspondence_changes',
    json_build_object(
        'operation',
        'DELETE',
        'id',
        OLD."Id"::text
    )::text
);
RETURN OLD;
ELSE
INSERT INTO correspondence_sync_queue (correspondence_id, operation)
VALUES (NEW."Id", TG_OP);
-- Send notification
PERFORM pg_notify(
    'correspondence_changes',
    json_build_object(
        'operation',
        TG_OP,
        'id',
        NEW."Id"::text,
        'mail_num',
        NEW."MailNum"
    )::text
);
RETURN NEW;
END IF;
END;
$$ LANGUAGE plpgsql;
-- 3. Create triggers on Correspondences table
DROP TRIGGER IF EXISTS correspondence_insert_trigger ON "Correspondences";
CREATE TRIGGER correspondence_insert_trigger
AFTER
INSERT ON "Correspondences" FOR EACH ROW EXECUTE FUNCTION notify_correspondence_change();
DROP TRIGGER IF EXISTS correspondence_update_trigger ON "Correspondences";
CREATE TRIGGER correspondence_update_trigger
AFTER
UPDATE ON "Correspondences" FOR EACH ROW EXECUTE FUNCTION notify_correspondence_change();
DROP TRIGGER IF EXISTS correspondence_delete_trigger ON "Correspondences";
CREATE TRIGGER correspondence_delete_trigger
AFTER DELETE ON "Correspondences" FOR EACH ROW EXECUTE FUNCTION notify_correspondence_change();
-- Success message
DO $$ BEGIN RAISE NOTICE 'PostgreSQL triggers for auto-sync have been created successfully!';
RAISE NOTICE 'The system will now automatically sync changes to Qdrant.';
END $$;