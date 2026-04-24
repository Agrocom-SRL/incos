-- ============================================
-- VISTA CATÁLOGO: vista_catalogo_acciones_permisos_activas
-- Acciones activas por permiso activo
--
-- Propósito: Centralizar catálogo vigente de acciones por permiso
-- Reutilizable para autorización y validación de asignaciones
--
-- Relaciones según schemas:
-- - permiso_acciones.permiso_id → permisos.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_catalogo_acciones_permisos_activas;

CREATE VIEW vista_catalogo_acciones_permisos_activas AS
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
  AND p.deleted_at IS NULL;
