-- ============================================
-- VISTA: vista_reporte_excel_lista_aportes_por_carrera
-- Lista de inscritos por carrera/paralelo con estado del aporte voluntario (pago_aporte + cuotas).
--
-- Objetivo:
-- - Misma granularidad que vista_reporte_excel_lista_inscritos (una fila por inscripción + paralelo).
-- - LEFT JOIN a cabecera de aporte: monto base, descuento, beca, cuotas, pagado, saldo, estado.
--
-- Uso:
-- SELECT * FROM vista_reporte_excel_lista_aportes_por_carrera
-- WHERE gestion_id = 1 AND carrera_id = 1
-- ORDER BY periodo_numero, paralelo_nombre, nombre_completo;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_reporte_excel_lista_aportes_por_carrera;

CREATE VIEW vista_reporte_excel_lista_aportes_por_carrera AS
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
  bd.nombre AS beca_descuento_nombre
FROM vista_reporte_excel_lista_inscritos ins
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
