-- ============================================
-- VISTA DETALLE: vista_usuarios_permisos_overrides_activos
-- Overrides activos de permisos por usuario con metadatos
--
-- Propósito: Resolver GRANT/REVOKE efectivos por usuario
-- Reutilizable para panel de seguridad y auditoría de overrides
--
-- Relaciones según schemas:
-- - usuarios_permisos.permiso_id → permisos.id
-- - usuarios_permisos.usuario_id → usuarios.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_usuarios_permisos_overrides_activos;

CREATE VIEW vista_usuarios_permisos_overrides_activos AS
SELECT
  up.id,
  up.usuario_id,
  up.permiso_id,
  up.accion,
  up.tipo,
  up.motivo,
  p.codigo,
  p.nombre,
  p.dominio,
  p.modulo,
  p.grupo_ui,
  p.ruta_sidebar
FROM usuarios_permisos up
JOIN permisos p ON p.id = up.permiso_id
WHERE up.activo = TRUE
  AND up.deleted_at IS NULL
  AND p.activo = TRUE
  AND p.deleted_at IS NULL;
