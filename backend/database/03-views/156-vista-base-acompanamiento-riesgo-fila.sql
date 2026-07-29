-- ============================================
-- VISTA BASE: vista_base_acompanamiento_riesgo_fila
-- Riesgo pedagógico calculado por estudiante × materia (módulo TUT).
--
-- Grano: una fila por (estudiante × oferta_curso) del paralelo en gestión,
-- el MISMO grano de la vista 135 (no se reescribe la cadena de notas: se
-- reutiliza el centralizador y solo se añade carrera + umbral + flag).
--
-- Bases (patrón de vista final delgada, tipo 87):
--   - 135 vista_base_calificacion_centralizador_paralelo_fila → notas bim1..4,
--     promedio_anual, nota_final, estado de matrícula, datos estudiante/materia.
--   - paralelos_gestion → gestiones_planes → planes_estudios → carreras
--     (carrera del paralelo, para agregados 157/158 y filtros de UI).
--   - configuracion_evaluacion (clave ACOMPANAMIENTO_PEDAGOGICO, vigente):
--     umbral de riesgo parametrizable; fallback 61 (nota mínima de aprobación).
--
-- Reglas de negocio:
--   - nota_ultimo_bimestre = COALESCE(bim4, bim3, bim2, bim1) (último con nota).
--   - en_riesgo = 1 si nota_ultimo_bimestre < umbral O promedio_anual < umbral;
--     0 si aún no hay notas (sin datos no se alerta).
--
-- Consumidores:
--   - RiesgoAcademicoViewRepository (backend) → endpoints
--     GET /acompanamiento/alertas, /alertas/mis-alumnos, /alertas/estudiante/:id
--     y el top de casos críticos de GET /acompanamiento/panel.
--   - Vistas agregadas 157 (por carrera) y 158 (por materia).
--
-- Uso:
--   SELECT * FROM vista_base_acompanamiento_riesgo_fila
--   WHERE gestion_id = ? AND en_riesgo = 1
--   ORDER BY nombre_completo, asignatura_sigla;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_acompanamiento_riesgo_fila;

CREATE VIEW vista_base_acompanamiento_riesgo_fila AS
SELECT
  cen.gestion_id             AS gestion_id,
  cen.paralelo_gestion_id    AS paralelo_gestion_id,
  cen.oferta_curso_id        AS oferta_curso_id,
  cen.asignacion_docente_id  AS asignacion_docente_id,
  cen.estudiante_id          AS estudiante_id,
  cen.codigo_estudiante      AS codigo_estudiante,
  cen.nombre_completo        AS nombre_completo,
  cen.matricula_materia_id   AS matricula_materia_id,
  cen.asignatura_sigla       AS asignatura_sigla,
  cen.asignatura_nombre      AS asignatura_nombre,
  cen.docente_nombre         AS docente_nombre,
  c.id                       AS carrera_id,
  c.codigo                   AS carrera_codigo,
  c.nombre                   AS carrera_nombre,
  c.color_hex                AS carrera_color_hex,
  cen.bim1                   AS bim1,
  cen.bim2                   AS bim2,
  cen.bim3                   AS bim3,
  cen.bim4                   AS bim4,
  cen.promedio_anual         AS promedio_anual,
  cen.nota_final             AS nota_final,
  cen.estado                 AS matricula_estado,
  COALESCE(cen.bim4, cen.bim3, cen.bim2, cen.bim1) AS nota_ultimo_bimestre,
  COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(ce.valor, '$.umbralRiesgo')) AS DECIMAL(5,2)), 61) AS umbral_riesgo,
  CASE
    WHEN COALESCE(cen.bim4, cen.bim3, cen.bim2, cen.bim1) IS NULL THEN 0
    WHEN COALESCE(cen.bim4, cen.bim3, cen.bim2, cen.bim1)
           < COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(ce.valor, '$.umbralRiesgo')) AS DECIMAL(5,2)), 61)
      OR cen.promedio_anual
           < COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(ce.valor, '$.umbralRiesgo')) AS DECIMAL(5,2)), 61)
    THEN 1
    ELSE 0
  END AS en_riesgo
FROM vista_base_calificacion_centralizador_paralelo_fila cen
INNER JOIN paralelos_gestion pg
  ON pg.id = cen.paralelo_gestion_id
  AND pg.deleted_at IS NULL
INNER JOIN gestiones_planes gp
  ON gp.id = pg.gestion_plan_id
  AND gp.deleted_at IS NULL
INNER JOIN planes_estudios pe
  ON pe.id = gp.plan_estudio_id
  AND pe.deleted_at IS NULL
INNER JOIN carreras c
  ON c.id = pe.carrera_id
  AND c.deleted_at IS NULL
LEFT JOIN configuracion_evaluacion ce
  ON ce.gestion_id = cen.gestion_id
  AND ce.clave = 'ACOMPANAMIENTO_PEDAGOGICO'
  AND ce.vigente = TRUE
  AND ce.activo = TRUE
  AND ce.deleted_at IS NULL;
