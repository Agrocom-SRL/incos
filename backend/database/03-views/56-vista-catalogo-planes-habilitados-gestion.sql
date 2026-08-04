-- ============================================
-- VISTA: vista_catalogo_planes_habilitados_gestion
-- Planes habilitados (gestiones_planes) con datos de gestión.
--
-- Propósito:
-- - Catálogo para asignación docente.
-- - Reemplaza SQL embebido en ManagementPlanRepository.findPlanesDocenteAsignacionCatalog.
--
-- Reutiliza:
-- - gestiones_planes
-- - gestiones
-- - planes_estudios
-- - carreras
--
-- Uso:
-- SELECT *
-- FROM vista_catalogo_planes_habilitados_gestion
-- ORDER BY gestionAnio DESC, id DESC;
--
-- SELECT *
-- FROM vista_catalogo_planes_habilitados_gestion
-- WHERE gestionId = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_catalogo_planes_habilitados_gestion;

CREATE VIEW vista_catalogo_planes_habilitados_gestion AS
SELECT
  gp.id AS id,

  gp.gestion_id AS gestionId,
  g.codigo AS gestionCodigo,
  g.nombre AS gestionNombre,
  g.anio AS gestionAnio,

  gp.plan_estudio_id AS planEstudioId,
  gp.nombre AS nombre,
  gp.estado AS estado,

  pe.nombre_plan AS planNombre,
  pe.resolucion_ministerial AS planResolucion,
  pe.vigente AS planVigente,

  car.id AS carreraId,
  car.nombre AS carreraNombre,
  car.codigo AS carreraCodigo,
  car.imagen_ruta AS carreraImagenRuta,
  car.color_hex AS carreraColorHex

FROM gestiones_planes gp

INNER JOIN gestiones g
  ON g.id = gp.gestion_id
  AND g.deleted_at IS NULL

LEFT JOIN planes_estudios pe
  ON pe.id = gp.plan_estudio_id
  AND pe.deleted_at IS NULL
  AND pe.activo = TRUE

LEFT JOIN carreras car
  ON car.id = pe.carrera_id
  AND car.deleted_at IS NULL
  AND car.activo = TRUE

WHERE gp.deleted_at IS NULL
  AND gp.activo = TRUE;