-- ============================================
-- VISTA: vista_seguridad_alta_usuario_estudiantes_sin_cuenta
-- Catálogo de estudiantes elegibles para alta de usuario (SEG)
--
-- Regla funcional:
-- - Solo estudiantes activos, no eliminados lógicamente
-- - Solo estudiantes sin usuario asociado (usuario_id IS NULL)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_seguridad_alta_usuario_estudiantes_sin_cuenta;

CREATE VIEW vista_seguridad_alta_usuario_estudiantes_sin_cuenta AS
SELECT
  v.id,
  v.codigo_estudiante,
  v.nombres,
  v.apellido_paterno,
  v.apellido_materno,
  v.ci,
  v.expedicion,
  v.email_personal,
  v.celular,
  v.telefono_fijo,
  v.usuario_id,
  v.created_at,
  v.activo
FROM vista_estudiante_datos_personales v
WHERE v.activo = 1
  AND v.usuario_id IS NULL;
