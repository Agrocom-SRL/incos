-- ============================================
-- VISTA AUTH: vista_auth_usuarios_login
-- Usuario activo para login con rol asociado
--
-- Propósito: Resolver autenticación por username/email
-- Reutilizable para LoginUseCase y validaciones de acceso
--
-- Relaciones según schemas:
-- - usuarios.rol_id → roles.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_auth_usuarios_login;

CREATE VIEW vista_auth_usuarios_login AS
SELECT
  u.id,
  u.username,
  u.email,
  u.password_hash,
  u.foto_url,
  u.estado,
  u.motivo_cambio_estado,
  u.activo,
  u.rol_id,
  r.codigo AS rol_codigo,
  r.nombre AS rol_nombre,
  r.is_system AS rol_is_system
FROM usuarios u
LEFT JOIN roles r ON r.id = u.rol_id
  AND r.activo = TRUE
  AND r.deleted_at IS NULL
WHERE u.activo = TRUE
  AND u.deleted_at IS NULL;
