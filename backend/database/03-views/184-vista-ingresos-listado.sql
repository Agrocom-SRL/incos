-- ============================================
-- VISTA: vista_ingresos_listado
-- Listado unificado de transacciones de ingreso (aportes académicos +
-- pagos de capacitación) para el módulo Finanzas — pantalla "Registro de
-- ingresos". Consumida por GET /api/v1/ingresos.
--
-- Propósito: Vista final delgada que normaliza y une (UNION ALL) las dos
-- vistas base transaccionales de ingreso:
-- - vista_base_ingreso_aporte (182): pago_cuotas
-- - vista_base_ingreso_capacitacion (183): capacitacion_pagos
-- Agrega el nombre del método de pago (JOIN a metodos_pago) para que el
-- use case no tenga que resolverlo aparte.
--
-- NO reemplaza a vista_pago_aporte_listado (49, cabeceras agregadas por
-- estudiante, consumida por GET /api/v1/pagos-aportes y la ficha
-- /finanzas/pagos/:id): esta vista es transaccional (1 fila = 1 pago real).
--
-- Columnas normalizadas:
-- - id_local: PK de la tabla transaccional de origen (pago_cuotas.id o
--   capacitacion_pagos.id). NO es único entre orígenes; el id público único
--   por fila se arma en el mapper de aplicación como `${origen}-${id_local}`.
-- - origen: 'APORTE' | 'CAPACITACION'.
-- - referencia_id: pago_aporte_id (APORTE, vuelve a la ficha
--   /finanzas/pagos/:id) o capacitacion_inscrito_id (CAPACITACION, vuelve a
--   la ficha de inscripción de capacitación).
-- - persona_codigo: codigo_estudiante (APORTE) o ci (CAPACITACION).
-- - concepto: carrera_nombre (APORTE) o curso_titulo (CAPACITACION).
-- - concepto_pago: MATRICULA | CURSO (solo CAPACITACION; NULL en APORTE).
-- - cobra_instituto: 1 si el ingreso es del instituto (aportes, matrículas y
--   cursos sin entidad certificadora); 0 si el dinero va a la entidad
--   certificadora. Los totales de ingreso del instituto suman solo 1.
--
-- Dependencias (ejecutar antes):
-- - 182-vista-base-ingreso-aporte.sql
-- - 183-vista-base-ingreso-capacitacion.sql
--
-- Uso:
-- SELECT * FROM vista_ingresos_listado ORDER BY fecha_pago DESC LIMIT 50;
-- SELECT * FROM vista_ingresos_listado WHERE origen = 'APORTE';
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_ingresos_listado;

CREATE VIEW vista_ingresos_listado AS
SELECT
  a.id AS id_local,
  'APORTE' AS origen,
  a.pago_aporte_id AS referencia_id,
  a.numero_recibo,
  a.fecha_pago,
  a.monto,
  a.metodo_pago_id,
  mp.nombre AS metodo_pago_nombre,
  a.codigo_estudiante AS persona_codigo,
  a.apellido_paterno AS persona_apellido_paterno,
  a.apellido_materno AS persona_apellido_materno,
  a.nombres AS persona_nombres,
  a.carrera_nombre AS concepto,
  NULL AS concepto_pago,
  1 AS cobra_instituto,
  a.descripcion
FROM vista_base_ingreso_aporte a
LEFT JOIN metodos_pago mp ON mp.id = a.metodo_pago_id

UNION ALL

SELECT
  c.id AS id_local,
  'CAPACITACION' AS origen,
  c.capacitacion_inscrito_id AS referencia_id,
  c.numero_recibo,
  c.fecha_pago,
  c.monto,
  c.metodo_pago_id,
  mp.nombre AS metodo_pago_nombre,
  c.ci AS persona_codigo,
  c.apellido_paterno AS persona_apellido_paterno,
  c.apellido_materno AS persona_apellido_materno,
  c.nombres AS persona_nombres,
  c.curso_titulo AS concepto,
  c.concepto AS concepto_pago,
  c.cobra_instituto,
  c.descripcion
FROM vista_base_ingreso_capacitacion c
LEFT JOIN metodos_pago mp ON mp.id = c.metodo_pago_id;
