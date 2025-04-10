-- Add liked_by_user column to posts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts'
        AND column_name = 'liked_by_user'
    ) THEN
        ALTER TABLE posts ADD COLUMN liked_by_user BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add liked_by_user column to achievements table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'achievements'
        AND column_name = 'liked_by_user'
    ) THEN
        ALTER TABLE achievements ADD COLUMN liked_by_user BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add liked_by_user column to threads table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'threads'
        AND column_name = 'liked_by_user'
    ) THEN
        ALTER TABLE threads ADD COLUMN liked_by_user BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Make sure likes column exists in all tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts'
        AND column_name = 'likes'
    ) THEN
        ALTER TABLE posts ADD COLUMN likes INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'achievements'
        AND column_name = 'likes'
    ) THEN
        ALTER TABLE achievements ADD COLUMN likes INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'threads'
        AND column_name = 'likes'
    ) THEN
        ALTER TABLE threads ADD COLUMN likes INTEGER DEFAULT 0;
    END IF;
END $$; 