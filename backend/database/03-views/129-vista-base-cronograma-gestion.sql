-- ============================================
-- VISTA BASE: vista_base_cronograma_gestion
-- Cronograma / calendario académico (actividades) por gestión, agrupable por periodo.
-- Une actividades_calendario + actividades (catálogo) + periodos_academicos.
--
-- El repositorio filtra: WHERE gestion_id = ?
-- Una fila por actividad del calendario; el periodo (bimestre/planificación/clausura)
-- viene desnormalizado para agrupar en el frontend sin más consultas.
--
-- Orden de despliegue: 07-parte3 (periodos_academicos), 17/20 (actividades); después de 105.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_cronograma_gestion;

CREATE VIEW vista_base_cronograma_gestion AS
SELECT
  pa.gestion_id,
  ac.id                                       AS actividad_calendario_id,
  ac.periodo_academico_id,
  pa.nombre                                   AS periodo_nombre,
  pa.numero_orden                             AS periodo_numero_orden,
  pa.division                                 AS periodo_division,
  pa.color_hex                                AS periodo_color,
  pa.fecha_inicio                             AS periodo_fecha_inicio,
  pa.fecha_fin                                AS periodo_fecha_fin,
  ac.actividad_id,
  a.tipo,
  a.icono,
  a.es_destacada,
  COALESCE(ac.nombre_personalizado, a.nombre) AS nombre,
  a.descripcion,
  ac.codigo,
  ac.fecha_inicio,
  ac.fecha_fin,
  ac.carreras_ids,
  CASE
    WHEN CURDATE() < ac.fecha_inicio THEN 'futura'
    WHEN ac.fecha_fin IS NOT NULL AND CURDATE() > ac.fecha_fin THEN 'pasada'
    WHEN ac.fecha_fin IS NULL AND CURDATE() > ac.fecha_inicio THEN 'pasada'
    ELSE 'vigente'
  END                                         AS estado_actividad
FROM actividades_calendario ac
JOIN periodos_academicos pa
  ON pa.id = ac.periodo_academico_id
  AND pa.activo = TRUE
  AND pa.deleted_at IS NULL
LEFT JOIN actividades a
  ON a.id = ac.actividad_id
  AND a.deleted_at IS NULL
WHERE ac.activo = TRUE
  AND ac.deleted_at IS NULL
ORDER BY pa.fecha_inicio, ac.fecha_inicio, ac.id;
