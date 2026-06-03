-- ============================================
-- VISTA BASE: vista_base_docentes_vigentes_por_curso
-- Asignación docente vigente consolidada por oferta (curso_id = oferta_curso_id).
--
-- Consumidores: horarios (81, 85), oferta académica (CourseOfferRepository),
-- cobertura «sin docente» vía NOT EXISTS.
--
-- Modelo de negocio: una fila por oferta_curso con docente vigente activo.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docentes_vigentes_por_curso;

CREATE VIEW vista_base_docentes_vigentes_por_curso AS
SELECT
  ad.oferta_curso_id AS curso_id,
  MAX(ad.id) AS asignacion_docente_id,
  MAX(ad.docente_id) AS docente_id,
  MAX(ad.carga_horaria) AS carga_horaria,
  MAX(ad.fecha_asignacion) AS fecha_asignacion,
  MAX(TRIM(CONCAT_WS(' ', dc.nombres, dc.apellido_paterno, dc.apellido_materno))) AS docente_nombre,
  MAX(dc.color_hex) AS color_hex
FROM asignaciones_docentes ad
INNER JOIN docentes dc ON dc.id = ad.docente_id
  AND dc.deleted_at IS NULL
  AND dc.activo = 1
WHERE ad.deleted_at IS NULL
  AND ad.activo = 1
  AND ad.vigente = 1
  AND ad.docente_id IS NOT NULL
GROUP BY ad.oferta_curso_id;
