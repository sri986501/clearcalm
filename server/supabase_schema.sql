-- =========================================================================
-- ClearClaim Supabase Database Schema
-- Run this SQL in your Supabase Project: SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT DEFAULT 'demo-user-id-123',
    filename TEXT NOT NULL,
    original_url TEXT,
    file_path TEXT,
    file_size BIGINT,
    mime_type TEXT,
    status TEXT DEFAULT 'ready',
    page_count INTEGER DEFAULT 1,
    chunks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Verifications Table (Audit Engine Records)
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_id TEXT UNIQUE NOT NULL,
    filename TEXT NOT NULL,
    file_url TEXT,
    status TEXT NOT NULL, -- 'CONSISTENT' | 'NEEDS REVIEW'
    anomaly_score NUMERIC(5, 4) DEFAULT 0.0,
    confidence_score NUMERIC(5, 4) DEFAULT 0.95,
    processing_time_ms INTEGER DEFAULT 320,
    extracted_fields JSONB DEFAULT '{}'::jsonb,
    violations JSONB DEFAULT '[]'::jsonb,
    ml_predictions JSONB DEFAULT '{}'::jsonb,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Summaries Table
CREATE TABLE IF NOT EXISTS public.summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    summary_type TEXT DEFAULT 'executive',
    content TEXT NOT NULL,
    key_findings JSONB DEFAULT '[]'::jsonb,
    coverage_highlights JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QA Histories Table
CREATE TABLE IF NOT EXISTS public.qa_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indices for fast lookup
CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_created_at ON public.verifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);

-- 7. Enable Row Level Security (RLS) - Permissive for authenticated & anon development
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to verifications" ON public.verifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to summaries" ON public.summaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to qa_history" ON public.qa_history FOR ALL USING (true) WITH CHECK (true);
