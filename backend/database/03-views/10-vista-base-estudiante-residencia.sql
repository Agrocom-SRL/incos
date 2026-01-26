-- ============================================
-- VISTA BASE: vista_base_estudiante_residencia
-- Pieza modular: solo residencia del estudiante (geografía + dirección/zona)
--
-- Propósito: Vista que une estudiantes (solo llave + datos de residencia)
--            con vista_base_municipios_geografia.
-- No repite datos propios del estudiante (esos están en vista_base_estudiante_estado_civil).
-- Se une a otras piezas por estudiante_id para construir la vista global.
--
-- Relaciones:
-- - estudiantes.municipio_residencia_id → vista_base_municipios_geografia.municipio_id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_estudiante_residencia;

CREATE VIEW vista_base_estudiante_residencia AS
SELECT
  e.id AS estudiante_id,
  e.municipio_residencia_id,
  e.direccion,
  e.zona,
  g.municipio_nombre    AS residencia_municipio_nombre,
  g.municipio_codigo    AS residencia_municipio_codigo,
  g.provincia_id        AS residencia_provincia_id,
  g.provincia_nombre    AS residencia_provincia_nombre,
  g.provincia_codigo    AS residencia_provincia_codigo,
  g.departamento_id     AS residencia_departamento_id,
  g.departamento_nombre AS residencia_departamento_nombre,
  g.departamento_codigo AS residencia_departamento_codigo
FROM estudiantes e
LEFT JOIN vista_base_municipios_geografia g ON g.municipio_id = e.municipio_residencia_id
WHERE e.activo = TRUE
  AND e.deleted_at IS NULL;
