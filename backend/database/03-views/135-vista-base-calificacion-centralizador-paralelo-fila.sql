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
--
-- 2026-08-06 (aditivo, Fase D frontend): se agregaron asignatura_plan_id
-- (propagado de la 130) e inscripcion_id (mm.inscripcion_id, ya estaba en el
-- JOIN) para que la vista 185 (Nivelación) pueda matchear un evento de
-- historial_matricula anclado a una materia arrastrada (sin matrícula, ancla
-- inscripcion_id+asignatura_plan_id) contra la columna correcta del pivote.
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_calificacion_centralizador_paralelo_fila;

CREATE VIEW vista_base_calificacion_centralizador_paralelo_fila AS
SELECT
  add_.paralelo_gestion_id   AS paralelo_gestion_id,
  add_.gestion_id            AS gestion_id,
  g.anio                     AS gestion_anio,
  g.nombre                   AS gestion_nombre,
  add_.oferta_curso_id       AS oferta_curso_id,
  add_.asignatura_plan_id    AS asignatura_plan_id,
  add_.id                    AS asignacion_docente_id,
  emc.estudiante_id          AS estudiante_id,
  emc.codigo                 AS codigo_estudiante,
  est.ci                     AS ci,
  emc.nombre                 AS nombre_completo,
  add_.materia_sigla         AS asignatura_sigla,
  add_.materia_nombre        AS asignatura_nombre,
  add_.orden_visualizacion   AS asignatura_orden,
  NULLIF(TRIM(CONCAT_WS(' ', add_.docente_apellido_paterno, add_.docente_apellido_materno, add_.docente_nombres)), '') AS docente_nombre,
  emc.matricula_materia_id   AS matricula_materia_id,
  mm.inscripcion_id          AS inscripcion_id,
  -- Puntos ACUMULADOS hasta la fecha por bimestre (nota_efectiva = consolidada o,
  -- si el bimestre sigue abierto, la suma del cuaderno teórico+práctico). Son
  -- puntos sobre 100, NO porcentaje: si solo se calificaron 10 pts, sale 10.
  MAX(CASE WHEN r119.bimestre = 1 AND r119.tiene_registro = 1 THEN r119.nota_efectiva END) AS bim1,
  MAX(CASE WHEN r119.bimestre = 2 AND r119.tiene_registro = 1 THEN r119.nota_efectiva END) AS bim2,
  MAX(CASE WHEN r119.bimestre = 3 AND r119.tiene_registro = 1 THEN r119.nota_efectiva END) AS bim3,
  MAX(CASE WHEN r119.bimestre = 4 AND r119.tiene_registro = 1 THEN r119.nota_efectiva END) AS bim4,
  -- Promedio anual = media de los bimestres con registro (pesos iguales 25/25/25/25).
  ROUND(AVG(CASE WHEN r119.tiene_registro = 1 THEN r119.nota_efectiva END), 2) AS promedio_anual,
  mm.nota_final              AS nota_final,
  mm.estado                  AS estado
FROM vista_base_asignacion_docente_detalle add_
-- Base = matrícula ACTIVA (estudiante × asignatura), NO las notas: incluye a
-- todos los matriculados (estado INSCRITO/CURSANDO) aunque aún no tengan notas
-- de bimestre; las notas entran por LEFT JOIN (NULL donde no hay).
INNER JOIN vista_base_calificacion_estudiante_matricula_curso emc
  ON emc.asignacion_docente_id = add_.id
INNER JOIN matriculas_materia mm
  ON mm.id = emc.matricula_materia_id
  AND mm.deleted_at IS NULL
  AND mm.activo = TRUE
-- Puntos efectivos por bimestre (consolidado o cuaderno) desde la vista 119;
-- LEFT JOIN para no excluir matriculados sin notas (quedan en NULL → '—').
LEFT JOIN vista_base_calificacion_resumen_curso_bimestre_fila r119
  ON r119.matricula_materia_id = emc.matricula_materia_id
LEFT JOIN estudiantes est
  ON est.id = emc.estudiante_id
  AND est.deleted_at IS NULL
LEFT JOIN gestiones g
  ON g.id = add_.gestion_id
  AND g.deleted_at IS NULL
WHERE add_.activo = TRUE
  AND add_.vigente = TRUE
GROUP BY
  add_.paralelo_gestion_id, add_.gestion_id, g.anio, g.nombre, add_.oferta_curso_id,
  add_.asignatura_plan_id, add_.id,
  emc.estudiante_id, emc.codigo, est.ci, emc.nombre,
  add_.materia_sigla, add_.materia_nombre, add_.orden_visualizacion,
  add_.docente_apellido_paterno, add_.docente_apellido_materno, add_.docente_nombres,
  emc.matricula_materia_id, mm.inscripcion_id, mm.nota_final, mm.estado;
