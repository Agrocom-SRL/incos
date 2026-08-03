-- ============================================
-- VISTA BASE: vista_base_estudiante_aporte_saldo_resumen
-- Por estudiante: cantidad de cabeceras de aporte con saldo y total de cabeceras
--
-- Propósito: Agregación reutilizable sobre vista_pago_aporte_listado (una fila por cabecera).
-- Usada por vista_estudiante_busqueda_registro_aporte y por el repositorio (sin SQL inline).
--
-- Dependencias (ejecutar antes):
-- - 49-vista-pago-aporte-listado.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_estudiante_aporte_saldo_resumen;

CREATE VIEW vista_base_estudiante_aporte_saldo_resumen AS
SELECT
  pl.estudiante_id,
  SUM(CASE WHEN COALESCE(pl.saldo_pendiente, 0) > 0 THEN 1 ELSE 0 END) AS cabeceras_con_saldo,
  SUM(COALESCE(pl.saldo_pendiente, 0)) AS saldo_pendiente_total,
  COUNT(*) AS cabeceras_total
FROM vista_pago_aporte_listado pl
GROUP BY pl.estudiante_id;
