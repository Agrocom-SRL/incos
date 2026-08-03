-- ============================================
-- VISTA: vista_tutoria_avance_carrera
-- Agregado de avance de tutorías por gestión × carrera (módulo TIT ·
-- titulación, Requisito 2 — reporte de avance por carrera).
--
-- Grano: una fila por (gestion_id, carrera). Vista final delgada (patrón 87 /
-- 157): agrega la base 160 (ya ajustada con ultima_observacion, ver D1) por
-- carrera; no reescribe la cadena de bitácora/avances.
--
-- Base: 160 vista_tutoria_proyectos_listado (proyecto de grado + agregados de
-- seguimiento). observaciones_pendientes ya viene resuelto en la 160
-- (bitácora en estado PENDIENTE).
--
-- Consumidores:
--   - TutoriaAvanceViewRepository (backend) →
--     GET /proyectos-grado/reportes/avance-carrera (resumen por carrera) y
--     GET /proyectos-grado/reportes/avance-carrera/pdf.
--
-- Uso:
--   SELECT * FROM vista_tutoria_avance_carrera
--   WHERE gestion_id = ?
--   ORDER BY carrera_nombre;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_tutoria_avance_carrera;

CREATE VIEW vista_tutoria_avance_carrera AS
SELECT
  base.gestion_id       AS gestion_id,
  base.carrera_id        AS carrera_id,
  base.carrera_codigo    AS carrera_codigo,
  base.carrera_nombre    AS carrera_nombre,
  COUNT(*)                AS total_proyectos,
  ROUND(AVG(base.porcentaje_avance), 2) AS promedio_avance,
  SUM(CASE WHEN base.observaciones_pendientes > 0 THEN 1 ELSE 0 END) AS proyectos_con_observaciones_pendientes
FROM vista_tutoria_proyectos_listado base
GROUP BY
  base.gestion_id, base.carrera_id, base.carrera_codigo, base.carrera_nombre;
