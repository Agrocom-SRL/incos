-- ============================================
-- VISTA: vista_usuario_permisos_efectivos
-- Permisos efectivos por usuario: rol base + GRANTs - REVOKEs
--
-- Propósito:
-- - Una fila por (usuario_id, permiso_codigo, accion) efectiva.
-- - Lógica: permisos del rol + overrides GRANT individuales − REVOKE individuales.
-- - ADMIN_SISTEMA (rol_id=8) se resuelve dinámicamente en AuthRepository antes
--   de consultar esta vista (no requiere filas físicas en roles_permisos).
--
-- Relaciones (tablas en 01-schemas/04-sistema-seguridad.sql):
-- - usuarios.rol_id → roles_permisos.rol_id
-- - roles_permisos.permiso_id → permisos.id
-- - usuarios_permisos.usuario_id → usuarios.id
-- - usuarios_permisos.permiso_id → permisos.id
--
-- IMPORTANTE:
-- - Requiere tablas roles, permisos, usuarios, roles_permisos, usuarios_permisos
--   (esquema aplicado y, para datos útiles, seeders de roles/permisos/roles_permisos).
-- - Implementación con NOT EXISTS (MySQL 8.0.x sin depender de EXCEPT).
-- - Variante equivalente con EXCEPT disponible desde MySQL 8.0.31+.
--
-- APLICACIÓN (fuente canónica = este archivo):
-- - El cuerpo DROP + CREATE debe coincidir con lo que aplicas en la BD; no hay otra
--   definición en código: el backend consulta el nombre fijo
--   vista_usuario_permisos_efectivos (p. ej. AuthRepository.findPermisosEfectivos,
--   tienePermiso, MeUseCase).
-- - Ejecutar contra la base configurada en .env (p. ej. mysql/mysqlsh o pipeline CI),
--   o ajustar USE instituto_incos al nombre real de la BD.
--
-- Uso:
--   SELECT * FROM vista_usuario_permisos_efectivos
--   WHERE usuario_id = ? AND permiso_codigo = ? AND accion = ?;
--
--   SELECT permiso_codigo, accion
--   FROM vista_usuario_permisos_efectivos
--   WHERE usuario_id = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_usuario_permisos_efectivos;

CREATE VIEW vista_usuario_permisos_efectivos AS
SELECT
  base.usuario_id,
  base.permiso_codigo,
  base.accion
FROM (
  -- Permisos heredados del rol del usuario
  SELECT
    u.id AS usuario_id,
    p.codigo AS permiso_codigo,
    rp.accion
  FROM usuarios u
  INNER JOIN roles_permisos rp ON rp.rol_id = u.rol_id
    AND rp.activo = TRUE
    AND rp.deleted_at IS NULL
  INNER JOIN permisos p ON p.id = rp.permiso_id
    AND p.activo = TRUE
    AND p.deleted_at IS NULL
  WHERE u.activo = TRUE
    AND u.deleted_at IS NULL

  UNION

  -- GRANTs individuales
  SELECT
    up.usuario_id,
    p.codigo AS permiso_codigo,
    up.accion
  FROM usuarios_permisos up
  INNER JOIN permisos p ON p.id = up.permiso_id
    AND p.activo = TRUE
    AND p.deleted_at IS NULL
  WHERE up.tipo = 'GRANT'
    AND up.activo = TRUE
    AND up.deleted_at IS NULL
) base
WHERE NOT EXISTS (
  SELECT 1
  FROM usuarios_permisos up2
  INNER JOIN permisos p2 ON p2.id = up2.permiso_id
    AND p2.activo = TRUE
    AND p2.deleted_at IS NULL
  WHERE up2.usuario_id = base.usuario_id
    AND p2.codigo = base.permiso_codigo
    AND up2.accion = base.accion
    AND up2.tipo = 'REVOKE'
    AND up2.activo = TRUE
    AND up2.deleted_at IS NULL
);
