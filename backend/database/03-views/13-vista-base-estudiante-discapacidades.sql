-- ============================================
-- VISTA BASE: vista_base_estudiante_discapacidades
-- Pieza concatenada (brazo): discapacidades del estudiante con tipo y detalle
--
-- Propósito: Vista que une estudiantes_discapacidades + tipos_discapacidad.
-- Relación con schema: estudiantes.tiene_discapacidad indica si hay discapacidad;
-- los detalles están en estudiantes_discapacidades. Esta vista aporta el detalle
-- (tipo, grado, causa, descripción) por estudiante_id.
-- No incluye datos propios del estudiante. Se une por estudiante_id al torso.
--
-- Relaciones:
-- - estudiantes_discapacidades.estudiante_id → estudiantes.id
-- - estudiantes_discapacidades.tipo_discapacidad_id → tipos_discapacidad.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_estudiante_discapacidades;

CREATE VIEW vista_base_estudiante_discapacidades AS
SELECT
  ed.id AS discapacidad_id,
  ed.estudiante_id,
  ed.tipo_discapacidad_id,
  ed.descripcion AS discapacidad_descripcion,
  ed.grado_discapacidad,
  ed.causa AS discapacidad_causa,
  td.nombre AS tipo_discapacidad_nombre
FROM estudiantes_discapacidades ed
LEFT JOIN tipos_discapacidad td ON td.id = ed.tipo_discapacidad_id
  AND td.activo = TRUE
  AND td.deleted_at IS NULL
WHERE ed.activo = TRUE
  AND ed.deleted_at IS NULL;
