-- ============================================
-- VISTA BASE: vista_base_desercion_matricula_fila
-- Deserción estudiantil por matrícula de materia (ítem ACA `/academico/avance`,
-- pestaña Deserción, permiso nuevo `academico.desercion` — reemplaza al
-- retirado `reportes.desercion` del módulo REP disuelto, 2026-07-29).
--
-- Grano: una fila por matriculas_materia (estudiante × asignatura × gestión),
-- a través de TODAS las gestiones — grano ANUAL por estados consolidados de
-- matrícula (decisión de usuario 2026-07-29: ABANDONO/RETIRADO son estados
-- anuales; la variante intra-gestión por asistencia queda como evolución
-- futura si el instituto la pide).
--
-- ESPEJO ESTRUCTURAL de la 156 (vista_base_acompanamiento_riesgo_fila):
-- universo completo + flag, para que el agregado (173) calcule denominadores.
-- CONSUMIDOR DISTINTO JUSTIFICADO: la 156 mide RIESGO PEDAGÓGICO por notas
-- (módulo TUT, gestión vigente, umbral configurable); esta vista mide la
-- MÉTRICA INSTITUCIONAL DE ABANDONO consumado (módulo ACA, histórico anual,
-- estados administrativos ABANDONO/RETIRADO de matriculas_materia). Ni el
-- grano temporal ni la regla de negocio son intercambiables.
--
-- Reutiliza (no duplica):
--   - 138 vista_base_historial_nota_efectiva_fila → universo de matrícula del
--     historial COMPLETO (sin filtro de activo — clave: un desertor suele
--     quedar inactivo administrativamente y NO debe salir de la métrica; por
--     eso NO se usa la 99, que filtra inscripciones/estudiantes activos).
--     Usa las columnas matricula_materia_id/carrera_id añadidas 2026-07-29.
--   - 139 vista_base_historial_asignatura_plan_detalle → sigla/nombre/periodo
--     de la asignatura del plan.
--   - estudiantes / carreras / gestiones → identidad y etiquetas.
--
-- Reglas:
--   - es_desercion = 1 si estado IN ('ABANDONO', 'RETIRADO'); 0 en el resto.
--   - Nombre: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (buildFullName).
--
-- Consumidores:
--   - DesercionViewRepository → GetDesercionUseCase (GET /desercion) y
--     ExportDesercionExcelUseCase (export Excel).
--   - Vista agregada 173 (carrera × gestión).
--
-- Orden de despliegue: después de 138 (recreada con matricula_materia_id y
-- carrera_id) y 139.
--
-- Uso:
--   SELECT * FROM vista_base_desercion_matricula_fila
--   WHERE es_desercion = 1 [AND gestion_id = ?]
--   ORDER BY gestion_anio DESC, carrera_nombre, nombre_completo;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_desercion_matricula_fila;

CREATE VIEW vista_base_desercion_matricula_fila AS
SELECT
  nef.gestion_id                           AS gestion_id,
  nef.gestion_anio                         AS gestion_anio,
  g.nombre                                 AS gestion_nombre,
  c.id                                     AS carrera_id,
  c.codigo                                 AS carrera_codigo,
  c.nombre                                 AS carrera_nombre,
  c.color_hex                              AS carrera_color_hex,
  nef.estudiante_id                        AS estudiante_id,
  e.codigo_estudiante                      AS codigo_estudiante,
  TRIM(
    CONCAT_WS(
      ' ',
      COALESCE(e.apellido_paterno, ''),
      COALESCE(e.apellido_materno, ''),
      COALESCE(e.nombres, '')
    )
  )                                        AS nombre_completo,
  nef.matricula_materia_id                 AS matricula_materia_id,
  nef.asignatura_plan_id                   AS asignatura_plan_id,
  apd.asignatura_sigla                     AS asignatura_sigla,
  apd.asignatura_nombre                    AS asignatura_nombre,
  apd.periodo_numero                       AS periodo_numero,
  apd.periodo_nombre                       AS periodo_nombre,
  nef.estado                               AS estado,
  CASE WHEN nef.estado IN ('ABANDONO', 'RETIRADO') THEN 1 ELSE 0 END AS es_desercion
FROM vista_base_historial_nota_efectiva_fila nef
INNER JOIN vista_base_historial_asignatura_plan_detalle apd
  ON apd.asignatura_plan_id = nef.asignatura_plan_id
INNER JOIN estudiantes e
  ON e.id = nef.estudiante_id
  AND e.deleted_at IS NULL
LEFT JOIN carreras c
  ON c.id = nef.carrera_id
  AND c.deleted_at IS NULL
LEFT JOIN gestiones g
  ON g.id = nef.gestion_id
  AND g.deleted_at IS NULL;
