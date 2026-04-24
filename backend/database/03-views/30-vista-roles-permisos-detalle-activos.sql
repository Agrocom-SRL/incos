-- ============================================
-- VISTA DETALLE: vista_roles_permisos_detalle_activos
-- Asignaciones activas rol-permiso con metadatos de permiso
--
-- Propósito: Resolver permisos por rol con contexto funcional
-- Reutilizable para grilla de seguridad y agregaciones por dominio
--
-- Relaciones según schemas:
-- - roles_permisos.permiso_id → permisos.id
-- - roles_permisos.rol_id → roles.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_roles_permisos_detalle_activos;

CREATE VIEW vista_roles_permisos_detalle_activos AS
SELECT
  rp.id,
  rp.rol_id,
  rp.permiso_id,
  rp.accion,
  p.codigo,
  p.nombre,
  p.dominio,
  p.modulo,
  p.grupo_ui,
  p.ruta_sidebar
FROM roles_permisos rp
JOIN permisos p ON p.id = rp.permiso_id
WHERE rp.activo = TRUE
  AND rp.deleted_at IS NULL
  AND p.activo = TRUE
  AND p.deleted_at IS NULL;
