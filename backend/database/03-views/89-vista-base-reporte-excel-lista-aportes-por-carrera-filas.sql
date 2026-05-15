-- ============================================
-- VISTA BASE: vista_base_reporte_excel_lista_aportes_por_carrera_filas
-- Inscripción-paralelo ya deduplicada + cabecera de aporte y beca, sin texto de cuotas.
--
-- Propósito:
-- - Encapsular JOIN a vista_pago_aporte_listado y tablas de beca
--   para el Excel de aportes por carrera.
--
-- Reutiliza:
-- - vista_base_reporte_excel_inscripcion_paralelo_max_periodo
-- - vista_pago_aporte_listado
-- - estudiantes_becas
-- - becas_descuentos
--
-- Uso:
-- SELECT *
-- FROM vista_base_reporte_excel_lista_aportes_por_carrera_filas
-- WHERE gestion_id = 2 AND carrera_id = 1
-- ORDER BY paralelo_nombre, apellido_paterno, apellido_materno, nombres;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_reporte_excel_lista_aportes_por_carrera_filas;

CREATE VIEW vista_base_reporte_excel_lista_aportes_por_carrera_filas AS
SELECT
  ins.gestion_id,
  ins.gestion_nombre,
  ins.gestion_anio,

  ins.carrera_id,
  ins.carrera_nombre,
  ins.carrera_codigo,

  ins.periodo_id,
  ins.periodo_numero,
  ins.periodo_nombre,

  ins.paralelo_id,
  ins.paralelo_nombre,
  ins.paralelo_turno,
  ins.paralelo_descripcion,

  ins.inscripcion_id,
  ins.estudiante_id,
  ins.codigo_estudiante,

  ins.apellido_paterno,
  ins.apellido_materno,
  ins.nombres,
  ins.nombre_completo,

  ins.ci,
  ins.expedicion,
  ins.sexo,
  ins.celular,

  ins.observaciones,

  pl.id AS pago_aporte_id,
  pl.monto_base AS aporte_monto_base,
  pl.descuento_beca,
  pl.monto_obligatorio AS monto_total_deuda,
  COALESCE(pl.total_pagado, 0) AS monto_pagado,
  COALESCE(pl.saldo_pendiente, 0) AS saldo_pendiente,
  COALESCE(pl.cantidad_pagos, 0) AS cantidad_cuotas,
  pl.estado AS estado_aporte,

  bd.nombre AS beca_descuento_nombre,
  COALESCE(bd.porcentaje, 0) AS beca_porcentaje,

  CASE
    WHEN pl.estudiante_beca_id IS NULL THEN 'NO APLICA'
    WHEN bd.id IS NULL THEN 'NO APLICA'
    ELSE bd.nombre
  END AS beca_tipo_nombre

FROM vista_base_reporte_excel_inscripcion_paralelo_max_periodo ins

LEFT JOIN vista_pago_aporte_listado pl
  ON pl.estudiante_id = ins.estudiante_id
  AND pl.gestion_id = ins.gestion_id

LEFT JOIN estudiantes_becas eb
  ON eb.id = pl.estudiante_beca_id
  AND eb.activo = TRUE
  AND eb.deleted_at IS NULL

LEFT JOIN becas_descuentos bd
  ON bd.id = eb.beca_descuento_id
  AND bd.activo = TRUE
  AND bd.deleted_at IS NULL;
