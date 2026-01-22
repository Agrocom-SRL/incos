-- ============================================
-- VISTA BASE: vista_base_paralelos_info
-- Información básica de paralelos con periodos y carreras
-- 
-- Propósito: Vista base que une paralelos + periodos + carreras (3 tablas)
-- Reutilizable para construir vistas más complejas
-- 
-- Relaciones según schemas:
-- - paralelos.carrera_id → carreras.id
-- - paralelos.periodo_id → periodos.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_paralelos_info;

CREATE VIEW vista_base_paralelos_info AS
SELECT 
  p.id AS paralelo_id,
  p.nombre AS paralelo_nombre,
  p.turno AS paralelo_turno,
  p.descripcion AS paralelo_descripcion,
  p.carrera_id,
  p.periodo_id,
  car.nombre AS carrera_nombre,
  car.codigo AS carrera_codigo,
  per.numero AS periodo_numero,
  per.nombre AS periodo_nombre
FROM paralelos p
INNER JOIN periodos per ON per.id = p.periodo_id
  AND per.activo = TRUE 
  AND per.deleted_at IS NULL
INNER JOIN carreras car ON car.id = p.carrera_id
  AND car.activo = TRUE 
  AND car.deleted_at IS NULL
WHERE p.activo = TRUE 
  AND p.deleted_at IS NULL;
