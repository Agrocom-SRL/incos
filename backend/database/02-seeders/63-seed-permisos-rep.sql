-- ============================================
-- SEEDER permisos · módulo Reportes (REP)
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-64).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

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
  UNION ALL SELECT 'RECTOR', 'reportes.avance_academico', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'reportes.avance_academico', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'reportes.asistencia', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'reportes.asistencia', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'reportes.asistencia', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'reportes.desercion', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'reportes.desercion', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'reportes.desercion', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'reportes.desercion', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.general', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.general', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.general', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.becas', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.becas', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.becas', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.becas', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.becas', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.traspaso', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.pasantia', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.pasantia', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'reportes.solicitudes.pasantia', 'EDITAR'
  UNION ALL SELECT 'DIR_ADMIN', 'reportes.solicitudes.pasantia', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'reportes.solicitudes.pasantia', 'CREAR'
  UNION ALL SELECT 'DIR_ADMIN', 'reportes.solicitudes.pasantia', 'EDITAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

SET FOREIGN_KEY_CHECKS = 1;
