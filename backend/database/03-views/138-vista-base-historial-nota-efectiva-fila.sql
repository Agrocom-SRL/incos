-- ============================================
-- VISTA BASE: vista_base_historial_nota_efectiva_fila
-- Nota efectiva del historial académico por matrícula de materia (rama CURSADO).
--
-- Grano: una fila por matriculas_materia (estudiante × asignatura × gestión de
-- lo cursado en el sistema), a través de TODAS las gestiones (NO filtra a la
-- gestión vigente). Solo resuelve la NOTA y el ESTADO; el detalle de la
-- asignatura del plan (sigla/nombre/periodo/horas/prerrequisito) lo aporta la
-- vista 139 y el ensamblado final lo hace la 141.
--
-- Fuentes:
--   matriculas_materia → inscripciones → estudiantes_datos_academicos (estudiante)
--   y → gestiones (año). Asignatura del plan por
--   COALESCE(oferta_cursos.asignatura_plan_id, matriculas_materia.asignatura_plan_id).
--
-- Nota EFECTIVA por PRECEDENCIA:
--   historial_matricula.nota_resultante (nota_forzada=TRUE, vigente) →
--   nivelaciones.nota_nivelacion (nivelación APROBADA vinculada) →
--   matriculas_materia.nota_final.
-- nota_recuperacion = última nivelación vinculada con nota (prueba de recuperación).
-- estado = matriculas_materia.estado.
--
-- No se filtra por activo para conservar el historial completo
-- (reprobadas/abandonos incluidos); solo deleted_at IS NULL.
--
-- 2026-07-29 (ajuste aditivo, disolución REP): se exponen matricula_materia_id
-- y carrera_id (eda ya estaba en el JOIN) para que la vista de deserción (172)
-- reutilice ESTE universo (historial completo, sin filtro de activo) sin
-- reescribir la cadena matriculas_materia → inscripciones → datos académicos.
-- Consumidores previos (141) no se ven afectados.
--
-- Uso:
--   SELECT * FROM vista_base_historial_nota_efectiva_fila WHERE estudiante_id = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_historial_nota_efectiva_fila;

CREATE VIEW vista_base_historial_nota_efectiva_fila AS
SELECT
  eda.estudiante_id                        AS estudiante_id,
  eda.carrera_id                           AS carrera_id,
  mm.id                                    AS matricula_materia_id,
  i.gestion_id                             AS gestion_id,
  g.anio                                   AS gestion_anio,
  COALESCE(oc.asignatura_plan_id, mm.asignatura_plan_id) AS asignatura_plan_id,
  -- Nota efectiva por precedencia: forzada → nivelación aprobada → nota_final.
  COALESCE(
    (SELECT hm.nota_resultante
       FROM historial_matricula hm
      WHERE hm.matricula_materia_id = mm.id
        AND hm.nota_forzada = 1
        AND hm.vigente = 1
        AND hm.deleted_at IS NULL
      ORDER BY hm.id DESC
      LIMIT 1),
    (SELECT n.nota_nivelacion
       FROM nivelaciones n
       JOIN historial_matricula hm2 ON hm2.id = n.historial_matricula_id
      WHERE hm2.matricula_materia_id = mm.id
        AND n.estado = 'APROBADA'
        AND n.nota_nivelacion IS NOT NULL
        AND n.deleted_at IS NULL
      ORDER BY n.id DESC
      LIMIT 1),
    mm.nota_final
  )                                        AS nota_final,
  -- Prueba de recuperación: última nivelación vinculada con nota.
  (SELECT n2.nota_nivelacion
     FROM nivelaciones n2
     JOIN historial_matricula hm3 ON hm3.id = n2.historial_matricula_id
    WHERE hm3.matricula_materia_id = mm.id
      AND n2.nota_nivelacion IS NOT NULL
      AND n2.deleted_at IS NULL
    ORDER BY n2.id DESC
    LIMIT 1)                               AS nota_recuperacion,
  mm.estado                                AS estado,
  'CURSADO'                                AS origen
FROM matriculas_materia mm
INNER JOIN inscripciones i
  ON i.id = mm.inscripcion_id AND i.deleted_at IS NULL
INNER JOIN estudiantes_datos_academicos eda
  ON eda.id = i.datos_academicos_id AND eda.deleted_at IS NULL
LEFT JOIN gestiones g
  ON g.id = i.gestion_id AND g.deleted_at IS NULL
LEFT JOIN oferta_cursos oc
  ON oc.id = mm.oferta_curso_id AND oc.deleted_at IS NULL
WHERE mm.deleted_at IS NULL;
