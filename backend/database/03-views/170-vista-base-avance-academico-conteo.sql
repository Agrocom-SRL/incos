-- ============================================
-- VISTA BASE: vista_base_avance_academico_conteo
-- Conteo de materias avanzadas por estudiante × plan de estudios (numerador del
-- Avance académico, ítem ACA `/academico/avance` — reemplaza al retirado
-- `reportes.avance_academico` del módulo REP disuelto, 2026-07-29).
--
-- Grano: una fila por (estudiante × plan_estudio).
--
-- Reutiliza (no duplica): AGREGA la vista 141
-- (vista_historial_academico_estudiante_fila) — el MISMO universo de filas del
-- transcript (nota efectiva por precedencia + arrastre/convalidación PREVIO),
-- usando las columnas asignatura_plan_id/plan_estudio_id añadidas 2026-07-29.
-- Así el conteo de aprobadas coincide 1:1 con el kardex del estudiante.
--
-- Reglas:
--   - materias_avanzadas = DISTINCT asignaturas con estado APROBADO o
--     CONVALIDADO (si una materia se recursó y aprobó, cuenta UNA vez).
--   - materias_registradas = DISTINCT asignaturas con algún registro (cursadas
--     o convalidadas, cualquier estado).
--   - El DENOMINADOR (total de asignaturas_plan del plan) NO vive aquí: lo
--     aporta la vista final 171 (una sola agregación por grano, patrón 87).
--
-- Consumidor: vista_avance_academico_estudiante (171).
-- Orden de despliegue: después de 141 (recreada con asignatura_plan_id).
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_avance_academico_conteo;

CREATE VIEW vista_base_avance_academico_conteo AS
SELECT
  f.estudiante_id                          AS estudiante_id,
  f.plan_estudio_id                        AS plan_estudio_id,
  COUNT(DISTINCT CASE WHEN f.estado = 'APROBADO' THEN f.asignatura_plan_id END)    AS materias_aprobadas,
  COUNT(DISTINCT CASE WHEN f.estado = 'CONVALIDADO' THEN f.asignatura_plan_id END) AS materias_convalidadas,
  COUNT(DISTINCT CASE WHEN f.estado IN ('APROBADO', 'CONVALIDADO') THEN f.asignatura_plan_id END) AS materias_avanzadas,
  COUNT(DISTINCT f.asignatura_plan_id)     AS materias_registradas,
  MIN(f.gestion_anio)                      AS primera_gestion_anio,
  MAX(f.gestion_anio)                      AS ultima_gestion_anio
FROM vista_historial_academico_estudiante_fila f
WHERE f.plan_estudio_id IS NOT NULL
GROUP BY f.estudiante_id, f.plan_estudio_id;
