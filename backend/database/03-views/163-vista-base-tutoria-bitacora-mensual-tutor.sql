-- ============================================
-- VISTA BASE: vista_base_tutoria_bitacora_mensual_tutor
-- Bitácora de tutorías agregada por tutor y mes (módulo TUT · titulación).
--
-- Grano: una fila por (tutor, carrera, gestión, mes 'YYYY-MM'). Cubre la
-- planilla DDE de "tutorías programadas/desarrolladas en el mes" que el
-- tutor reporta a la Dirección Académica.
--
-- Bases:
--   - bitacora_proyecto (satélite, schema 23)
--   - proyectos_grado (raíz: tutor, carrera, gestión)
--   - docentes / carreras (catálogos; tutor_nombre en orden institucional
--     APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES)
--
-- Consumidores:
--   - ProyectoGradoListadoViewRepository (backend) →
--     GET /proyectos-grado/reportes/bitacora-mensual (PDF vía
--     BitacoraMensualTutorPdfGenerator).
--
-- Uso:
--   SELECT * FROM vista_base_tutoria_bitacora_mensual_tutor
--   WHERE mes = ? AND gestion_id = ?
--   ORDER BY tutor_nombre, carrera_nombre;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_tutoria_bitacora_mensual_tutor;

CREATE VIEW vista_base_tutoria_bitacora_mensual_tutor AS
SELECT
  p.tutor_id           AS tutor_id,
  NULLIF(TRIM(CONCAT_WS(' ', d.apellido_paterno, d.apellido_materno, d.nombres)), '') AS tutor_nombre,
  c.id                 AS carrera_id,
  c.codigo             AS carrera_codigo,
  c.nombre             AS carrera_nombre,
  p.gestion_id         AS gestion_id,
  DATE_FORMAT(b.fecha, '%Y-%m') AS mes,
  COUNT(*)             AS tutorias_registradas,
  SUM(CASE WHEN b.confirmado_estudiante = TRUE THEN 1 ELSE 0 END) AS tutorias_confirmadas,
  COUNT(DISTINCT b.proyecto_grado_id) AS proyectos_atendidos
FROM bitacora_proyecto b
INNER JOIN proyectos_grado p
  ON p.id = b.proyecto_grado_id
  AND p.activo = TRUE
  AND p.deleted_at IS NULL
LEFT JOIN docentes d
  ON d.id = p.tutor_id
  AND d.deleted_at IS NULL
LEFT JOIN carreras c
  ON c.id = p.carrera_id
  AND c.deleted_at IS NULL
WHERE b.activo = TRUE
  AND b.deleted_at IS NULL
GROUP BY
  p.tutor_id, tutor_nombre, c.id, c.codigo, c.nombre, p.gestion_id,
  DATE_FORMAT(b.fecha, '%Y-%m');
