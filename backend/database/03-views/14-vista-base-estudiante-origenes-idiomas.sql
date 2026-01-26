-- ============================================
-- VISTA BASE: vista_base_estudiante_origenes_idiomas
-- Pieza modular: idioma primario (materno) y secundario por origen, con catálogo idiomas
--
-- Propósito: Vista que une estudiantes_origenes + idiomas (materno) + idiomas (secundario).
-- Solo estudiante_id, origen_id e idiomas del catálogo. Se une a vista_base_estudiante_origenes
-- por origen_id cuando se necesitan idiomas. No incluye datos propios del estudiante.
--
-- Relaciones:
-- - estudiantes_origenes.estudiante_id → estudiantes.id
-- - estudiantes_origenes.idioma_materno_id → idiomas.id
-- - estudiantes_origenes.idioma_secundario_id → idiomas.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_estudiante_origenes_idiomas;

CREATE VIEW vista_base_estudiante_origenes_idiomas AS
SELECT
  eo.id AS origen_id,
  eo.estudiante_id,
  eo.idioma_materno_id,
  eo.idioma_secundario_id,
  im.nombre AS idioma_materno_nombre,
  im.codigo_iso AS idioma_materno_codigo_iso,
  isec.nombre AS idioma_secundario_nombre,
  isec.codigo_iso AS idioma_secundario_codigo_iso
FROM estudiantes_origenes eo
LEFT JOIN idiomas im ON im.id = eo.idioma_materno_id
  AND im.activo = TRUE
  AND im.deleted_at IS NULL
LEFT JOIN idiomas isec ON isec.id = eo.idioma_secundario_id
  AND isec.activo = TRUE
  AND isec.deleted_at IS NULL
WHERE eo.activo = TRUE
  AND eo.deleted_at IS NULL;
