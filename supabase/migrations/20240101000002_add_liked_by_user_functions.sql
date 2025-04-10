-- Function to add liked_by_user column to posts table
CREATE OR REPLACE FUNCTION add_liked_by_user_to_posts()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts'
        AND column_name = 'liked_by_user'
    ) THEN
        ALTER TABLE posts ADD COLUMN liked_by_user BOOLEAN DEFAULT FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to add liked_by_user column to achievements table
CREATE OR REPLACE FUNCTION add_liked_by_user_to_achievements()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'achievements'
        AND column_name = 'liked_by_user'
    ) THEN
        ALTER TABLE achievements ADD COLUMN liked_by_user BOOLEAN DEFAULT FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to add liked_by_user column to threads table
CREATE OR REPLACE FUNCTION add_liked_by_user_to_threads()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'threads'
        AND column_name = 'liked_by_user'
    ) THEN
        ALTER TABLE threads ADD COLUMN liked_by_user BOOLEAN DEFAULT FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create threads table if it doesn't exist
CREATE OR REPLACE FUNCTION create_threads_table_if_not_exists()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'threads'
    ) THEN
        CREATE TABLE threads (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            replies_count INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            liked_by_user BOOLEAN DEFAULT FALSE
        );
        
        -- Enable Row Level Security
        ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view all threads" ON threads
            FOR SELECT USING (true);
            
        CREATE POLICY "Users can insert their own threads" ON threads
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        CREATE POLICY "Users can update their own threads" ON threads
            FOR UPDATE USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can delete their own threads" ON threads
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END;
$$ LANGUAGE plpgsql; 