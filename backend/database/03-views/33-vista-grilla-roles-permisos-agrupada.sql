-- ============================================
-- VISTA GRILLA: vista_grilla_roles_permisos_agrupada
-- Grilla consolidada por rol + dominio + grupo_ui (una fila por ítem de menú / grupo_ui)
--
-- Propósito: Entregar al backend una estructura estable para
-- el panel de seguridad sin lógica SQL compleja en repositorio.
--
-- Base:
-- - vista_grilla_catalogo_acciones_permisos_activas (catálogo vigente)
-- - roles_permisos (asignaciones activas por rol)
-- - roles (para incluir también grupos sin asignaciones)
--
-- Relaciones según schemas:
-- - vista_grilla_catalogo_acciones_permisos_activas.permiso_id → permisos.id
-- - roles_permisos.permiso_id → permisos.id
-- - roles_permisos.rol_id → roles.id
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_grilla_roles_permisos_agrupada;

CREATE VIEW vista_grilla_roles_permisos_agrupada AS
SELECT
  r.id AS rol_id,
  v.dominio,
  v.grupo_ui,
  GROUP_CONCAT(DISTINCT v.ruta_sidebar ORDER BY v.permiso_id SEPARATOR ' · ') AS ruta_sidebar,
  GROUP_CONCAT(DISTINCT v.codigo ORDER BY v.permiso_id SEPARATOR ',') AS codigos,
  GROUP_CONCAT(DISTINCT v.accion ORDER BY v.accion SEPARATOR ',') AS acciones_validas,
  GROUP_CONCAT(
    DISTINCT IF(rp.id IS NOT NULL, v.accion, NULL)
    ORDER BY v.accion SEPARATOR ','
  ) AS acciones_asignadas
FROM roles r
JOIN vista_grilla_catalogo_acciones_permisos_activas v
LEFT JOIN roles_permisos rp
  ON rp.permiso_id = v.permiso_id
 AND rp.rol_id = r.id
 AND rp.accion = v.accion
 AND rp.activo = TRUE
 AND rp.deleted_at IS NULL
WHERE r.activo = TRUE
  AND r.deleted_at IS NULL
GROUP BY
  r.id,
  v.dominio,
  v.grupo_ui;
