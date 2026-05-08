-- ============================================
-- VISTA BASE: vista_base_docentes_vigentes_por_curso
-- Docente vigente consolidado por curso
--
-- Propósito: Exponer un docente (nombre completo) por curso para reutilizar en
-- vistas de grillas semanales y asignación de aulas.
--
-- Nota: Si por datos existen múltiples docentes vigentes en un curso, se
-- consolida con MAX(...) para mantener una fila por curso.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docentes_vigentes_por_curso;

CREATE VIEW vista_base_docentes_vigentes_por_curso AS
SELECT
  ad.curso_id,
  MAX(TRIM(CONCAT_WS(' ', dc.nombres, dc.apellido_paterno, dc.apellido_materno))) AS docente_nombre
FROM asignaciones_docentes ad
INNER JOIN docentes dc ON dc.id = ad.docente_id
  AND dc.deleted_at IS NULL
  AND dc.activo = 1
WHERE ad.deleted_at IS NULL
  AND ad.activo = 1
  AND ad.vigente = 1
GROUP BY ad.curso_id;
