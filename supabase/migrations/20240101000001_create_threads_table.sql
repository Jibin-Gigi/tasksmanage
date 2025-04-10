-- Create threads table
CREATE TABLE IF NOT EXISTS public.threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  replies_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS threads_user_id_idx ON public.threads(user_id);
CREATE INDEX IF NOT EXISTS threads_created_at_idx ON public.threads(created_at);

-- Enable Row Level Security
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all threads" 
  ON public.threads FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own threads" 
  ON public.threads FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads" 
  ON public.threads FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads" 
  ON public.threads FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_threads_updated_at
BEFORE UPDATE ON public.threads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 