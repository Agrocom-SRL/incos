-- ============================================
-- VISTA BASE: vista_base_calificacion_centralizador_paralelo_fila
-- Centralizador de calificaciones por paralelo (formato LARGO).
--
-- Grano: una fila por (estudiante × oferta_curso) del paralelo en gestión.
-- El frontend pivota a matriz: filas = estudiantes, columnas = asignaturas
-- (identidad de columna = oferta_curso_id; cabecera = sigla/nombre, orden por
-- asignatura_orden). Cada celda lleva las 4 notas de bimestre, el promedio
-- anual derivado y, del caché autoritativo, la nota final y el estado.
--
-- Vista final delgada (patrón 87): solo une 2 vistas base + lectura del caché,
-- sin reescribir la cadena de JOINs ni reagregar lo ya consolidado.
--   - 130 vista_base_asignacion_docente_detalle  → paralelo/gestión/oferta/materia + vigencia
--   - 112 vista_base_cuaderno_resumen_estudiante_bimestre → estudiante × bimestre + nota_bimestre
--   - matriculas_materia → nota_final / estado (caché oficial, NO se recalcula)
--
-- Reglas de negocio (POLITICA_INSTITUCIONAL, 54-seed-configuracion-evaluacion):
--   - nota_bimestre = teórico + práctico (≤100), ya consolidada en bimestres_matricula.
--   - pesos de bimestre iguales (25/25/25/25) ⇒ promedio_anual = AVG(nota_bimestre)
--     sobre los bimestres con nota cargada (no penaliza bimestres aún no abiertos).
--   - nota mínima de aprobación = 61; el estado/nota_final salen del caché de
--     matriculas_materia, no se recalculan aquí.
--
-- Filtra a la asignación vigente y activa (gestión vigente vía 130). Para
-- centralizadores históricos habría que relajar el filtro y parametrizar gestión.
--
-- Uso:
--   SELECT * FROM vista_base_calificacion_centralizador_paralelo_fila
--   WHERE paralelo_gestion_id = ?
--   ORDER BY nombre_completo, asignatura_orden;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_calificacion_centralizador_paralelo_fila;

CREATE VIEW vista_base_calificacion_centralizador_paralelo_fila AS
SELECT
  add_.paralelo_gestion_id   AS paralelo_gestion_id,
  add_.gestion_id            AS gestion_id,
  add_.oferta_curso_id       AS oferta_curso_id,
  add_.id                    AS asignacion_docente_id,
  cre.estudiante_id          AS estudiante_id,
  cre.codigo                 AS codigo_estudiante,
  est.ci                     AS ci,
  cre.nombre                 AS nombre_completo,
  add_.materia_sigla         AS asignatura_sigla,
  add_.materia_nombre        AS asignatura_nombre,
  add_.orden_visualizacion   AS asignatura_orden,
  NULLIF(TRIM(CONCAT_WS(' ', add_.docente_apellido_paterno, add_.docente_apellido_materno, add_.docente_nombres)), '') AS docente_nombre,
  cre.matricula_materia_id   AS matricula_materia_id,
  MAX(CASE WHEN cre.bimestre = 1 THEN cre.nota_bimestre END) AS bim1,
  MAX(CASE WHEN cre.bimestre = 2 THEN cre.nota_bimestre END) AS bim2,
  MAX(CASE WHEN cre.bimestre = 3 THEN cre.nota_bimestre END) AS bim3,
  MAX(CASE WHEN cre.bimestre = 4 THEN cre.nota_bimestre END) AS bim4,
  ROUND(AVG(cre.nota_bimestre), 2) AS promedio_anual,
  mm.nota_final              AS nota_final,
  mm.estado                  AS estado
FROM vista_base_asignacion_docente_detalle add_
INNER JOIN vista_base_cuaderno_resumen_estudiante_bimestre cre
  ON cre.asignacion_docente_id = add_.id
INNER JOIN matriculas_materia mm
  ON mm.id = cre.matricula_materia_id
  AND mm.deleted_at IS NULL
  AND mm.activo = TRUE
LEFT JOIN estudiantes est
  ON est.id = cre.estudiante_id
  AND est.deleted_at IS NULL
WHERE add_.activo = TRUE
  AND add_.vigente = TRUE
GROUP BY
  add_.paralelo_gestion_id, add_.gestion_id, add_.oferta_curso_id, add_.id,
  cre.estudiante_id, cre.codigo, est.ci, cre.nombre,
  add_.materia_sigla, add_.materia_nombre, add_.orden_visualizacion,
  add_.docente_apellido_paterno, add_.docente_apellido_materno, add_.docente_nombres,
  cre.matricula_materia_id, mm.nota_final, mm.estado;
