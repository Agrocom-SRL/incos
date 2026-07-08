-- ============================================
-- VISTA: vista_catalogos_complementarios_usos
-- Conteo de usos de los 4 catálogos complementarios de referencia
-- (tipos de discapacidad, tipos de parentesco, idiomas, estados civiles).
--
-- Propósito:
-- - Una fila por catálogo + ítem del catálogo con la cantidad de registros
--   activos que lo referencian, separada por fuente (estudiantes / docentes /
--   personal). Los ítems SIN uso NO aparecen (el repositorio hace COALESCE 0).
-- - Consumida por ComplementariosUsosViewRepository (getUsosByCatalogo) para
--   enriquecer los listados GET de discapacidades, tiposParentesco, idiomas y
--   estadosCiviles con cantidadEstudiantes / cantidadDocentes / cantidadPersonal.
--
-- CONTRATO (5 columnas, mismo orden en TODOS los bloques — requisito del UNION):
--   catalogo             VARCHAR  'DISCAPACIDAD' | 'PARENTESCO' | 'IDIOMA' | 'ESTADO_CIVIL'
--   item_id              INT      id del ítem en su tabla de catálogo
--   cantidad_estudiantes INT      estudiantes que usan el ítem
--   cantidad_docentes    INT      docentes que usan el ítem
--   cantidad_personal    INT      personal administrativo que usa el ítem
--
-- Fuentes por catálogo (todas con soft delete activo = TRUE AND deleted_at IS NULL):
--   DISCAPACIDAD  estudiantes_discapacidades.tipo_discapacidad_id (estudiantes DISTINTOS)
--   PARENTESCO    estudiantes_apoderados.tipo_parentesco_id (estudiantes DISTINTOS)
--   IDIOMA        estudiantes_origenes.idioma_materno_id ∪ idioma_secundario_id
--                 (estudiantes DISTINTOS; un estudiante cuenta 1 vez por idioma)
--   ESTADO_CIVIL  estudiantes.estado_civil_id, docentes.estado_civil_id,
--                 personal.estado_civil_id (COUNT por fuente)
--
-- Uso:
-- SELECT item_id, cantidad_estudiantes, cantidad_docentes, cantidad_personal
-- FROM vista_catalogos_complementarios_usos
-- WHERE catalogo = 'IDIOMA';
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_catalogos_complementarios_usos;

CREATE VIEW vista_catalogos_complementarios_usos AS
-- DISCAPACIDAD: estudiantes distintos con el tipo de discapacidad
SELECT
  'DISCAPACIDAD'                    AS catalogo,
  ed.tipo_discapacidad_id           AS item_id,
  COUNT(DISTINCT ed.estudiante_id)  AS cantidad_estudiantes,
  0                                 AS cantidad_docentes,
  0                                 AS cantidad_personal
FROM estudiantes_discapacidades ed
WHERE ed.tipo_discapacidad_id IS NOT NULL
  AND ed.estudiante_id IS NOT NULL
  AND ed.activo = TRUE
  AND ed.deleted_at IS NULL
GROUP BY ed.tipo_discapacidad_id

UNION ALL

-- PARENTESCO: estudiantes distintos con apoderado de ese parentesco
SELECT
  'PARENTESCO'                      AS catalogo,
  ea.tipo_parentesco_id             AS item_id,
  COUNT(DISTINCT ea.estudiante_id)  AS cantidad_estudiantes,
  0                                 AS cantidad_docentes,
  0                                 AS cantidad_personal
FROM estudiantes_apoderados ea
WHERE ea.tipo_parentesco_id IS NOT NULL
  AND ea.estudiante_id IS NOT NULL
  AND ea.activo = TRUE
  AND ea.deleted_at IS NULL
GROUP BY ea.tipo_parentesco_id

UNION ALL

-- IDIOMA: estudiantes distintos que declaran el idioma como materno o secundario
SELECT
  'IDIOMA'                              AS catalogo,
  idi.idioma_id                         AS item_id,
  COUNT(DISTINCT idi.estudiante_id)     AS cantidad_estudiantes,
  0                                     AS cantidad_docentes,
  0                                     AS cantidad_personal
FROM (
  SELECT eo.idioma_materno_id AS idioma_id, eo.estudiante_id
  FROM estudiantes_origenes eo
  WHERE eo.idioma_materno_id IS NOT NULL
    AND eo.estudiante_id IS NOT NULL
    AND eo.activo = TRUE
    AND eo.deleted_at IS NULL
  UNION ALL
  SELECT eo.idioma_secundario_id AS idioma_id, eo.estudiante_id
  FROM estudiantes_origenes eo
  WHERE eo.idioma_secundario_id IS NOT NULL
    AND eo.estudiante_id IS NOT NULL
    AND eo.activo = TRUE
    AND eo.deleted_at IS NULL
) idi
GROUP BY idi.idioma_id

UNION ALL

-- ESTADO_CIVIL: personas activas por fuente (estudiantes / docentes / personal)
SELECT
  'ESTADO_CIVIL'                    AS catalogo,
  fuentes.item_id                   AS item_id,
  SUM(fuentes.fuente = 'ESTUDIANTE') AS cantidad_estudiantes,
  SUM(fuentes.fuente = 'DOCENTE')    AS cantidad_docentes,
  SUM(fuentes.fuente = 'PERSONAL')   AS cantidad_personal
FROM (
  SELECT 'ESTUDIANTE' AS fuente, e.estado_civil_id AS item_id
  FROM estudiantes e
  WHERE e.estado_civil_id IS NOT NULL
    AND e.activo = TRUE
    AND e.deleted_at IS NULL
  UNION ALL
  SELECT 'DOCENTE' AS fuente, d.estado_civil_id AS item_id
  FROM docentes d
  WHERE d.estado_civil_id IS NOT NULL
    AND d.activo = TRUE
    AND d.deleted_at IS NULL
  UNION ALL
  SELECT 'PERSONAL' AS fuente, p.estado_civil_id AS item_id
  FROM personal p
  WHERE p.estado_civil_id IS NOT NULL
    AND p.activo = TRUE
    AND p.deleted_at IS NULL
) fuentes
GROUP BY fuentes.item_id;
