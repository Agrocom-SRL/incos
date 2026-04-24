-- ============================================
-- VISTA AUTH: vista_auth_sesiones_activas
-- Sesiones activas con usuario y rol
--
-- Propósito: Validar sesión activa y obtener contexto del usuario autenticado
-- Reutilizable para middleware auth y /auth/me
--
-- El correo (`email`) proviene de vista_usuarios_admin_base (ficha vinculada).
--
-- Relaciones según schemas:
-- - sesiones.usuario_id → usuarios.id
-- - usuarios.rol_id → roles.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_auth_sesiones_activas;

CREATE VIEW vista_auth_sesiones_activas AS
SELECT
  s.id AS sesion_id,
  s.usuario_id,
  s.token_sesion,
  s.fecha_expiracion,
  u.activo AS usuario_activo,
  u.estado AS usuario_estado,
  u.motivo_cambio_estado,
  u.rol_id,
  r.codigo AS rol_codigo,
  r.nombre AS rol_nombre,
  r.tipo AS rol_tipo,
  r.is_system AS rol_is_system,
  u.username,
  v.email,
  u.foto_url
FROM sesiones s
JOIN usuarios u ON u.id = s.usuario_id
LEFT JOIN vista_usuarios_admin_base v ON v.id = u.id
LEFT JOIN roles r ON r.id = u.rol_id
  AND r.activo = TRUE
  AND r.deleted_at IS NULL
WHERE s.activo = TRUE
  AND s.deleted_at IS NULL
  AND u.activo = TRUE
  AND u.deleted_at IS NULL;
