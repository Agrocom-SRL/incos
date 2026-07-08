-- ============================================
-- VISTA: vista_catalogos_finanzas_usos
-- Conteo de usos de los 4 catálogos de configuración de Finanzas
-- (métodos de pago, bancos autorizados, cuentas de pago, becas/descuentos).
--
-- Propósito:
-- - Una fila por catálogo + ítem del catálogo con la cantidad de registros
--   activos que lo referencian, separada por fuente (pagos / cuentas /
--   asignaciones). Los ítems SIN uso NO aparecen (el repositorio hace COALESCE 0).
-- - Consumida por FinanzasUsosViewRepository (getUsosByCatalogo) para
--   enriquecer los listados GET de metodosPago, bancosAutorizados, cuentasPago
--   y becasDescuentos con cantidadPagos / cantidadCuentas / cantidadAsignaciones.
--
-- CONTRATO (5 columnas, mismo orden en TODOS los bloques — requisito del UNION):
--   catalogo              VARCHAR  'METODO_PAGO' | 'BANCO' | 'CUENTA_PAGO' | 'BECA_DESCUENTO'
--   item_id               INT      id del ítem en su tabla de catálogo
--   cantidad_pagos        INT      pago_cuotas que usan el ítem (directo o vía cuenta)
--   cantidad_cuentas      INT      cuentas_pago que usan el ítem
--   cantidad_asignaciones INT      estudiantes_becas que usan el ítem
--
-- Fuentes por catálogo (todas con soft delete activo = TRUE AND deleted_at IS NULL
-- en la tabla transaccional):
--   METODO_PAGO     pago_cuotas.metodo_pago_id (pagos) y
--                   cuentas_pago.metodo_pago_id (cuentas)
--   BANCO           pago_cuotas JOIN cuentas_pago ON pc.cuenta_pago_id = cp.id
--                   agrupado por cp.banco_id (pagos que llegaron al banco vía
--                   sus cuentas) y cuentas_pago.banco_id (cuentas)
--   CUENTA_PAGO     pago_cuotas.cuenta_pago_id (pagos)
--   BECA_DESCUENTO  estudiantes_becas.beca_descuento_id (todas las asignaciones
--                   vivas, sin filtrar por sub-estado PENDIENTE/ACTIVA/...)
--
-- Uso:
-- SELECT item_id, cantidad_pagos, cantidad_cuentas, cantidad_asignaciones
-- FROM vista_catalogos_finanzas_usos
-- WHERE catalogo = 'BANCO';
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_catalogos_finanzas_usos;

CREATE VIEW vista_catalogos_finanzas_usos AS
-- METODO_PAGO: pagos registrados con el método + cuentas configuradas con el método
SELECT
  'METODO_PAGO'                      AS catalogo,
  fuentes.item_id                    AS item_id,
  SUM(fuentes.fuente = 'PAGO')       AS cantidad_pagos,
  SUM(fuentes.fuente = 'CUENTA')     AS cantidad_cuentas,
  0                                  AS cantidad_asignaciones
FROM (
  SELECT 'PAGO' AS fuente, pc.metodo_pago_id AS item_id
  FROM pago_cuotas pc
  WHERE pc.metodo_pago_id IS NOT NULL
    AND pc.activo = TRUE
    AND pc.deleted_at IS NULL
  UNION ALL
  SELECT 'CUENTA' AS fuente, cp.metodo_pago_id AS item_id
  FROM cuentas_pago cp
  WHERE cp.metodo_pago_id IS NOT NULL
    AND cp.activo = TRUE
    AND cp.deleted_at IS NULL
) fuentes
GROUP BY fuentes.item_id

UNION ALL

-- BANCO: pagos que llegaron al banco vía sus cuentas + cuentas configuradas del banco
SELECT
  'BANCO'                            AS catalogo,
  fuentes.item_id                    AS item_id,
  SUM(fuentes.fuente = 'PAGO')       AS cantidad_pagos,
  SUM(fuentes.fuente = 'CUENTA')     AS cantidad_cuentas,
  0                                  AS cantidad_asignaciones
FROM (
  SELECT 'PAGO' AS fuente, cp.banco_id AS item_id
  FROM pago_cuotas pc
  JOIN cuentas_pago cp ON pc.cuenta_pago_id = cp.id
  WHERE cp.banco_id IS NOT NULL
    AND pc.activo = TRUE
    AND pc.deleted_at IS NULL
  UNION ALL
  SELECT 'CUENTA' AS fuente, cp.banco_id AS item_id
  FROM cuentas_pago cp
  WHERE cp.banco_id IS NOT NULL
    AND cp.activo = TRUE
    AND cp.deleted_at IS NULL
) fuentes
GROUP BY fuentes.item_id

UNION ALL

-- CUENTA_PAGO: pagos registrados con la cuenta
SELECT
  'CUENTA_PAGO'                      AS catalogo,
  pc.cuenta_pago_id                  AS item_id,
  COUNT(*)                           AS cantidad_pagos,
  0                                  AS cantidad_cuentas,
  0                                  AS cantidad_asignaciones
FROM pago_cuotas pc
WHERE pc.cuenta_pago_id IS NOT NULL
  AND pc.activo = TRUE
  AND pc.deleted_at IS NULL
GROUP BY pc.cuenta_pago_id

UNION ALL

-- BECA_DESCUENTO: asignaciones vivas de la beca/descuento a estudiantes
-- (sin filtrar sub-estado: PENDIENTE/ACTIVA/FINALIZADA/RECHAZADA cuentan igual)
SELECT
  'BECA_DESCUENTO'                   AS catalogo,
  eb.beca_descuento_id               AS item_id,
  0                                  AS cantidad_pagos,
  0                                  AS cantidad_cuentas,
  COUNT(*)                           AS cantidad_asignaciones
FROM estudiantes_becas eb
WHERE eb.beca_descuento_id IS NOT NULL
  AND eb.activo = TRUE
  AND eb.deleted_at IS NULL
GROUP BY eb.beca_descuento_id;
