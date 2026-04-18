-- ==========================================
-- TABLA DE REGISTRO DE SWIPES (Likes/Dislikes)
-- ==========================================

-- Habilitar la extensión para UUIDs si no está habilitada
-- Nota: Supabase ya la tiene habilitada por defecto en el esquema public.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear la tabla 'swipes'
CREATE TABLE IF NOT EXISTS public.swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    movie_id BIGINT NOT NULL,
    movie_title TEXT NOT NULL,
    movie_poster_url TEXT,
    swipe_type TEXT NOT NULL CHECK (swipe_type IN ('like', 'dislike')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ==========================================

-- NOTA: Estas políticas están configuradas para desarrollo inicial (permiten acceso anónimo).
-- En una aplicación de producción real, deberías usar 'TO authenticated' y 'auth.uid() = user_id'.

-- Política 1: Permitir lectura pública (para poder ver el historial de swipes)
CREATE POLICY "Permitir lectura pública"
ON public.swipes
FOR SELECT
TO anon, authenticated
USING (true);

-- Política 2: Permitir inserciones públicas (para probar sin login)
CREATE POLICY "Permitir inserciones públicas"
ON public.swipes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ==========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ==========================================

-- Índice para acelerar la búsqueda por usuario (útil para historial)
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON public.swipes(user_id);

-- Índice por movie_id para posibles analíticas cruzadas
CREATE INDEX IF NOT EXISTS idx_swipes_movie_id ON public.swipes(movie_id);

COMMENT ON TABLE public.swipes IS 'Almacena la interacción de swipe (like/dislike) de los usuarios con las películas.';
