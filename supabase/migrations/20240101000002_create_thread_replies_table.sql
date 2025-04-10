-- Create thread_replies table
CREATE TABLE IF NOT EXISTS public.thread_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS thread_replies_thread_id_idx ON public.thread_replies(thread_id);
CREATE INDEX IF NOT EXISTS thread_replies_user_id_idx ON public.thread_replies(user_id);
CREATE INDEX IF NOT EXISTS thread_replies_created_at_idx ON public.thread_replies(created_at);

-- Enable Row Level Security
ALTER TABLE public.thread_replies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all thread replies" 
  ON public.thread_replies FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own thread replies" 
  ON public.thread_replies FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own thread replies" 
  ON public.thread_replies FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own thread replies" 
  ON public.thread_replies FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_thread_replies_updated_at
BEFORE UPDATE ON public.thread_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update thread replies_count
CREATE OR REPLACE FUNCTION public.update_thread_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.threads
    SET replies_count = replies_count + 1
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.threads
    SET replies_count = replies_count - 1
    WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update thread replies_count
CREATE TRIGGER update_thread_replies_count_insert
AFTER INSERT ON public.thread_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_thread_replies_count();

CREATE TRIGGER update_thread_replies_count_delete
AFTER DELETE ON public.thread_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_thread_replies_count(); 