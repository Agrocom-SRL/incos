-- ============================================
-- VISTA BASE: vista_base_paralelo_gestion_ficha
-- Ficha enriquecida de paralelos_gestion (oferta académica).
--
-- Propósito:
-- - Listado por plan habilitado (gestiones_planes).
-- - Detalle GET /paralelos-gestion/:id.
-- - Historial por paralelo maestro.
-- - Catálogo OFERTADO por gestión (publicación masiva).
--
-- Reutiliza joins sobre:
-- - paralelos, carreras, periodos, aulas
-- - gestiones_planes, planes_estudios, gestiones
--
-- Modelo de negocio:
-- paralelos_gestion → oferta_cursos → asignaciones_docentes → asignacion_horarios
-- ofertaActual: cursos ofertados. bloquesRequeridos: horas/semana del plan (1 hora
-- = 1 bloque de 45 min). bloquesAsignados: bloques realmente armados en la grilla.
-- Permite que la ficha/listado refleje el avance de horarios sin depender del estado.
--
-- Uso:
-- SELECT * FROM vista_base_paralelo_gestion_ficha
-- WHERE gestionPlanId = ? AND deletedAt IS NULL;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_paralelo_gestion_ficha;

CREATE VIEW vista_base_paralelo_gestion_ficha AS
SELECT
  pg.id AS id,
  pg.gestion_plan_id AS gestionPlanId,
  pg.paralelo_id AS paraleloId,
  pg.aula_id AS aulaId,
  pg.turno AS turno,
  pg.estado AS estado,
  pg.cupo_maximo AS cupoMaximo,
  pg.cupo_minimo AS cupoMinimo,
  pg.observaciones AS observaciones,
  pg.activo AS activo,
  pg.deleted_at AS deletedAt,
  p.nombre AS paraleloNombre,
  p.turno AS paraleloTurnoMaestro,
  p.descripcion AS paraleloDescripcion,
  p.carrera_id AS carreraId,
  car.nombre AS carreraNombre,
  car.codigo AS carreraCodigo,
  car.imagen_ruta AS carreraImagenRuta,
  car.color_hex AS carreraColorHex,
  p.periodo_id AS periodoId,
  per.nombre AS periodoNombre,
  per.numero AS periodoNumero,
  a.codigo AS aulaCodigo,
  a.nombre AS aulaNombre,
  gp.plan_estudio_id AS planEstudioId,
  gp.gestion_id AS gestionId,
  pl.nombre_plan AS planNombre,
  g.codigo AS gestionCodigo,
  g.nombre AS gestionNombre,
  g.anio AS gestionAnio,
  g.vigente AS gestionVigente,
  (
    SELECT COUNT(*)
    FROM oferta_cursos oc
    WHERE oc.paralelo_gestion_id = pg.id
      AND oc.deleted_at IS NULL
      AND oc.activo = TRUE
  ) AS ofertaActual,
  (
    SELECT COALESCE(SUM(ap.horas_semanales), 0)
    FROM oferta_cursos oc
    INNER JOIN asignaturas_plan ap
      ON ap.id = oc.asignatura_plan_id
      AND ap.deleted_at IS NULL
    WHERE oc.paralelo_gestion_id = pg.id
      AND oc.deleted_at IS NULL
      AND oc.activo = TRUE
  ) AS bloquesRequeridos,
  (
    SELECT COUNT(ah.id)
    FROM asignacion_horarios ah
    INNER JOIN asignaciones_docentes ad
      ON ad.id = ah.asignacion_docente_id
      AND ad.deleted_at IS NULL
      AND ad.activo = TRUE
      AND ad.vigente = TRUE
    INNER JOIN oferta_cursos oc
      ON oc.id = ad.oferta_curso_id
      AND oc.deleted_at IS NULL
      AND oc.activo = TRUE
    WHERE oc.paralelo_gestion_id = pg.id
      AND ah.deleted_at IS NULL
      AND ah.activo = TRUE
  ) AS bloquesAsignados
FROM paralelos_gestion pg
LEFT JOIN paralelos p
  ON p.id = pg.paralelo_id
  AND p.deleted_at IS NULL
LEFT JOIN carreras car
  ON car.id = p.carrera_id
  AND car.deleted_at IS NULL
LEFT JOIN periodos per
  ON per.id = p.periodo_id
  AND per.deleted_at IS NULL
LEFT JOIN aulas a
  ON a.id = pg.aula_id
  AND a.deleted_at IS NULL
LEFT JOIN gestiones_planes gp
  ON gp.id = pg.gestion_plan_id
  AND gp.deleted_at IS NULL
LEFT JOIN planes_estudios pl
  ON pl.id = gp.plan_estudio_id
  AND pl.deleted_at IS NULL
LEFT JOIN gestiones g
  ON g.id = gp.gestion_id
  AND g.deleted_at IS NULL;
