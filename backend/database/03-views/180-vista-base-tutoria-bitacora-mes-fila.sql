-- ============================================
-- VISTA BASE: vista_base_tutoria_bitacora_mes_fila
-- Entradas de bitácora de tutoría con año/mes resueltos directamente de la
-- fecha (módulo TIT · titulación, "Seguimiento de tutorías a docentes" —
-- 2026-08-10, reemplaza la planilla de avance "10 en 10" de 3er año, que
-- dependía de Matrícula/periodo_numero=3 sin datos en desarrollo y no
-- correspondía a ningún documento físico real).
--
-- Grano: una fila por entrada de bitacora_proyecto, con anio/mes derivados
-- de YEAR(fecha)/MONTH(fecha). A diferencia de la versión anterior (bimestre
-- resuelto por JOIN contra periodos_academicos), aquí NO hay join a
-- periodos_academicos: el filtro es mes calendario administrativo, no
-- bimestre académico.
--
-- Consumidor: TutoriaAvanceViewRepository.findSeguimientoTutoriaDocentes
-- (backend) — LEFT JOIN de esta vista, filtrada por año/mes en el
-- repositorio, contra el roster de la vista 181
-- (vista_tutoria_seguimiento_docentes).
--
-- Uso:
--   SELECT * FROM vista_base_tutoria_bitacora_mes_fila
--   WHERE proyecto_grado_id = ? AND anio = ? AND mes = ?
--   ORDER BY fecha;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_tutoria_bitacora_bimestre_fila;
DROP VIEW IF EXISTS vista_base_tutoria_bitacora_mes_fila;

CREATE VIEW vista_base_tutoria_bitacora_mes_fila AS
SELECT
  b.id                  AS bitacora_id,
  b.proyecto_grado_id   AS proyecto_grado_id,
  b.tipo                 AS tipo,
  YEAR(b.fecha)           AS anio,
  MONTH(b.fecha)          AS mes,
  b.fecha                 AS fecha,
  b.actividad             AS actividad,
  b.porcentaje_avance    AS porcentaje_avance,
  b.observaciones        AS observaciones
FROM bitacora_proyecto b
INNER JOIN proyectos_grado p
  ON p.id = b.proyecto_grado_id
  AND p.activo = TRUE
  AND p.deleted_at IS NULL
WHERE b.activo = TRUE
  AND b.deleted_at IS NULL;
