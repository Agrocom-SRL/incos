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
-- paralelos_gestion → oferta_cursos → asignaciones_docentes
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
  ) AS ofertaActual
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
