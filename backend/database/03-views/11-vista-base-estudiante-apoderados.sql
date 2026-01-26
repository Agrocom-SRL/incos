-- ============================================
-- VISTA BASE: vista_base_estudiante_apoderados
-- Pieza concatenada (cabeza): apoderados/tutores del estudiante con tipo de parentesco
--
-- Propósito: Vista que une estudiantes_apoderados + tipos_parentesco.
-- Solo estudiante_id y datos de apoderado (nombres, apellidos, contacto, parentesco).
-- No incluye datos propios del estudiante. Se une por estudiante_id al torso.
--
-- Relaciones:
-- - estudiantes_apoderados.estudiante_id → estudiantes.id
-- - estudiantes_apoderados.tipo_parentesco_id → tipos_parentesco.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_estudiante_apoderados;

CREATE VIEW vista_base_estudiante_apoderados AS
SELECT
  ea.id AS apoderado_id,
  ea.estudiante_id,
  ea.tipo_parentesco_id,
  ea.nombres AS apoderado_nombres,
  ea.apellidos AS apoderado_apellidos,
  ea.celular_1,
  ea.celular_2,
  ea.vive_con_estudiante,
  tp.nombre AS tipo_parentesco_nombre
FROM estudiantes_apoderados ea
LEFT JOIN tipos_parentesco tp ON tp.id = ea.tipo_parentesco_id
  AND tp.activo = TRUE
  AND tp.deleted_at IS NULL
WHERE ea.activo = TRUE
  AND ea.deleted_at IS NULL;
