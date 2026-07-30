-- ============================================
-- VISTA: vista_avance_academico_estudiante
-- Avance académico por estudiante × plan: materias aprobadas/convalidadas vs
-- total de asignaturas del plan (ítem ACA `/academico/avance`, permiso
-- `academico.avance` rehabilitado — REP disuelto, 2026-07-29).
--
-- Grano: una fila por (estudiante × plan_estudio) con registro académico.
-- Estudiantes sin ninguna materia cursada/convalidada aún NO aparecen (sin
-- avance que reportar); el listado administrativo parte de este universo.
--
-- Vista FINAL DELGADA (patrón 87/143): solo une bases y proyecta columnas:
--   - 170 vista_base_avance_academico_conteo   → numerador (materias avanzadas)
--     por estudiante × plan, sobre el MISMO universo del transcript (141).
--   - 142 vista_base_estudiante_historial_promedio → promedio entero del
--     historial (misma cifra que el kardex).
--   - estudiantes / planes_estudios / carreras → identidad + denominador.
--
-- El denominador total_asignaturas_plan sale por subconsulta escalar sobre
-- asignaturas_plan (activo=TRUE): mismas filas que administra el plan builder.
-- El % de avance NO se calcula aquí: lo deriva el use case
-- (pct = 100 × materias_avanzadas / total_asignaturas_plan) — negocio en
-- aplicación, vista solo de lectura.
--
-- Nombre: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (convención buildFullName).
--
-- Consumidor: AvanceAcademicoViewRepository → GetAvanceAcademicoUseCase
-- (GET /avance-academico) y ExportAvanceAcademicoExcelUseCase (export Excel).
-- Orden de despliegue: después de 142 y 170.
--
-- Uso:
--   SELECT * FROM vista_avance_academico_estudiante
--   [WHERE carrera_id = ?]
--   ORDER BY carrera_nombre, nombre_completo;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_avance_academico_estudiante;

CREATE VIEW vista_avance_academico_estudiante AS
SELECT
  b.estudiante_id                          AS estudiante_id,
  e.codigo_estudiante                      AS codigo_estudiante,
  TRIM(
    CONCAT_WS(
      ' ',
      COALESCE(e.apellido_paterno, ''),
      COALESCE(e.apellido_materno, ''),
      COALESCE(e.nombres, '')
    )
  )                                        AS nombre_completo,
  b.plan_estudio_id                        AS plan_estudio_id,
  pe.nombre_plan                           AS plan_nombre,
  pe.duracion_anios                        AS plan_duracion_anios,
  c.id                                     AS carrera_id,
  c.codigo                                 AS carrera_codigo,
  c.nombre                                 AS carrera_nombre,
  c.color_hex                              AS carrera_color_hex,
  (SELECT COUNT(*)
     FROM asignaturas_plan ap
    WHERE ap.plan_estudio_id = b.plan_estudio_id
      AND ap.activo = TRUE
      AND ap.deleted_at IS NULL)           AS total_asignaturas_plan,
  b.materias_aprobadas                     AS materias_aprobadas,
  b.materias_convalidadas                  AS materias_convalidadas,
  b.materias_avanzadas                     AS materias_avanzadas,
  b.materias_registradas                   AS materias_registradas,
  b.primera_gestion_anio                   AS primera_gestion_anio,
  b.ultima_gestion_anio                    AS ultima_gestion_anio,
  php.promedio_historial                   AS promedio_historial
FROM vista_base_avance_academico_conteo b
INNER JOIN estudiantes e
  ON e.id = b.estudiante_id
  AND e.deleted_at IS NULL
INNER JOIN planes_estudios pe
  ON pe.id = b.plan_estudio_id
  AND pe.deleted_at IS NULL
LEFT JOIN carreras c
  ON c.id = pe.carrera_id
  AND c.deleted_at IS NULL
LEFT JOIN vista_base_estudiante_historial_promedio php
  ON php.estudiante_id = b.estudiante_id;
