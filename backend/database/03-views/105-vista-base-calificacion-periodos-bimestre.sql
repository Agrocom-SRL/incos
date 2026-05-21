-- ============================================
-- VISTA BASE: vista_base_calificacion_periodos_bimestre
-- Bimestres del calendario académico por gestión, con estado según fechas.
--
-- Misma lógica de estado que vista_calificacion_contexto_vigente.
-- El repositorio filtra: WHERE gestion_id = ?
--
-- Orden de despliegue: 07-parte3 (periodos_academicos); después de 103.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_calificacion_periodos_bimestre;

CREATE VIEW vista_base_calificacion_periodos_bimestre AS
SELECT
  pa.gestion_id,
  pa.id AS periodo_academico_id,
  pa.numero_orden,
  pa.nombre,
  pa.fecha_inicio,
  pa.fecha_fin,
  pa.color_hex,
  CASE
    WHEN CURDATE() BETWEEN pa.fecha_inicio AND pa.fecha_fin THEN 'abierto'
    WHEN CURDATE() > pa.fecha_fin THEN 'cerrado'
    ELSE 'futuro'
  END AS estado_calendario
FROM periodos_academicos pa
WHERE pa.division = 'BIMESTRE'
  AND pa.activo = TRUE
  AND pa.deleted_at IS NULL;
