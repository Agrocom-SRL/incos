-- ============================================
-- VISTA BASE: vista_base_historial_previo_fila
-- Filas de arrastre / convalidación del historial académico (rama PREVIO).
--
-- Grano: una fila por historial_previo (materias traídas de otra carrera/plan o
-- convalidadas), normalizada al MISMO shape que la 138 para que la vista final
-- (141) las una con un UNION ALL sin lógica adicional.
--
-- Fuentes:
--   historial_previo → inscripciones → estudiantes_datos_academicos (estudiante)
--   y → gestiones (año). Asignatura del plan por historial_previo.asignatura_plan_id.
--
-- Reglas: no hay prueba de recuperación (nota_recuperacion = NULL);
--   estado = historial_previo.estado (APROBADO / CONVALIDADO).
--
-- Uso:
--   SELECT * FROM vista_base_historial_previo_fila WHERE estudiante_id = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_historial_previo_fila;

CREATE VIEW vista_base_historial_previo_fila AS
SELECT
  eda.estudiante_id                        AS estudiante_id,
  i.gestion_id                             AS gestion_id,
  g.anio                                   AS gestion_anio,
  hp.asignatura_plan_id                    AS asignatura_plan_id,
  hp.nota_final                            AS nota_final,
  NULL                                     AS nota_recuperacion,
  hp.estado                                AS estado,
  'PREVIO'                                 AS origen
FROM historial_previo hp
INNER JOIN inscripciones i
  ON i.id = hp.inscripcion_id AND i.deleted_at IS NULL
INNER JOIN estudiantes_datos_academicos eda
  ON eda.id = i.datos_academicos_id AND eda.deleted_at IS NULL
LEFT JOIN gestiones g
  ON g.id = i.gestion_id AND g.deleted_at IS NULL
WHERE hp.deleted_at IS NULL;
