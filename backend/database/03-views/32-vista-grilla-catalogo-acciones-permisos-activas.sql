-- ============================================
-- VISTA GRILLA: vista_grilla_catalogo_acciones_permisos_activas
-- Catálogo de acciones por permiso activo, solo filas con grupo_ui
--
-- Propósito: Base para armar la grilla de seguridad por grupo_ui + ruta_sidebar
-- (evita SQL embebido en repositorios y centraliza reglas de vigencia)
--
-- Diferencia respecto a vista_catalogo_acciones_permisos_activas:
--   - Exige p.grupo_ui IS NOT NULL (agrupación UI)
--
-- Relaciones según schemas:
-- - permiso_acciones.permiso_id → permisos.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_grilla_catalogo_acciones_permisos_activas;

CREATE VIEW vista_grilla_catalogo_acciones_permisos_activas AS
SELECT
  p.id AS permiso_id,
  p.codigo,
  p.nombre,
  p.dominio,
  p.modulo,
  p.grupo_ui,
  p.ruta_sidebar,
  pa.accion
FROM permiso_acciones pa
JOIN permisos p ON p.id = pa.permiso_id
WHERE pa.activo = TRUE
  AND pa.deleted_at IS NULL
  AND p.activo = TRUE
  AND p.deleted_at IS NULL
  AND p.grupo_ui IS NOT NULL;
