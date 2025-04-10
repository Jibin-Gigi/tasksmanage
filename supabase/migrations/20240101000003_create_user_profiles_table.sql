-- Function to create user_profiles table if it doesn't exist
CREATE OR REPLACE FUNCTION create_user_profiles_table_if_not_exists()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'user_profiles'
    ) THEN
        CREATE TABLE user_profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            bio TEXT,
            avatar_url TEXT,
            level INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            achievements TEXT[] DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable Row Level Security
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view all profiles" ON user_profiles
            FOR SELECT USING (true);
            
        CREATE POLICY "Users can insert their own profile" ON user_profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        CREATE POLICY "Users can update their own profile" ON user_profiles
            FOR UPDATE USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can delete their own profile" ON user_profiles
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.triggers
        WHERE trigger_name = 'update_user_profiles_updated_at'
        AND event_object_table = 'user_profiles'
    ) THEN
        CREATE TRIGGER update_user_profiles_updated_at
        BEFORE UPDATE ON user_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$$ LANGUAGE plpgsql; 