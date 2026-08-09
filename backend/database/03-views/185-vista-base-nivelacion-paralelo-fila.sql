-- ============================================
-- VISTA BASE: vista_base_nivelacion_paralelo_fila
-- Pivote de Nivelación por paralelo en gestión (ACA), grano IDÉNTICO al
-- Centralizador (135): una fila por (estudiante × asignatura del plan del
-- paralelo). Reusa 135 en TOTALIDAD (patrón vista final delgada, no se
-- reescribe la cadena de JOINs de matrícula) y le agrega, por LEFT JOIN, el
-- evento VIGENTE de historial_matricula (+ nivelación vinculada) de esa
-- celda, si existe.
--
-- Diseño (aprobado en docs/plan/centralizador-nivelacion-frontend-diseno.md,
-- Parte B1): el frontend pivota esto a la MISMA grilla del Centralizador
-- (estudiante × 9 materias fijas del plan); la celda muestra la nota normal
-- de 135 cuando NO hay evento, o un StatusPill con tipo_estado cuando SÍ lo
-- hay. Un evento anclado a una materia ARRASTRADA (sin matrícula este año)
-- se ubica en la MISMA columna que ocupa esa asignatura_plan_id en el plan
-- actual del paralelo — nunca agrega una columna nueva.
--
-- Anclaje del evento (dos formas, mutuamente excluyentes, ver
-- 16-nivelaciones.sql):
--   A) matricula_materia_id — materia CURSADA este año: match directo.
--   B) inscripcion_id + asignatura_plan_id — materia arrastrada, NO cursada
--      este año: match por (misma inscripción del estudiante) + (mismo
--      asignatura_plan_id que la columna). Requiere que la vista 135 ya
--      exponga asignatura_plan_id/inscripcion_id (aditivo, ver 130/135).
--
-- LIMITACIÓN CONOCIDA: si el asignatura_plan_id de la materia arrastrada no
-- coincide con NINGUNA de las 9 columnas del plan actual (plan/periodo
-- distinto al vigente), el evento no tiene celda en esta grilla — evolución
-- futura si aparece un caso real (hoy no hay datos para confirmarlo).
--
-- Invariante que hace seguro el LEFT JOIN sin duplicar filas: los use cases
-- de escritura (RegistrarEventoHistorialMatriculaUseCase) expiran siempre el
-- evento vigente anterior de la MISMA ancla antes de crear uno nuevo — como
-- mucho un evento vigente por ancla.
--
-- ⛔ Redefinida (Fase D frontend, 2026-08-06), preparada pero SIN aplicar en
-- BD real: pendiente de aprobación explícita del usuario.
--
-- 2026-08-07 (aditivo, cierre Gap B2): se agrega `inscripcion_id` (ya
-- propagado por la 135 desde `mm.inscripcion_id`) — sin esto, el ancla
-- ALTERNA (materia arrastrada, `enrollmentId`+`planSubjectId`) no se podía
-- armar desde esta vista para `ListMateriasPendientesEstudianteUseCase`.
--
-- Uso:
--   SELECT * FROM vista_base_nivelacion_paralelo_fila
--   WHERE paralelo_gestion_id = ? ORDER BY nombre_completo, asignatura_orden;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_nivelacion_paralelo_fila;

CREATE VIEW vista_base_nivelacion_paralelo_fila AS
SELECT
  cen.paralelo_gestion_id     AS paralelo_gestion_id,
  cen.gestion_id               AS gestion_id,
  cen.estudiante_id            AS estudiante_id,
  cen.codigo_estudiante        AS codigo_estudiante,
  cen.nombre_completo          AS nombre_completo,
  cen.oferta_curso_id          AS oferta_curso_id,
  cen.asignatura_plan_id       AS asignatura_plan_id,
  cen.matricula_materia_id     AS matricula_materia_id,
  cen.inscripcion_id           AS inscripcion_id,
  cen.asignatura_sigla         AS asignatura_sigla,
  cen.asignatura_nombre        AS asignatura_nombre,
  cen.asignatura_orden         AS asignatura_orden,
  cen.nota_final                AS nota_final,
  cen.estado                    AS estado_matricula,
  hm.id                         AS historial_matricula_id,
  hm.tipo_estado                AS tipo_estado,
  hm.nota_resultante            AS nota_resultante,
  hm.nota_forzada               AS nota_forzada,
  hm.fecha_transicion           AS fecha_transicion,
  hm.observaciones              AS historial_observaciones,
  (hm.matricula_materia_id IS NOT NULL) AS es_ancla_directa,
  niv.id                         AS nivelacion_id,
  niv.estado                     AS nivelacion_estado,
  niv.nota_nivelacion            AS nota_nivelacion,
  niv.aprobado                   AS nivelacion_aprobada,
  niv.fecha_examen               AS fecha_examen
FROM vista_base_calificacion_centralizador_paralelo_fila cen
LEFT JOIN historial_matricula hm
  ON hm.vigente = TRUE
  AND hm.activo = TRUE
  AND hm.deleted_at IS NULL
  AND (
    hm.matricula_materia_id = cen.matricula_materia_id
    OR (
      hm.matricula_materia_id IS NULL
      AND hm.inscripcion_id = cen.inscripcion_id
      AND hm.asignatura_plan_id = cen.asignatura_plan_id
    )
  )
LEFT JOIN nivelaciones niv
  ON niv.historial_matricula_id = hm.id
  AND niv.deleted_at IS NULL
  AND niv.activo = TRUE;
