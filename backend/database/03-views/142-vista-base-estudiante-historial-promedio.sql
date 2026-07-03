-- ============================================
-- VISTA BASE: vista_base_estudiante_historial_promedio
-- Promedio ENTERO del historial académico por estudiante (una fila por estudiante).
--
-- Reutiliza:
-- - 141 vista_historial_academico_estudiante_fila (nota efectiva por precedencia
--   + arrastre/convalidación) — MISMO universo de filas que consume
--   GetHistorialAcademicoUseCase, para que este promedio coincida con
--   `resumen.promedioGeneral` del transcript.
--
-- Regla (idéntica al use case): AVG de notas efectivas de filas con estado
-- APROBADO o CONVALIDADO (incluye CONVALIDADO con nota de historial_previo),
-- ignorando notas NULL; redondeado a ENTERO (Math.round).
--
-- Consumidor: vista_estudiante_resumen_academico (143) → listado de estudiantes
-- (landing Historial académico).
--
-- Dependencias (ejecutar antes):
-- - 141-vista-historial-academico-estudiante-fila.sql
-- ============================================
USE instituto_incos;

DROP VIEW IF EXISTS vista_base_estudiante_historial_promedio;

CREATE VIEW vista_base_estudiante_historial_promedio AS
SELECT
  f.estudiante_id,
  CAST(ROUND(AVG(f.nota_final)) AS SIGNED) AS promedio_historial
FROM vista_historial_academico_estudiante_fila f
WHERE f.estado IN ('APROBADO', 'CONVALIDADO')
  AND f.nota_final IS NOT NULL
GROUP BY f.estudiante_id;
