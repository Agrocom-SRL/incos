-- ============================================
-- VISTA BASE: vista_base_estudiante_origenes
-- Pieza concatenada (pie): orígenes/nacionalidades del estudiante con geografía, país y ciudad
--
-- Propósito: Vista que une estudiantes_origenes + vista_base_municipios_geografia
-- (municipio nacimiento) + paises. Siempre expone país y ciudad:
-- - Boliviana: país = Bolivia (catálogo paises, codigo_iso BOL), ciudad = ciudad_nacimiento o municipio.
-- - Extranjera: país = paises por pais_id, ciudad = ciudad_nacimiento.
-- No incluye idiomas (ver vista_base_estudiante_origenes_idiomas). Se une por estudiante_id al torso.
--
-- Relaciones:
-- - estudiantes_origenes.estudiante_id → estudiantes.id
-- - estudiantes_origenes.municipio_nacimiento_id → vista_base_municipios_geografia.municipio_id
-- - estudiantes_origenes.pais_id → paises.id
-- - Bolivia por codigo_iso = 'BOL' cuando pais_id IS NULL (origen boliviano)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_estudiante_origenes;

CREATE VIEW vista_base_estudiante_origenes AS
SELECT
  eo.id AS origen_id,
  eo.estudiante_id,
  eo.pais_id,
  eo.municipio_nacimiento_id,
  eo.tipo_origen,
  eo.es_principal,
  -- País siempre: extranjero → paises por pais_id; boliviana → Bolivia (BOL) si pais_id IS NULL
  COALESCE(p.id, bol.id) AS pais_id_efectivo,
  COALESCE(p.nombre, bol.nombre) AS pais_nombre,
  COALESCE(p.codigo_iso, bol.codigo_iso) AS pais_codigo_iso,
  -- Ciudad siempre: ciudad_nacimiento o, si falta, municipio de nacimiento (Bolivia)
  COALESCE(eo.ciudad_nacimiento, g.municipio_nombre) AS ciudad,
  eo.ciudad_nacimiento AS ciudad_nacimiento_raw,
  -- Geografía de nacimiento (Bolivia) - incluir IDs para mapeo en frontend
  g.municipio_id        AS nacimiento_municipio_id,
  g.provincia_id        AS nacimiento_provincia_id,
  g.departamento_id     AS nacimiento_departamento_id,
  g.municipio_nombre    AS nacimiento_municipio_nombre,
  g.municipio_codigo    AS nacimiento_municipio_codigo,
  g.provincia_nombre    AS nacimiento_provincia_nombre,
  g.departamento_nombre AS nacimiento_departamento_nombre
FROM estudiantes_origenes eo
LEFT JOIN vista_base_municipios_geografia g ON g.municipio_id = eo.municipio_nacimiento_id
LEFT JOIN paises p ON p.id = eo.pais_id
  AND p.activo = TRUE
  AND p.deleted_at IS NULL
LEFT JOIN paises bol ON bol.codigo_iso = 'BOL'
  AND bol.activo = TRUE
  AND bol.deleted_at IS NULL
WHERE eo.activo = TRUE
  AND eo.deleted_at IS NULL;
