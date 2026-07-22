-- ============================================
-- SEEDER permisos · módulo Capacitación (CAP)
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-65).
-- Roles con acceso (primer corte): RECTOR, DIR_ADMIN, SEC_ADMIN (control total).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('cap_cursos', 'Cursos de capacitación', 'CAPACITACION', 1, 1, NOW(), NOW()),
('cap_participantes', 'Participantes', 'CAPACITACION', 2, 1, NOW(), NOW()),
('cap_inscripciones', 'Inscripciones y pagos', 'CAPACITACION', 3, 1, NOW(), NOW());

-- 1) Permisos del módulo CAP
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('capacitacion.curso', 'Cursos de capacitación: listar, ver detalle, crear, editar, eliminar y activar/desactivar', NULL, 'CAPACITACION', 'CAP', 'cap_cursos', '/capacitacion/cursos', 1, NOW(), NOW()),
('capacitacion.participante', 'Participantes: listar, ver detalle, crear y editar', NULL, 'CAPACITACION', 'CAP', 'cap_participantes', '/capacitacion/participantes', 1, NOW(), NOW()),
('capacitacion.inscripcion', 'Inscripciones: listar, ver detalle, crear y eliminar', NULL, 'CAPACITACION', 'CAP', 'cap_inscripciones', '/capacitacion/inscripciones', 1, NOW(), NOW()),
('capacitacion.pago', 'Pagos de capacitación: registrar pago y exportar', NULL, 'CAPACITACION', 'CAP', 'cap_inscripciones', '/capacitacion/inscripciones', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo CAP
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'capacitacion.curso' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'capacitacion.curso', 'DETALLE'
  UNION ALL SELECT 'capacitacion.curso', 'CREAR'
  UNION ALL SELECT 'capacitacion.curso', 'EDITAR'
  UNION ALL SELECT 'capacitacion.curso', 'ELIMINAR'
  -- ACTIVAR: switch activar/desactivar del curso (PATCH /cursos-capacitacion/:id/estado)
  UNION ALL SELECT 'capacitacion.curso', 'ACTIVAR'
  UNION ALL SELECT 'capacitacion.participante', 'LISTAR'
  UNION ALL SELECT 'capacitacion.participante', 'DETALLE'
  UNION ALL SELECT 'capacitacion.participante', 'CREAR'
  UNION ALL SELECT 'capacitacion.participante', 'EDITAR'
  UNION ALL SELECT 'capacitacion.inscripcion', 'LISTAR'
  UNION ALL SELECT 'capacitacion.inscripcion', 'DETALLE'
  UNION ALL SELECT 'capacitacion.inscripcion', 'CREAR'
  UNION ALL SELECT 'capacitacion.inscripcion', 'ELIMINAR'
  -- EDITAR en este permiso se usa para "anular" (POST /inscripciones-capacitacion/:id/anular,
  -- decisión administrativa manual, nunca automática por incumplir el compromiso de pago).

  UNION ALL SELECT 'capacitacion.inscripcion', 'EDITAR'
  UNION ALL SELECT 'capacitacion.pago', 'CREAR'
  UNION ALL SELECT 'capacitacion.pago', 'EXPORTAR'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo CAP (RECTOR, DIR_ADMIN, SEC_ADMIN; ADMIN_SISTEMA hereda por vista)
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  SELECT 'RECTOR' AS rol, 'capacitacion.curso' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'RECTOR', 'capacitacion.curso', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'capacitacion.curso', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.curso', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.curso', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.curso', 'ACTIVAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.curso', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.curso', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.curso', 'CREAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.curso', 'EDITAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.curso', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.curso', 'ACTIVAR'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.curso', 'LISTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.curso', 'DETALLE'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.curso', 'CREAR'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.curso', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.participante', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.participante', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'capacitacion.participante', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.participante', 'EDITAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.participante', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.participante', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.participante', 'CREAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.participante', 'EDITAR'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.participante', 'LISTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.participante', 'DETALLE'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.participante', 'CREAR'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.participante', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.inscripcion', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.inscripcion', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'capacitacion.inscripcion', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.inscripcion', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.inscripcion', 'EDITAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.inscripcion', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.inscripcion', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.inscripcion', 'CREAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.inscripcion', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.inscripcion', 'EDITAR'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.inscripcion', 'LISTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.inscripcion', 'DETALLE'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.inscripcion', 'CREAR'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.inscripcion', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.pago', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'capacitacion.pago', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.pago', 'CREAR'
  UNION ALL SELECT 'DIR_ADMIN', 'capacitacion.pago', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ADMIN', 'capacitacion.pago', 'CREAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

SET FOREIGN_KEY_CHECKS = 1;
