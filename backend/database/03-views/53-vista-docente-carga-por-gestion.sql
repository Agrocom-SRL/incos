-- ============================================
-- VISTA: vista_docente_carga_por_gestion
-- Resumen de carga académica del docente por gestión y plan habilitado
--
-- Propósito: Agrega asignaciones por docente + gestión reutilizando la vista base
-- vista_base_docente_asignaciones_curso (mismo patrón que vistas de estadísticas
-- que consumen vista_base_paralelos_info).
--
-- Uso típico:
--   SELECT * FROM vista_docente_carga_por_gestion WHERE docente_id = 15;
--   SELECT * FROM vista_docente_carga_por_gestion WHERE gestion_anio = 2026;
--
-- Reutiliza:
-- - vista_base_docente_ficha
-- - vista_base_docente_asignaciones_curso
--
-- Orden de despliegue: ejecutar antes 50, 51 (y 52 si aplica); luego este script.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_docente_carga_por_gestion;

CREATE VIEW vista_docente_carga_por_gestion AS
SELECT
  f.docente_id,
  f.nombres AS docente_nombres,
  f.apellido_paterno AS docente_apellido_paterno,
  f.apellido_materno AS docente_apellido_materno,
  f.ci AS docente_ci,
  f.expedicion AS docente_expedicion,
  f.estado_laboral AS docente_estado_laboral,
  agg.gestion_anio,
  agg.gestion_nombre,
  agg.gestion_plan_nombre,
  agg.total_asignaciones,
  agg.num_asignaciones_vigentes,
  agg.horas_semanales_vigentes
FROM vista_base_docente_ficha f
LEFT JOIN (
  SELECT
    docente_id,
    gestion_anio,
    gestion_nombre,
    gestion_plan_nombre,
    COUNT(*) AS total_asignaciones,
    SUM(CASE WHEN vigente THEN 1 ELSE 0 END) AS num_asignaciones_vigentes,
    SUM(
      CASE
        WHEN vigente THEN COALESCE(carga_horaria, horas_plan)
        ELSE 0
      END
    ) AS horas_semanales_vigentes
  FROM vista_base_docente_asignaciones_curso
  GROUP BY
    docente_id,
    gestion_anio,
    gestion_nombre,
    gestion_plan_nombre
) agg ON agg.docente_id = f.docente_id;
