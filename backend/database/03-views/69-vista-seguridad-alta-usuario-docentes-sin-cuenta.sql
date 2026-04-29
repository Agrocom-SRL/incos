-- ============================================
-- VISTA: vista_seguridad_alta_usuario_docentes_sin_cuenta
-- Catálogo de docentes elegibles para alta de usuario (SEG)
--
-- Regla funcional:
-- - Solo docentes activos, no eliminados lógicamente
-- - Solo docentes sin usuario asociado (usuario_id IS NULL)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_seguridad_alta_usuario_docentes_sin_cuenta;

CREATE VIEW vista_seguridad_alta_usuario_docentes_sin_cuenta AS
SELECT
  f.docente_id AS id,
  f.nombres,
  f.apellido_paterno,
  f.apellido_materno,
  f.ci,
  f.expedicion,
  f.email_personal,
  f.celular,
  f.telefono,
  f.estado_laboral,
  f.usuario_id,
  f.created_at,
  f.activo
FROM vista_base_docente_ficha f
WHERE f.activo = 1
  AND f.usuario_id IS NULL;
