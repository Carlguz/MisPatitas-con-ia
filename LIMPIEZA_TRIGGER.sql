-- =============================================================================
-- SCRIPT DE LIMPIEZA DE TRIGGER
-- Versión: 1.0
--
-- OBJETIVO:
-- Eliminar la función y el trigger que creaban perfiles de usuario automáticamente.
-- Esta lógica ha sido movida al código de la aplicación (en la ruta de NextAuth)
-- para mayor claridad, control y para evitar los complejos problemas de RLS.
-- =============================================================================

-- Elimina el trigger que se dispara cuando un usuario se registra en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Elimina la función que el trigger ejecutaba
DROP FUNCTION IF EXISTS public.handle_new_user();

-- FIN DEL SCRIPT. La base de datos ya no intentará crear perfiles automáticamente.
