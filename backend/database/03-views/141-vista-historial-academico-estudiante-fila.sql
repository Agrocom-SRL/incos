-- ============================================
-- VISTA FINAL: vista_historial_academico_estudiante_fila
-- Historial académico (kardex / transcript FORM-SIE-ITT-04) del estudiante.
--
-- Grano: una fila por (estudiante × asignatura del plan × gestión), a través de
-- TODAS las gestiones + las filas de arrastre/convalidación (origen = PREVIO).
-- Es la vista que consume HistorialAcademicoRepository; la cabecera del
-- estudiante y el resumen (carga total, aprobadas, promedio) los arma el use case.
--
-- Vista FINAL DELGADA (patrón 87/135): solo une las bases y proyecta columnas,
-- sin reescribir JOINs ni recalcular reglas ya consolidadas:
--   - 138 vista_base_historial_nota_efectiva_fila       → nota/estado CURSADO
--   - 140 vista_base_historial_previo_fila              → arrastre/convalidación
--   - 139 vista_base_historial_asignatura_plan_detalle  → sigla/nombre/periodo/
--         horas/prerrequisito por asignatura del plan
--
-- NO filtra a la gestión vigente (a diferencia de la 135, atada a la asignación
-- docente vigente y al grano paralelo).
--
-- 2026-07-29 (ajuste aditivo, disolución REP): se proyectan asignatura_plan_id
-- y plan_estudio_id (ya presentes en las bases 138/140/139) para que el Avance
-- académico (vista 170) cuente materias avanzadas por estudiante × plan sobre
-- ESTE mismo universo de filas (paridad transcript ↔ avance). Consumidores
-- previos (HistorialAcademicoRepository, 142) no se ven afectados.
--
-- Uso:
--   SELECT * FROM vista_historial_academico_estudiante_fila
--   WHERE estudiante_id = ?
--   ORDER BY gestion_anio, periodo_numero, asignatura_orden;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_historial_academico_estudiante_fila;

CREATE VIEW vista_historial_academico_estudiante_fila AS
SELECT
  nef.estudiante_id        AS estudiante_id,
  nef.gestion_anio         AS gestion_anio,
  nef.asignatura_plan_id   AS asignatura_plan_id,
  apd.plan_estudio_id      AS plan_estudio_id,
  apd.carga_horaria        AS carga_horaria,
  apd.periodo_numero       AS periodo_numero,
  apd.periodo_nombre       AS periodo_nombre,
  apd.asignatura_orden     AS asignatura_orden,
  apd.asignatura_sigla     AS asignatura_sigla,
  apd.asignatura_nombre    AS asignatura_nombre,
  apd.prerrequisito_sigla  AS prerrequisito_sigla,
  nef.nota_final           AS nota_final,
  nef.nota_recuperacion    AS nota_recuperacion,
  nef.estado               AS estado,
  nef.origen               AS origen
FROM vista_base_historial_nota_efectiva_fila nef
INNER JOIN vista_base_historial_asignatura_plan_detalle apd
  ON apd.asignatura_plan_id = nef.asignatura_plan_id

UNION ALL

SELECT
  hp.estudiante_id         AS estudiante_id,
  hp.gestion_anio          AS gestion_anio,
  hp.asignatura_plan_id    AS asignatura_plan_id,
  apd.plan_estudio_id      AS plan_estudio_id,
  apd.carga_horaria        AS carga_horaria,
  apd.periodo_numero       AS periodo_numero,
  apd.periodo_nombre       AS periodo_nombre,
  apd.asignatura_orden     AS asignatura_orden,
  apd.asignatura_sigla     AS asignatura_sigla,
  apd.asignatura_nombre    AS asignatura_nombre,
  apd.prerrequisito_sigla  AS prerrequisito_sigla,
  hp.nota_final            AS nota_final,
  hp.nota_recuperacion     AS nota_recuperacion,
  hp.estado                AS estado,
  hp.origen                AS origen
FROM vista_base_historial_previo_fila hp
INNER JOIN vista_base_historial_asignatura_plan_detalle apd
  ON apd.asignatura_plan_id = hp.asignatura_plan_id;
