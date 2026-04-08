-- ============================================
-- VISTA BASE: vista_usuarios_admin_base
-- Usuarios activos con datos de rol
--
-- Propósito: Vista base para listados administrativos de usuarios
-- Reutilizable para autenticación, seguridad y panel admin
--
-- Relaciones según schemas:
-- - usuarios.rol_id → roles.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_usuarios_admin_base;

CREATE VIEW vista_usuarios_admin_base AS
SELECT
  u.id,
  u.username,
  u.email,
  u.foto_url,
  u.estado,
  u.motivo_cambio_estado,
  u.activo,
  u.created_at,
  u.updated_at,
  u.referencia_id,
  u.tipo_referencia,
  u.fecha_cambio_estado,
  u.rol_id,
  r.codigo AS rol_codigo,
  r.nombre AS rol_nombre,
  r.tipo AS rol_tipo,
  r.is_system AS rol_is_system
FROM usuarios u
LEFT JOIN roles r ON r.id = u.rol_id
  AND r.activo = TRUE
  AND r.deleted_at IS NULL
WHERE u.activo = TRUE
  AND u.deleted_at IS NULL;
