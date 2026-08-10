-- ============================================
-- VISTA: vista_tutoria_seguimiento_docentes
-- Roster de tutoriados ACTIVOS por docente-tutor (módulo TIT · titulación,
-- 2026-08-10). Reemplaza la planilla de avance "10 en 10" de 3er año
-- (dependía de Matrícula/periodo_numero=3, sin datos en desarrollo y sin
-- correspondencia con ningún documento físico real). Réplica digital de
-- "PLANILLA DE SEGUIMIENTO DE TUTORIA 2026.xlsx" ("PLANILLA DE SEGUIMIENTO A
-- DOCENTES EN TUTORIAS"): reporte ADMINISTRATIVO de seguimiento A LOS
-- DOCENTES (no a los estudiantes), para que Dirección Académica verifique
-- que cada docente-tutor cumple sus tutorías.
--
-- Grano: una fila por (proyecto de grado CON tutor) x (integrante ACTIVO).
-- Vista final delgada ROSTER-driven, SIN dimensión temporal (no depende de
-- bimestre ni de mes, a diferencia de la vista 181 anterior que fanaba sobre
-- periodos_academicos): el agregado mensual de bitácora se resuelve aparte,
-- en tiempo de consulta, con un LEFT JOIN de la vista 180
-- (vista_base_tutoria_bitacora_mes_fila) filtrada por año/mes en el
-- repositorio consumidor — así ningún tutoriado se pierde cuando su
-- proyecto no tuvo bitácora en el mes consultado (queda con 0/NULL, que es
-- justamente el hallazgo de incumplimiento que le interesa a Dirección
-- Académica). Un mes/año fijo dentro de esta vista habría requerido fanear
-- contra una tabla de meses inexistente en el modelo; resolverlo en el
-- repositorio es el approach más simple (mismo espíritu que "vista final
-- delgada", ver docs/plan/titulacion-avance-y-modalidad-plan-desarrollo.md).
--
-- Base: proyectos_grado (WHERE tutor_id IS NOT NULL AND activo = TRUE) →
-- integrantes_proyecto (WHERE estado = 'ACTIVO') → estudiantes/docentes/carreras.
--
-- Consumidor:
--   - TutoriaAvanceViewRepository.findSeguimientoTutoriaDocentes (backend) →
--     GET /proyectos-grado/reportes/seguimiento-tutoria-docentes y
--     GET /proyectos-grado/reportes/seguimiento-tutoria-docentes/export.
--
-- Uso:
--   SELECT * FROM vista_tutoria_seguimiento_docentes
--   WHERE tutor_id = ? AND carrera_id = ?
--   ORDER BY tutor_nombre, apellido_paterno, apellido_materno, nombres;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_tutoria_planilla_avance_tercer_anio;
DROP VIEW IF EXISTS vista_tutoria_seguimiento_docentes;

CREATE VIEW vista_tutoria_seguimiento_docentes AS
SELECT
  ip.id                             AS integrante_id,
  est.id                             AS estudiante_id,
  est.ci                             AS ci,
  est.expedicion                    AS expedicion,
  est.nombres                       AS nombres,
  est.apellido_paterno              AS apellido_paterno,
  est.apellido_materno              AS apellido_materno,
  NULLIF(TRIM(CONCAT_WS(' ', est.apellido_paterno, est.apellido_materno, est.nombres)), '') AS estudiante_nombre_completo,
  pg.id                              AS proyecto_grado_id,
  pg.titulo                         AS proyecto_titulo,
  pg.estado                         AS proyecto_estado,
  pg.carrera_id                     AS carrera_id,
  car.codigo                        AS carrera_codigo,
  car.nombre                        AS carrera_nombre,
  pg.gestion_id                     AS gestion_id,
  pg.tutor_id                       AS tutor_id,
  NULLIF(TRIM(CONCAT_WS(' ', doc.apellido_paterno, doc.apellido_materno, doc.nombres)), '') AS tutor_nombre
FROM proyectos_grado pg
INNER JOIN integrantes_proyecto ip
  ON ip.proyecto_grado_id = pg.id
  AND ip.estado = 'ACTIVO'
  AND ip.activo = TRUE
  AND ip.deleted_at IS NULL
INNER JOIN estudiantes est
  ON est.id = ip.estudiante_id
  AND est.deleted_at IS NULL
INNER JOIN docentes doc
  ON doc.id = pg.tutor_id
  AND doc.deleted_at IS NULL
LEFT JOIN carreras car
  ON car.id = pg.carrera_id
  AND car.deleted_at IS NULL
WHERE pg.tutor_id IS NOT NULL
  AND pg.activo = TRUE
  AND pg.deleted_at IS NULL;
