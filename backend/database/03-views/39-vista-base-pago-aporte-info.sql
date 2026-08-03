-- ============================================
-- VISTA BASE: vista_base_pago_aporte_info
-- Información básica de cabecera de aporte con estudiante, gestión y beca
--
-- Propósito: Vista base que une pago_aporte + estudiantes + gestiones +
-- estudiantes_becas + becas_descuentos (2 INNER + 2 LEFT).
-- Reutilizable para listado o reportes de pagos.
--
-- Relaciones:
-- - pago_aporte.estudiante_id → estudiantes.id
-- - pago_aporte.gestion_id → gestiones.id
-- - pago_aporte.estudiante_beca_id → estudiantes_becas.id (LEFT)
-- - estudiantes_becas.beca_descuento_id → becas_descuentos.id (LEFT)
-- - pago_aporte.estudiante_id → vista_base_estudiante_carrera_reciente (LEFT, carrera reciente)
--
-- Dependencias (ejecutar antes):
-- - 38-vista-base-estudiante-carrera-reciente.sql
--
-- Uso:
-- SELECT * FROM vista_base_pago_aporte_info WHERE id = ?;
-- SELECT * FROM vista_base_pago_aporte_info WHERE estudiante_id = ? AND gestion_id = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_pago_aporte_info;

CREATE VIEW vista_base_pago_aporte_info AS
SELECT
  -- Cabecera: pago_aporte
  pa.id,
  pa.estudiante_id,
  pa.gestion_id,
  pa.estudiante_beca_id,
  pa.monto_base,
  pa.descuento_beca,
  pa.monto_obligatorio,
  pa.estado,
  pa.created_at,
  -- Estudiante (nombre y código para listado/filtros)
  est.codigo_estudiante AS codigo_estudiante,
  est.nombres AS estudiante_nombres,
  est.apellido_paterno AS estudiante_apellido_paterno,
  est.apellido_materno AS estudiante_apellido_materno,
  -- Gestión
  g.nombre AS gestion_nombre,
  g.anio AS gestion_anio,
  -- Carrera reciente (reutiliza vista 38)
  cr.carrera_nombre,
  cr.carrera_codigo,
  cr.carrera_color_hex,
  -- Beca (nombre y porcentaje del descuento aplicado)
  bd.nombre AS beca_nombre,
  bd.porcentaje AS beca_porcentaje
FROM pago_aporte pa
INNER JOIN estudiantes est ON est.id = pa.estudiante_id
  AND est.activo = TRUE
  AND est.deleted_at IS NULL
INNER JOIN gestiones g ON g.id = pa.gestion_id
  AND g.activo = TRUE
  AND g.deleted_at IS NULL
LEFT JOIN vista_base_estudiante_carrera_reciente cr ON cr.estudiante_id = pa.estudiante_id
LEFT JOIN estudiantes_becas eb ON eb.id = pa.estudiante_beca_id
  AND eb.activo = TRUE
  AND eb.deleted_at IS NULL
LEFT JOIN becas_descuentos bd ON bd.id = eb.beca_descuento_id
  AND bd.activo = TRUE
  AND bd.deleted_at IS NULL
WHERE pa.activo = TRUE
  AND pa.deleted_at IS NULL;
