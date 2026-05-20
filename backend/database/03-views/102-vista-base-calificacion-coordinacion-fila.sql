-- ============================================
-- VISTA BASE: vista_base_calificacion_coordinacion_fila
-- Una fila por matrícula activa (INSCRITO/CURSANDO) con docente en gestión vigente.
--
-- Reutiliza (sin tocar tablas de inscripción/matrícula directamente):
--   - vista_estudiante_inscripcion_actual (20): 03→04→18→19→01
--   - vista_base_docente_ficha (50): filtro docente activo
--
-- Consumida por: vista_calificacion_coordinacion_docentes (102)
--
-- Orden de despliegue: 01, 03, 04, 18, 19, 20, 50; luego 104; luego 102.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_calificacion_coordinacion_fila;

CREATE VIEW vista_base_calificacion_coordinacion_fila AS
SELECT
  v.docente_id,
  v.asignacion_docente_id,
  v.estudiante_id,
  v.materia_id,
  v.gestion_id,
  v.gestion_anio,
  v.gestion_nombre,
  v.carrera_id,
  v.carrera_nombre,
  COALESCE(NULLIF(TRIM(v.carrera_color_hex), ''), '#64748b') AS carrera_color_hex
FROM vista_estudiante_inscripcion_actual v
INNER JOIN vista_base_docente_ficha f
  ON f.docente_id = v.docente_id
  AND f.activo = TRUE
  AND f.estado_laboral = 'ACTIVO'
WHERE v.matricula_estado IN ('INSCRITO', 'CURSANDO')
  AND v.gestion_vigente = TRUE
  AND v.docente_id IS NOT NULL;
