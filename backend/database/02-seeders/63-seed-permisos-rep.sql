-- ============================================
-- SEEDER permisos · módulo Reportes (REP)
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-64).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('rep_avance', 'Reporte de avance académico', 'REPORTES', 1, 1, NOW(), NOW()),
('rep_asistencia', 'Reporte de asistencia', 'REPORTES', 2, 1, NOW(), NOW()),
('rep_desercion', 'Reporte de deserción', 'REPORTES', 3, 1, NOW(), NOW()),
('rep_solicitudes', 'Reporte de solicitudes', 'REPORTES', 4, 1, NOW(), NOW());

-- 1) Permisos del módulo REP
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('reportes.avance_academico', 'Reporte de avance académico', NULL, 'REPORTES', 'REP', 'rep_avance', '/reportes/avance-academico', 1, NOW(), NOW()),
('reportes.asistencia', 'Reporte de asistencia', NULL, 'REPORTES', 'REP', 'rep_asistencia', '/reportes/asistencia', 1, NOW(), NOW()),
('reportes.desercion', 'Reporte de deserción', NULL, 'REPORTES', 'REP', 'rep_desercion', '/reportes/desercion', 1, NOW(), NOW()),
('reportes.solicitudes.general', 'Reporte general de solicitudes', NULL, 'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes', 1, NOW(), NOW()),
('reportes.solicitudes.becas', 'Reporte de solicitudes de becas', NULL, 'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes', 1, NOW(), NOW()),
('reportes.solicitudes.traspaso', 'Reporte de solicitudes de traspaso', NULL, 'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes', 1, NOW(), NOW()),
('reportes.solicitudes.pasantia', 'Reporte de solicitudes de pasantía', NULL, 'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo REP
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'reportes.avance_academico' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'reportes.avance_academico', 'EXPORTAR'
  UNION ALL SELECT 'reportes.asistencia', 'LISTAR'
  UNION ALL SELECT 'reportes.asistencia', 'EXPORTAR'
  UNION ALL SELECT 'reportes.desercion', 'LISTAR'
  UNION ALL SELECT 'reportes.desercion', 'EXPORTAR'
  UNION ALL SELECT 'reportes.solicitudes.general', 'LISTAR'
  UNION ALL SELECT 'reportes.solicitudes.general', 'EXPORTAR'
  UNION ALL SELECT 'reportes.solicitudes.becas', 'LISTAR'
  UNION ALL SELECT 'reportes.solicitudes.becas', 'EXPORTAR'
  UNION ALL SELECT 'reportes.solicitudes.traspaso', 'LISTAR'
  UNION ALL SELECT 'reportes.solicitudes.traspaso', 'EXPORTAR'
  UNION ALL SELECT 'reportes.solicitudes.pasantia', 'LISTAR'
  UNION ALL SELECT 'reportes.solicitudes.pasantia', 'EXPORTAR'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo REP (roles 2-8; ADMIN_SISTEMA hereda por vista)
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  SELECT 'RECTOR' AS rol, 'reportes.avance_academico' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'RECTOR', 'reportes.asistencia', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'reportes.desercion', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.general', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.becas', 'LISTAR'
  -- 2026-07-14: faltaba por completo (huérfano de rol) a diferencia de sus
  -- hermanos general/becas; mismo criterio (RECTOR) mientras se construye la pantalla.
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.traspaso', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.pasantia', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'reportes.solicitudes.pasantia', 'LISTAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

-- ============================================================
-- DESHABILITACIÓN TEMPORAL · páginas aún no construidas (2026-06-24)
-- Reportes (Avance académico, Asistencia, Deserción y Solicitudes): TODO el
-- módulo de reportes se oculta hasta que las pantallas existan.
-- Se marca activo=0 y deleted_at = fecha de baja en permisos, sus acciones
-- (permiso_acciones), sus asignaciones a roles (roles_permisos) y los grupos
-- de UI. Quedan ocultas para TODOS los roles, incluido ADMIN_SISTEMA, que
-- hereda por vista_*_activas (filtra activo=TRUE y deleted_at IS NULL).
-- Para REHABILITAR: poner activo=1 y deleted_at=NULL en estas mismas filas.
-- ============================================================
SET @fecha_baja := '2026-06-24 00:00:00';

-- 1) Permisos de las páginas no construidas (todo el módulo REP)
UPDATE permisos
SET activo = 0, deleted_at = @fecha_baja
WHERE codigo IN (
  'reportes.avance_academico',
  'reportes.asistencia',
  'reportes.desercion',
  'reportes.solicitudes.general',
  'reportes.solicitudes.becas',
  'reportes.solicitudes.traspaso',
  'reportes.solicitudes.pasantia'
);

-- 2) Cascada: acciones de esos permisos
UPDATE permiso_acciones pa
JOIN permisos p ON p.id = pa.permiso_id
SET pa.activo = 0, pa.deleted_at = @fecha_baja
WHERE p.modulo = 'REP' AND p.deleted_at IS NOT NULL;

-- 3) Cascada: asignaciones a roles de esos permisos
UPDATE roles_permisos rp
JOIN permisos p ON p.id = rp.permiso_id
SET rp.activo = 0, rp.deleted_at = @fecha_baja
WHERE p.modulo = 'REP' AND p.deleted_at IS NOT NULL;

-- 4) Grupos de UI cuyas páginas quedan completamente ocultas
UPDATE grupos_ui
SET activo = 0, deleted_at = @fecha_baja
WHERE codigo IN (
  'rep_avance',
  'rep_asistencia',
  'rep_desercion',
  'rep_solicitudes'
);

SET FOREIGN_KEY_CHECKS = 1;
