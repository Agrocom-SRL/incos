-- ============================================
-- VISTA BASE: vista_base_reporte_excel_inscripcion_paralelo_max_periodo
-- Filas de vista_reporte_excel_lista_inscritos representativas por inscripción
-- misma gestión y carrera: periodo de mayor número; desempate paralelo_id.
--
-- Propósito:
-- - Evitar duplicar al estudiante en varios paralelos cuando una inscripción
--   abarca más de un periodo, por ejemplo nivelación, y el pago_aporte es único por gestión.
--
-- Reutiliza:
-- - vista_reporte_excel_lista_inscritos
--
-- Uso:
-- SELECT *
-- FROM vista_base_reporte_excel_inscripcion_paralelo_max_periodo
-- WHERE gestion_id = 2 AND carrera_id = 1
-- ORDER BY paralelo_nombre, apellido_paterno, apellido_materno, nombres;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_reporte_excel_inscripcion_paralelo_max_periodo;

CREATE VIEW vista_base_reporte_excel_inscripcion_paralelo_max_periodo AS
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

  ins.observaciones

FROM vista_reporte_excel_lista_inscritos ins

WHERE
  ins.inscripcion_id IS NULL
  OR NOT EXISTS (
    SELECT 1
    FROM vista_reporte_excel_lista_inscritos ins_sup
    WHERE ins_sup.gestion_id = ins.gestion_id
      AND ins_sup.carrera_id = ins.carrera_id
      AND ins_sup.inscripcion_id = ins.inscripcion_id
      AND (
        COALESCE(ins_sup.periodo_numero, -1) > COALESCE(ins.periodo_numero, -1)
        OR (
          COALESCE(ins_sup.periodo_numero, -1) = COALESCE(ins.periodo_numero, -1)
          AND COALESCE(ins_sup.paralelo_id, 0) > COALESCE(ins.paralelo_id, 0)
        )
      )
  );
