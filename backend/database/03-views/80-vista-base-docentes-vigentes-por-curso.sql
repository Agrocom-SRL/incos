-- ============================================
-- VISTA BASE: vista_base_docentes_vigentes_por_curso
-- Docente vigente consolidado por oferta (curso_id = oferta_curso_id)
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docentes_vigentes_por_curso;

CREATE VIEW vista_base_docentes_vigentes_por_curso AS
SELECT
  ad.oferta_curso_id AS curso_id,
  MAX(TRIM(CONCAT_WS(' ', dc.nombres, dc.apellido_paterno, dc.apellido_materno))) AS docente_nombre
FROM asignaciones_docentes ad
INNER JOIN docentes dc ON dc.id = ad.docente_id
  AND dc.deleted_at IS NULL
  AND dc.activo = 1
WHERE ad.deleted_at IS NULL
  AND ad.activo = 1
  AND ad.vigente = 1
GROUP BY ad.oferta_curso_id;
