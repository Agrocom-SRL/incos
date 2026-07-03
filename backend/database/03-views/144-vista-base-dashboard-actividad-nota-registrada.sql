-- ============================================
-- VISTA BASE: vista_base_dashboard_actividad_nota_registrada
-- Fila de actividad “nota registrada” (celda del cuaderno con nota cargada).
--
-- Propósito:
-- - Normalizar la carga de una nota como actividad reciente del dashboard.
-- - Contrato de 10 columnas del feed: artefacto_tipo, artefacto_id, link_path,
--   titulo, detalle, avatar_seed, ocurrido_en, estudiante_id, docente_id, usuario_id.
--
-- Alcance:
-- - estudiante_id: el estudiante calificado (feed del portal del estudiante).
-- - docente_id: el docente del curso (feed del portal del docente).
-- - usuario_id: quien cargó la nota (evaluaciones_notas.created_by).
--
-- Dependencias:
-- - evaluaciones_notas, evaluaciones, bimestres_matricula, matriculas_materia
-- - vista_base_docente_asignaciones_curso (51)
-- - vista_base_inscripciones_estudiantes (03)
--
-- Consumida por: 149-vista-dashboard-actividades-recientes.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_dashboard_actividad_nota_registrada;

CREATE VIEW vista_base_dashboard_actividad_nota_registrada AS
SELECT
  'NOTA_REGISTRADA' AS artefacto_tipo,
  en.id AS artefacto_id,
  CONCAT(
    '/academico/calificaciones/mis-cursos/',
    adc.asignacion_docente_id,
    '/cuaderno/',
    COALESCE(bm.bimestre, 1)
  ) AS link_path,
  TRIM(CONCAT_WS(' ', vie.apellido_paterno, vie.apellido_materno, vie.nombres)) AS titulo,
  CONCAT(
    'Nota registrada · ',
    COALESCE(adc.materia_sigla, adc.materia_nombre, 'Materia'),
    ' · ',
    COALESCE(e.nombre_evaluacion, 'Evaluación'),
    ' · ',
    en.nota, '/', COALESCE(e.puntos, 1)
  ) AS detalle,
  CONCAT('NOTA_REGISTRADA-', en.id) AS avatar_seed,
  COALESCE(en.updated_at, en.created_at) AS ocurrido_en,
  vie.estudiante_id,
  adc.docente_id,
  en.created_by AS usuario_id
FROM evaluaciones_notas en
INNER JOIN evaluaciones e
  ON e.id = en.evaluacion_id
  AND e.deleted_at IS NULL
  AND e.activo = TRUE
INNER JOIN vista_base_docente_asignaciones_curso adc
  ON adc.asignacion_docente_id = e.asignacion_docente_id
INNER JOIN bimestres_matricula bm
  ON bm.id = en.bimestre_matricula_id
  AND bm.deleted_at IS NULL
  AND bm.activo = TRUE
INNER JOIN matriculas_materia mm
  ON mm.id = bm.matricula_materia_id
  AND mm.deleted_at IS NULL
  AND mm.activo = TRUE
INNER JOIN vista_base_inscripciones_estudiantes vie
  ON vie.inscripcion_id = mm.inscripcion_id
WHERE en.deleted_at IS NULL
  AND en.activo = TRUE
  AND en.nota IS NOT NULL;
