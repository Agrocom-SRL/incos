-- ============================================
-- VISTA: vista_calificacion_docente_encabezado
-- Encabezado de Mis cursos (nombre del docente activo).
--
-- Reutiliza: vista_base_docente_ficha (50)
--
-- Orden de despliegue: 50; después de 103.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_calificacion_docente_encabezado;

CREATE VIEW vista_calificacion_docente_encabezado AS
SELECT
  f.docente_id,
  TRIM(
    CONCAT_WS(
      ' ',
      f.nombres,
      f.apellido_paterno,
      f.apellido_materno
    )
  ) AS docente_nombre
FROM vista_base_docente_ficha f
WHERE f.activo = TRUE
  AND f.estado_laboral = 'ACTIVO';
