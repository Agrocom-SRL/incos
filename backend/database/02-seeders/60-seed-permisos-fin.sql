-- ============================================
-- SEEDER permisos · módulo Finanzas (FIN)
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-64).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('fin_pagos', 'Pagos', 'FINANZAS', 1, 1, NOW(), NOW()),
('fin_adicionales', 'Pagos adicionales', 'FINANZAS', 2, 1, NOW(), NOW()),
('fin_reportes', 'Reportes de pagos', 'FINANZAS', 3, 1, NOW(), NOW());

-- 1) Permisos del módulo FIN
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('finanzas.pago.ver', 'Pagos: listar, ver detalle; exportar recibos y Excel estado aportes por carrera', NULL, 'FINANZAS', 'FIN', 'fin_pagos', '/pagos/listar', 1, NOW(), NOW()),
('finanzas.pago.registrar', 'Pagos: registrar pago', NULL, 'FINANZAS', 'FIN', 'fin_pagos', '/pagos/listar', 1, NOW(), NOW()),
('finanzas.pago.editar', 'Pagos: editar y eliminar pago', NULL, 'FINANZAS', 'FIN', 'fin_pagos', '/pagos/listar', 1, NOW(), NOW()),
('finanzas.pago.adicionales', 'Pagos adicionales: gestionar', NULL, 'FINANZAS', 'FIN', 'fin_adicionales', '/pagos/adicionales', 1, NOW(), NOW()),
('finanzas.compromiso.gestionar', 'Compromisos de pago: listar, ver detalle, crear, editar y eliminar', NULL, 'FINANZAS', 'FIN', 'fin_pagos', '/pagos/listar', 1, NOW(), NOW()),
('finanzas.pago.reporte.carrera', 'Reportes de pagos: por carrera', NULL, 'FINANZAS', 'FIN', 'fin_reportes', '/pagos/reportes', 1, NOW(), NOW()),
('finanzas.pago.reporte.estudiante', 'Reportes de pagos: por estudiante', NULL, 'FINANZAS', 'FIN', 'fin_reportes', '/pagos/reportes', 1, NOW(), NOW()),
('finanzas.pago.reporte.gestion', 'Reportes de pagos: por gestión', NULL, 'FINANZAS', 'FIN', 'fin_reportes', '/pagos/reportes', 1, NOW(), NOW()),
('finanzas.beca.reporte', 'Reportes de pagos: control de becas por carrera', NULL, 'FINANZAS', 'FIN', 'fin_reportes', '/pagos/reportes', 1, NOW(), NOW()),
('finanzas.cuenta-cobrar.reporte', 'Reportes de pagos: cuentas por cobrar', NULL, 'FINANZAS', 'FIN', 'fin_reportes', '/pagos/reportes', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo FIN
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'finanzas.pago.ver' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'finanzas.pago.ver', 'DETALLE'
  UNION ALL SELECT 'finanzas.pago.ver', 'EXPORTAR'
  UNION ALL SELECT 'finanzas.pago.registrar', 'CREAR'
  UNION ALL SELECT 'finanzas.pago.editar', 'EDITAR'
  UNION ALL SELECT 'finanzas.pago.editar', 'ELIMINAR'
  UNION ALL SELECT 'finanzas.pago.adicionales', 'LISTAR'
  UNION ALL SELECT 'finanzas.pago.adicionales', 'DETALLE'
  UNION ALL SELECT 'finanzas.pago.adicionales', 'CREAR'
  UNION ALL SELECT 'finanzas.pago.adicionales', 'EDITAR'
  UNION ALL SELECT 'finanzas.pago.adicionales', 'ELIMINAR'
  UNION ALL SELECT 'finanzas.compromiso.gestionar', 'LISTAR'
  UNION ALL SELECT 'finanzas.compromiso.gestionar', 'DETALLE'
  UNION ALL SELECT 'finanzas.compromiso.gestionar', 'CREAR'
  UNION ALL SELECT 'finanzas.compromiso.gestionar', 'EDITAR'
  UNION ALL SELECT 'finanzas.compromiso.gestionar', 'ELIMINAR'
  UNION ALL SELECT 'finanzas.pago.reporte.carrera', 'LISTAR'
  UNION ALL SELECT 'finanzas.pago.reporte.carrera', 'EXPORTAR'
  UNION ALL SELECT 'finanzas.pago.reporte.estudiante', 'LISTAR'
  UNION ALL SELECT 'finanzas.pago.reporte.estudiante', 'EXPORTAR'
  UNION ALL SELECT 'finanzas.pago.reporte.gestion', 'LISTAR'
  UNION ALL SELECT 'finanzas.pago.reporte.gestion', 'EXPORTAR'
  UNION ALL SELECT 'finanzas.beca.reporte', 'LISTAR'
  UNION ALL SELECT 'finanzas.beca.reporte', 'EXPORTAR'
  UNION ALL SELECT 'finanzas.cuenta-cobrar.reporte', 'LISTAR'
  UNION ALL SELECT 'finanzas.cuenta-cobrar.reporte', 'EXPORTAR'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo FIN (roles 2-8; ADMIN_SISTEMA hereda por vista)
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  SELECT 'RECTOR' AS rol, 'finanzas.pago.ver' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.ver', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.ver', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.pago.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.pago.ver', 'DETALLE'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.pago.ver', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.registrar', 'CREAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.registrar', 'CREAR'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.pago.registrar', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.editar', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.editar', 'EDITAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.editar', 'ELIMINAR'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.pago.editar', 'EDITAR'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.pago.editar', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.adicionales', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.adicionales', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.adicionales', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.adicionales', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.adicionales', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.adicionales', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.adicionales', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.adicionales', 'CREAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.adicionales', 'EDITAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.adicionales', 'ELIMINAR'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.pago.adicionales', 'LISTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.pago.adicionales', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.compromiso.gestionar', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.compromiso.gestionar', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'finanzas.compromiso.gestionar', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.compromiso.gestionar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.compromiso.gestionar', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.compromiso.gestionar', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.compromiso.gestionar', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.compromiso.gestionar', 'CREAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.compromiso.gestionar', 'EDITAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.compromiso.gestionar', 'ELIMINAR'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.compromiso.gestionar', 'LISTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.compromiso.gestionar', 'DETALLE'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.compromiso.gestionar', 'CREAR'
  UNION ALL SELECT 'SEC_ADMIN', 'finanzas.compromiso.gestionar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.reporte.carrera', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.reporte.carrera', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.reporte.carrera', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.reporte.carrera', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.reporte.estudiante', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.reporte.estudiante', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.reporte.estudiante', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.reporte.estudiante', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.reporte.gestion', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.pago.reporte.gestion', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.reporte.gestion', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.pago.reporte.gestion', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.beca.reporte', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.beca.reporte', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.beca.reporte', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.beca.reporte', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.cuenta-cobrar.reporte', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'finanzas.cuenta-cobrar.reporte', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.cuenta-cobrar.reporte', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'finanzas.cuenta-cobrar.reporte', 'EXPORTAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

-- ============================================================
-- DESHABILITACIÓN TEMPORAL · páginas aún no construidas (2026-06-24)
-- Pagos adicionales: se oculta hasta que la pantalla exista. (Pagos y Reportes
-- de pagos SÍ están construidos y permanecen activos.)
-- Se marca activo=0 y deleted_at = fecha de baja en el permiso, sus acciones
-- (permiso_acciones), sus asignaciones a roles (roles_permisos) y el grupo de
-- UI. Queda oculta para TODOS los roles, incluido ADMIN_SISTEMA, que hereda
-- por vista_*_activas (filtra activo=TRUE y deleted_at IS NULL).
-- Para REHABILITAR: poner activo=1 y deleted_at=NULL en estas mismas filas.
-- ============================================================
SET @fecha_baja := '2026-06-24 00:00:00';

-- 1) Permiso de la página no construida
UPDATE permisos
SET activo = 0, deleted_at = @fecha_baja
WHERE codigo IN ('finanzas.pago.adicionales');

-- 2) Cascada: acciones de ese permiso
UPDATE permiso_acciones pa
JOIN permisos p ON p.id = pa.permiso_id
SET pa.activo = 0, pa.deleted_at = @fecha_baja
WHERE p.modulo = 'FIN' AND p.deleted_at IS NOT NULL;

-- 3) Cascada: asignaciones a roles de ese permiso
UPDATE roles_permisos rp
JOIN permisos p ON p.id = rp.permiso_id
SET rp.activo = 0, rp.deleted_at = @fecha_baja
WHERE p.modulo = 'FIN' AND p.deleted_at IS NOT NULL;

-- 4) Grupo de UI que queda completamente oculto
UPDATE grupos_ui
SET activo = 0, deleted_at = @fecha_baja
WHERE codigo IN ('fin_adicionales');

SET FOREIGN_KEY_CHECKS = 1;
