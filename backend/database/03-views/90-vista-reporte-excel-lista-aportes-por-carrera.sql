-- ============================================
-- VISTA: vista_reporte_excel_lista_aportes_por_carrera
-- Lista de inscritos por carrera/paralelo con estado del aporte voluntario (pago_aporte + cuotas).
--
-- Objetivo:
-- - Misma salida que antes: columnas de inscripción, montos de aporte y observaciones_cuotas.
-- - La deduplicación por inscripción / periodo máximo vive en la vista base (35a);
--   los JOIN de pago/beca en (35b); aquí solo se agrega el agregado de descripciones de cuotas.
--
-- Reutiliza:
-- - vista_base_reporte_excel_lista_aportes_por_carrera_filas (35b)
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
  f.*,
  (
    SELECT GROUP_CONCAT(
      TRIM(pc.descripcion) ORDER BY pc.fecha_pago ASC, pc.id ASC SEPARATOR ' | '
    )
    FROM pago_cuotas pc
    WHERE pc.pago_aporte_id = f.pago_aporte_id
      AND pc.activo = TRUE
      AND pc.deleted_at IS NULL
      AND TRIM(COALESCE(pc.descripcion, '')) <> ''
  ) AS observaciones_cuotas
FROM vista_base_reporte_excel_lista_aportes_por_carrera_filas f;
