-- Create the tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraint for status
    CONSTRAINT status_check CHECK (status IN ('pending', 'completed'))
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing public access for now as the user didn't specify auth, 
-- but in a real app, we'd use auth.uid())
CREATE POLICY "Allow public select" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.tasks FOR DELETE USING (true);

-- Add indexes for search and sorting
CREATE INDEX IF NOT EXISTS tasks_title_idx ON public.tasks (title);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON public.tasks (created_at DESC);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks (status);