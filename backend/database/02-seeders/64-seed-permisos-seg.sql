-- ============================================
-- SEEDER permisos · módulo Seguridad (SEG) — incluye submódulo Sistema (SYS): catálogos de referencia
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-64).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
-- (incluye SYS: el permiso técnico sistema.catalogo.referencia no tiene grupo_ui, no se lista)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('seg_usuarios', 'Usuarios', 'SEGURIDAD', 1, 1, NOW(), NOW()),
('seg_roles', 'Roles y permisos', 'SEGURIDAD', 2, 1, NOW(), NOW());

-- 1) Permisos del módulo SEG
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('seguridad.usuario.crear', 'Usuarios: crear nuevo usuario', NULL, 'SEGURIDAD', 'SEG', 'seg_usuarios', '/seguridad/usuarios', 1, NOW(), NOW()),
('seguridad.usuario.administrar', 'Usuarios: listar, ver y administrar', NULL, 'SEGURIDAD', 'SEG', 'seg_usuarios', '/seguridad/usuarios', 1, NOW(), NOW()),
('seguridad.rol.gestionar', 'Roles y permisos: ver y administrar', NULL, 'SEGURIDAD', 'SEG', 'seg_roles', '/seguridad/roles', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo SEG
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'seguridad.usuario.crear' AS codigo, 'CREAR' AS accion
  UNION ALL SELECT 'seguridad.usuario.administrar', 'LISTAR'
  UNION ALL SELECT 'seguridad.usuario.administrar', 'DETALLE'
  UNION ALL SELECT 'seguridad.usuario.administrar', 'EDITAR'
  UNION ALL SELECT 'seguridad.usuario.administrar', 'ELIMINAR'
  UNION ALL SELECT 'seguridad.usuario.administrar', 'ACTIVAR'
  UNION ALL SELECT 'seguridad.rol.gestionar', 'LISTAR'
  UNION ALL SELECT 'seguridad.rol.gestionar', 'CREAR'
  UNION ALL SELECT 'seguridad.rol.gestionar', 'EDITAR'
  UNION ALL SELECT 'seguridad.rol.gestionar', 'DETALLE'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo SEG (roles 2-8; ADMIN_SISTEMA hereda por vista)
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  SELECT 'RECTOR' AS rol, 'seguridad.usuario.administrar' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'DIR_ACADEMICO', 'seguridad.usuario.administrar', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'seguridad.usuario.administrar', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'seguridad.rol.gestionar', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'seguridad.rol.gestionar', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'seguridad.rol.gestionar', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'seguridad.rol.gestionar', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'seguridad.rol.gestionar', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'seguridad.rol.gestionar', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'seguridad.rol.gestionar', 'DETALLE'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

-- 4) Permisos del submódulo Sistema (SYS) — catálogo de referencia transversal
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('sistema.catalogo.referencia', 'Catálogos de referencia: APIs transversales para combos (ubicación, tipos, bancos, etc.)', NULL, 'SISTEMA', 'SYS', NULL, NULL, 1, NOW(), NOW());

-- 5) Acciones del submódulo Sistema (SYS)
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'sistema.catalogo.referencia' AS codigo, 'LISTAR' AS accion
) AS x ON x.codigo = p.codigo;

-- 6) Roles-permisos del submódulo Sistema (SYS) (roles 2-8; ADMIN_SISTEMA hereda por vista)
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  SELECT 'RECTOR' AS rol, 'sistema.catalogo.referencia' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'DIR_ACADEMICO', 'sistema.catalogo.referencia', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'sistema.catalogo.referencia', 'LISTAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

SET FOREIGN_KEY_CHECKS = 1;
