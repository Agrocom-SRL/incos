-- ============================================
-- VISTA AUTH: vista_auth_usuarios_login
-- Usuario activo para login con rol asociado
--
-- Propósito: Resolver autenticación por username o correo de ficha (`email` calculado)
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
  COALESCE(
    CASE u.tipo_referencia
      WHEN 'ESTUDIANTE' THEN e.email_personal
      WHEN 'DOCENTE' THEN d.email_personal
      WHEN 'RECTOR' THEN p_inst.email_personal
      WHEN 'DIRECTOR' THEN p_inst.email_personal
      WHEN 'SECRETARIA' THEN p_inst.email_personal
      ELSE NULL
    END,
    p_noref.email_personal
  ) AS email,
  u.password_hash,
  u.foto_url,
  u.estado,
  u.motivo_cambio_estado,
  u.activo,
  u.rol_id,
  r.codigo AS rol_codigo,
  r.nombre AS rol_nombre,
  r.tipo AS rol_tipo,
  r.is_system AS rol_is_system
FROM usuarios u
LEFT JOIN roles r ON r.id = u.rol_id
  AND r.activo = TRUE
  AND r.deleted_at IS NULL
LEFT JOIN estudiantes e ON u.tipo_referencia = 'ESTUDIANTE'
  AND e.id = u.referencia_id
  AND e.deleted_at IS NULL
LEFT JOIN docentes d ON u.tipo_referencia = 'DOCENTE'
  AND d.id = u.referencia_id
  AND d.deleted_at IS NULL
LEFT JOIN personal p_inst ON u.tipo_referencia IN ('RECTOR', 'DIRECTOR', 'SECRETARIA')
  AND p_inst.id = u.referencia_id
  AND p_inst.deleted_at IS NULL
LEFT JOIN personal p_noref ON u.tipo_referencia IS NULL
  AND u.referencia_id IS NOT NULL
  AND p_noref.id = u.referencia_id
  AND p_noref.deleted_at IS NULL
WHERE u.activo = TRUE
  AND u.deleted_at IS NULL;
