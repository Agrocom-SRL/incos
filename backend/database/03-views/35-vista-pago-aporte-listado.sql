-- ============================================
-- VISTA: vista_pago_aporte_listado
-- Listado de cabeceras de aporte con total pagado, cantidad de cuotas y saldo
--
-- Propósito: Reutiliza vista_base_pago_aporte_info y agrega por cabecera:
-- - total_pagado: SUM(monto) de pago_cuotas activas
-- - cantidad_pagos: COUNT de cuotas
-- - saldo_pendiente: monto_obligatorio - total_pagado
--
-- Joins: 1 (vista base ya tiene 2; aquí se añade 1 LEFT a la agregación de cuotas).
--
-- Uso:
-- SELECT * FROM vista_pago_aporte_listado ORDER BY id LIMIT 50;
-- SELECT * FROM vista_pago_aporte_listado WHERE gestion_id = ? AND estado = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_pago_aporte_listado;

CREATE VIEW vista_pago_aporte_listado AS
SELECT
  v.id,
  v.estudiante_id,
  v.gestion_id,
  v.estudiante_beca_id,
  v.monto_base,
  v.descuento_beca,
  v.monto_obligatorio,
  v.estado,
  v.created_at,
  v.codigo_estudiante,
  v.estudiante_nombres,
  v.estudiante_apellido_paterno,
  v.estudiante_apellido_materno,
  v.gestion_nombre,
  v.gestion_anio,
  v.beca_nombre,
  v.beca_porcentaje,
  -- Agregación de cuotas
  COALESCE(c.total_pagado, 0) AS total_pagado,
  COALESCE(c.cantidad_pagos, 0) AS cantidad_pagos,
  (v.monto_obligatorio - COALESCE(c.total_pagado, 0)) AS saldo_pendiente
FROM vista_base_pago_aporte_info v
LEFT JOIN (
  SELECT
    pago_aporte_id,
    SUM(monto) AS total_pagado,
    COUNT(*) AS cantidad_pagos
  FROM pago_cuotas
  WHERE activo = TRUE
    AND deleted_at IS NULL
  GROUP BY pago_aporte_id
) c ON c.pago_aporte_id = v.id;
