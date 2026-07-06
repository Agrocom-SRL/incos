-- ============================================
-- SEEDER permisos · módulo Configuración (CFG)
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-64).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('configuracion_academico_carrera', 'Académico · carreras', 'CONFIGURACION', 1, 1, NOW(), NOW()),
('configuracion_academico_materia', 'Académico · materias', 'CONFIGURACION', 2, 1, NOW(), NOW()),
('configuracion_academico_plan', 'Académico · planes de estudio', 'CONFIGURACION', 3, 1, NOW(), NOW()),
('configuracion_academico_paralelo', 'Académico · paralelos', 'CONFIGURACION', 4, 1, NOW(), NOW()),
('configuracion_academico_prerrequisitos', 'Académico · prerrequisitos', 'CONFIGURACION', 5, 1, NOW(), NOW()),
('configuracion_plan_periodos', 'Académico · periodos del plan', 'CONFIGURACION', 6, 1, NOW(), NOW()),
('configuracion_plan_asignaturas', 'Académico · asignaturas del plan', 'CONFIGURACION', 7, 1, NOW(), NOW()),
('configuracion_complementario', 'Datos complementarios', 'CONFIGURACION', 8, 1, NOW(), NOW()),
('configuracion_documentacion', 'Documentación', 'CONFIGURACION', 9, 1, NOW(), NOW()),
('configuracion_convenios', 'Convenios', 'CONFIGURACION', 10, 1, NOW(), NOW()),
('configuracion_actividad', 'Actividades', 'CONFIGURACION', 11, 1, NOW(), NOW());

-- 1) Permisos del módulo CFG
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('configuracion.plan-estudio', 'Académico: planes de estudio', NULL, 'CONFIGURACION', 'CFG', 'configuracion_academico_plan', '/configuracion/academico', 1, NOW(), NOW()),
('configuracion.carrera', 'Académico: carreras', NULL, 'CONFIGURACION', 'CFG', 'configuracion_academico_carrera', '/configuracion/academico', 1, NOW(), NOW()),
('configuracion.materia', 'Académico: materias', NULL, 'CONFIGURACION', 'CFG', 'configuracion_academico_materia', '/configuracion/academico', 1, NOW(), NOW()),
('configuracion.plan-estudio.periodos', 'Plan: periodos (años)', NULL, 'CONFIGURACION', 'CFG', 'configuracion_plan_periodos', '/configuracion/academico', 1, NOW(), NOW()),
('configuracion.plan-estudio.asignaturas', 'Plan: asignaturas por periodo', NULL, 'CONFIGURACION', 'CFG', 'configuracion_plan_asignaturas', '/configuracion/academico', 1, NOW(), NOW()),
('configuracion.plan-estudio.prerrequisitos', 'Académico: prerrequisitos', NULL, 'CONFIGURACION', 'CFG', 'configuracion_academico_prerrequisitos', '/configuracion/academico', 1, NOW(), NOW()),
('configuracion.paralelo', 'Académico: paralelos maestro', NULL, 'CONFIGURACION', 'CFG', 'configuracion_academico_paralelo', '/configuracion/academico', 1, NOW(), NOW()),
('configuracion.documentacion.inscripcion', 'Documentación: inscripción', NULL, 'CONFIGURACION', 'CFG', 'configuracion_documentacion', '/configuracion/documentacion', 1, NOW(), NOW()),
('configuracion.documentacion.becas', 'Documentación: becas', NULL, 'CONFIGURACION', 'CFG', 'configuracion_documentacion', '/configuracion/documentacion', 1, NOW(), NOW()),
('configuracion.documentacion.pasantias', 'Documentación: pasantías', NULL, 'CONFIGURACION', 'CFG', 'configuracion_documentacion', '/configuracion/documentacion', 1, NOW(), NOW()),
('configuracion.documentacion.traslado', 'Documentación: traslado', NULL, 'CONFIGURACION', 'CFG', 'configuracion_documentacion', '/configuracion/documentacion', 1, NOW(), NOW()),
('configuracion.complementario.discapacidad', 'Complementarios: discapacidad', NULL, 'CONFIGURACION', 'CFG', 'configuracion_complementario', '/configuracion/datos-complementarios', 1, NOW(), NOW()),
('configuracion.complementario.apoderados', 'Complementarios: apoderados', NULL, 'CONFIGURACION', 'CFG', 'configuracion_complementario', '/configuracion/datos-complementarios', 1, NOW(), NOW()),
('configuracion.complementario.idiomas', 'Complementarios: idiomas', NULL, 'CONFIGURACION', 'CFG', 'configuracion_complementario', '/configuracion/datos-complementarios', 1, NOW(), NOW()),
('configuracion.convenios', 'Empresas y convenios', NULL, 'CONFIGURACION', 'CFG', 'configuracion_convenios', '/configuracion/convenios', 1, NOW(), NOW()),
('configuracion.actividad', 'Actividades', NULL, 'CONFIGURACION', 'CFG', 'configuracion_actividad', '/configuracion/historial-actividades', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo CFG
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'configuracion.plan-estudio' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'configuracion.plan-estudio', 'DETALLE'
  UNION ALL SELECT 'configuracion.plan-estudio', 'CREAR'
  UNION ALL SELECT 'configuracion.plan-estudio', 'EDITAR'
  UNION ALL SELECT 'configuracion.plan-estudio', 'ACTIVAR'
  UNION ALL SELECT 'configuracion.carrera', 'LISTAR'
  UNION ALL SELECT 'configuracion.carrera', 'DETALLE'
  UNION ALL SELECT 'configuracion.carrera', 'CREAR'
  UNION ALL SELECT 'configuracion.carrera', 'EDITAR'
  UNION ALL SELECT 'configuracion.carrera', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.materia', 'LISTAR'
  UNION ALL SELECT 'configuracion.materia', 'DETALLE'
  UNION ALL SELECT 'configuracion.materia', 'CREAR'
  UNION ALL SELECT 'configuracion.materia', 'EDITAR'
  UNION ALL SELECT 'configuracion.materia', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.plan-estudio.periodos', 'LISTAR'
  UNION ALL SELECT 'configuracion.plan-estudio.periodos', 'CREAR'
  UNION ALL SELECT 'configuracion.plan-estudio.periodos', 'EDITAR'
  UNION ALL SELECT 'configuracion.plan-estudio.periodos', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.plan-estudio.asignaturas', 'LISTAR'
  UNION ALL SELECT 'configuracion.plan-estudio.asignaturas', 'CREAR'
  UNION ALL SELECT 'configuracion.plan-estudio.asignaturas', 'EDITAR'
  UNION ALL SELECT 'configuracion.plan-estudio.asignaturas', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.plan-estudio.prerrequisitos', 'LISTAR'
  UNION ALL SELECT 'configuracion.plan-estudio.prerrequisitos', 'DETALLE'
  UNION ALL SELECT 'configuracion.plan-estudio.prerrequisitos', 'CREAR'
  UNION ALL SELECT 'configuracion.plan-estudio.prerrequisitos', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.paralelo', 'LISTAR'
  UNION ALL SELECT 'configuracion.paralelo', 'DETALLE'
  UNION ALL SELECT 'configuracion.paralelo', 'CREAR'
  UNION ALL SELECT 'configuracion.paralelo', 'EDITAR'
  UNION ALL SELECT 'configuracion.paralelo', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.paralelo', 'ACTIVAR'
  UNION ALL SELECT 'configuracion.documentacion.inscripcion', 'LISTAR'
  UNION ALL SELECT 'configuracion.documentacion.inscripcion', 'DETALLE'
  UNION ALL SELECT 'configuracion.documentacion.inscripcion', 'CREAR'
  UNION ALL SELECT 'configuracion.documentacion.inscripcion', 'EDITAR'
  UNION ALL SELECT 'configuracion.documentacion.inscripcion', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.documentacion.becas', 'LISTAR'
  UNION ALL SELECT 'configuracion.documentacion.becas', 'DETALLE'
  UNION ALL SELECT 'configuracion.documentacion.becas', 'CREAR'
  UNION ALL SELECT 'configuracion.documentacion.becas', 'EDITAR'
  UNION ALL SELECT 'configuracion.documentacion.becas', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.documentacion.pasantias', 'LISTAR'
  UNION ALL SELECT 'configuracion.documentacion.pasantias', 'DETALLE'
  UNION ALL SELECT 'configuracion.documentacion.pasantias', 'CREAR'
  UNION ALL SELECT 'configuracion.documentacion.pasantias', 'EDITAR'
  UNION ALL SELECT 'configuracion.documentacion.pasantias', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.documentacion.traslado', 'LISTAR'
  UNION ALL SELECT 'configuracion.documentacion.traslado', 'DETALLE'
  UNION ALL SELECT 'configuracion.documentacion.traslado', 'CREAR'
  UNION ALL SELECT 'configuracion.documentacion.traslado', 'EDITAR'
  UNION ALL SELECT 'configuracion.documentacion.traslado', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.complementario.discapacidad', 'LISTAR'
  UNION ALL SELECT 'configuracion.complementario.discapacidad', 'DETALLE'
  UNION ALL SELECT 'configuracion.complementario.discapacidad', 'CREAR'
  UNION ALL SELECT 'configuracion.complementario.discapacidad', 'EDITAR'
  UNION ALL SELECT 'configuracion.complementario.discapacidad', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.complementario.apoderados', 'LISTAR'
  UNION ALL SELECT 'configuracion.complementario.apoderados', 'DETALLE'
  UNION ALL SELECT 'configuracion.complementario.apoderados', 'CREAR'
  UNION ALL SELECT 'configuracion.complementario.apoderados', 'EDITAR'
  UNION ALL SELECT 'configuracion.complementario.apoderados', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.complementario.idiomas', 'LISTAR'
  UNION ALL SELECT 'configuracion.complementario.idiomas', 'DETALLE'
  UNION ALL SELECT 'configuracion.complementario.idiomas', 'CREAR'
  UNION ALL SELECT 'configuracion.complementario.idiomas', 'EDITAR'
  UNION ALL SELECT 'configuracion.complementario.idiomas', 'ELIMINAR'
  UNION ALL SELECT 'configuracion.convenios', 'LISTAR'
  UNION ALL SELECT 'configuracion.convenios', 'CREAR'
  UNION ALL SELECT 'configuracion.convenios', 'EDITAR'
  UNION ALL SELECT 'configuracion.actividad', 'LISTAR'
  UNION ALL SELECT 'configuracion.actividad', 'DETALLE'
  UNION ALL SELECT 'configuracion.actividad', 'CREAR'
  UNION ALL SELECT 'configuracion.actividad', 'EDITAR'
  UNION ALL SELECT 'configuracion.actividad', 'ELIMINAR'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo CFG (roles 2-8; ADMIN_SISTEMA hereda por vista)
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  SELECT 'RECTOR' AS rol, 'configuracion.plan-estudio' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio', 'ACTIVAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.carrera', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.carrera', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.carrera', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.carrera', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.carrera', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.carrera', 'ACTIVAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.carrera', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.carrera', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.carrera', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.carrera', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.materia', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.materia', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.materia', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.materia', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.materia', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.materia', 'ACTIVAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.materia', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.materia', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.materia', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.materia', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio.periodos', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio.periodos', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio.periodos', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio.periodos', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio.periodos', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio.periodos', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio.periodos', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio.periodos', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio.periodos', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio.periodos', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio.asignaturas', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio.asignaturas', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio.asignaturas', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio.asignaturas', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio.prerrequisitos', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.plan-estudio.prerrequisitos', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio.prerrequisitos', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.plan-estudio.prerrequisitos', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.paralelo', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.paralelo', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.paralelo', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.paralelo', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.paralelo', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.paralelo', 'ACTIVAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.paralelo', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.paralelo', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.paralelo', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.paralelo', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.paralelo', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.inscripcion', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.inscripcion', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.inscripcion', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.inscripcion', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.inscripcion', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.inscripcion', 'ACTIVAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.documentacion.inscripcion', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.documentacion.inscripcion', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.becas', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.becas', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.becas', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.becas', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.becas', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.documentacion.becas', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.documentacion.becas', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.documentacion.becas', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.pasantias', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.pasantias', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.pasantias', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.pasantias', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.pasantias', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.documentacion.pasantias', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.documentacion.pasantias', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.traslado', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.traslado', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.traslado', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.traslado', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.documentacion.traslado', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.documentacion.traslado', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.documentacion.traslado', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.discapacidad', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.discapacidad', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.discapacidad', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.discapacidad', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.discapacidad', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.discapacidad', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.discapacidad', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.discapacidad', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.discapacidad', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.apoderados', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.apoderados', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.apoderados', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.apoderados', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.apoderados', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.apoderados', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.apoderados', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.apoderados', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.apoderados', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.idiomas', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.idiomas', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.idiomas', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.idiomas', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.complementario.idiomas', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.idiomas', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.idiomas', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.idiomas', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.idiomas', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.complementario.idiomas', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.convenios', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.convenios', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.convenios', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.convenios', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.convenios', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.actividad', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.actividad', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'configuracion.actividad', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.actividad', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'configuracion.actividad', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.actividad', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'configuracion.actividad', 'DETALLE'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

-- ============================================================
-- DESHABILITACIÓN TEMPORAL · páginas aún no construidas (2026-06-24)
-- Empresas y convenios: se oculta hasta que la pantalla exista. (El resto de
-- Configuración académica, Datos complementarios, Documentación, Actividades
-- y pagos SÍ está construido y permanece activo.)
-- Se marca activo=0 y deleted_at = fecha de baja en permisos, sus acciones
-- (permiso_acciones), sus asignaciones a roles (roles_permisos) y los grupos
-- de UI. Quedan ocultas para TODOS los roles, incluido ADMIN_SISTEMA, que
-- hereda por vista_*_activas (filtra activo=TRUE y deleted_at IS NULL).
-- Para REHABILITAR: poner activo=1 y deleted_at=NULL en estas mismas filas.
-- ============================================================
SET @fecha_baja := '2026-06-24 00:00:00';

-- 1) Permisos de las páginas no construidas
UPDATE permisos
SET activo = 0, deleted_at = @fecha_baja
WHERE codigo IN (
  -- Empresas y convenios
  'configuracion.convenios'
);

-- 2) Cascada: acciones de esos permisos
UPDATE permiso_acciones pa
JOIN permisos p ON p.id = pa.permiso_id
SET pa.activo = 0, pa.deleted_at = @fecha_baja
WHERE p.modulo = 'CFG' AND p.deleted_at IS NOT NULL;

-- 3) Cascada: asignaciones a roles de esos permisos
UPDATE roles_permisos rp
JOIN permisos p ON p.id = rp.permiso_id
SET rp.activo = 0, rp.deleted_at = @fecha_baja
WHERE p.modulo = 'CFG' AND p.deleted_at IS NOT NULL;

-- 4) Grupos de UI cuyas páginas quedan completamente ocultas
UPDATE grupos_ui
SET activo = 0, deleted_at = @fecha_baja
WHERE codigo IN (
  'configuracion_convenios'
);

SET FOREIGN_KEY_CHECKS = 1;
