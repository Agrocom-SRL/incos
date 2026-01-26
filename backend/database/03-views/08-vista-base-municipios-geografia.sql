-- ============================================
-- VISTA BASE: vista_base_municipios_geografia
-- Información geográfica de municipios con provincia y departamento
--
-- Propósito: Vista base que une municipios + provincias + departamentos (3 tablas)
-- Reutilizable para residencia, origen de nacimiento, etc.
--
-- Relaciones según schemas:
-- - municipios.provincia_id → provincias.id
-- - provincias.departamento_id → departamentos.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_municipios_geografia;

CREATE VIEW vista_base_municipios_geografia AS
SELECT
  m.id AS municipio_id,
  m.nombre AS municipio_nombre,
  m.codigo AS municipio_codigo,
  m.provincia_id,
  p.nombre AS provincia_nombre,
  p.codigo AS provincia_codigo,
  p.departamento_id,
  d.nombre AS departamento_nombre,
  d.codigo AS departamento_codigo
FROM municipios m
INNER JOIN provincias p ON p.id = m.provincia_id
  AND p.activo = TRUE
  AND p.deleted_at IS NULL
INNER JOIN departamentos d ON d.id = p.departamento_id
  AND d.activo = TRUE
  AND d.deleted_at IS NULL
WHERE m.activo = TRUE
  AND m.deleted_at IS NULL;
