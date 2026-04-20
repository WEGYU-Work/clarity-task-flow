-- Enable pg_trgm extension for fuzzy search performance
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create users table if not exists (matching UserModel)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tasks table if not exists (matching TaskModel)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraint for status
    CONSTRAINT status_check CHECK (status IN ('pending', 'completed'))
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Policies for tasks table
-- Since the Node.js server uses the service role key, it bypasses RLS.
-- However, for future-proofing and security, we should set up proper policies.
CREATE POLICY "Users can manage their own tasks" ON public.tasks
    FOR ALL USING (user_id = auth.uid());

-- Performance Optimizations: Indexes
-- Index for email lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);

-- Composite index for task filtering by user and status/date
CREATE INDEX IF NOT EXISTS tasks_user_id_created_at_idx ON public.tasks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tasks_user_id_status_idx ON public.tasks (user_id, status);

-- Trigram index for title search (optimizes ilike '%search%')
CREATE INDEX IF NOT EXISTS tasks_title_trgm_idx ON public.tasks USING gist (title gist_trgm_ops);

-- Index for status if queried globally (though we usually query per user)
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks (status);