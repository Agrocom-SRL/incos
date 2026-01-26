-- ============================================
-- VISTA BASE: vista_base_estudiante_estado_civil
-- Pieza modular: solo estado civil del estudiante
--
-- Propósito: Vista que une estudiantes (solo llave) + estados_civiles.
-- No incluye datos propios del estudiante (esos van en el torso, p. ej. tabla estudiantes).
-- Se une a otras piezas por estudiante_id para construir la vista global.
--
-- Relaciones:
-- - estudiantes.estado_civil_id → estados_civiles.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_estudiante_estado_civil;

CREATE VIEW vista_base_estudiante_estado_civil AS
SELECT
  e.id AS estudiante_id,
  e.estado_civil_id,
  ec.nombre AS estado_civil_nombre,
  ec.abreviatura AS estado_civil_abreviatura
FROM estudiantes e
LEFT JOIN estados_civiles ec ON ec.id = e.estado_civil_id
  AND ec.activo = TRUE
  AND ec.deleted_at IS NULL
WHERE e.activo = TRUE
  AND e.deleted_at IS NULL;
