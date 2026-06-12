-- ============================================
-- SEEDER permisos · módulo Institucional (INST)
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-64).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('inst_gestion', 'Gestión actual', 'INSTITUCIONAL', 1, 1, NOW(), NOW()),
('inst_cronograma', 'Cronogramas', 'INSTITUCIONAL', 2, 1, NOW(), NOW()),
('inst_oferta', 'Oferta académica', 'INSTITUCIONAL', 3, 1, NOW(), NOW()),
('inst_oferta_academica', 'Oferta académica · planes y cursos', 'INSTITUCIONAL', 4, 1, NOW(), NOW()),
('inst_horarios', 'Horarios · tablero', 'INSTITUCIONAL', 5, 1, NOW(), NOW()),
('inst_horarios_plantilla', 'Horarios · plantilla', 'INSTITUCIONAL', 6, 1, NOW(), NOW()),
('inst_horarios_armado', 'Horarios · armado y conflictos', 'INSTITUCIONAL', 7, 1, NOW(), NOW()),
('inst_horarios_asignacion', 'Horarios · asignación docente', 'INSTITUCIONAL', 8, 1, NOW(), NOW()),
('inst_horarios_carga', 'Horarios · carga docente', 'INSTITUCIONAL', 9, 1, NOW(), NOW()),
('inst_horarios_publicacion', 'Horarios · publicación', 'INSTITUCIONAL', 10, 1, NOW(), NOW()),
('inst_pasadas', 'Gestiones pasadas', 'INSTITUCIONAL', 11, 1, NOW(), NOW());

-- 1) Permisos del módulo INST
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('institucional.gestion.actual', 'Gestión actual: ver', NULL, 'INSTITUCIONAL', 'INST', 'inst_gestion', '/institucional/actual', 1, NOW(), NOW()),
('institucional.gestion.cronograma', 'Cronogramas: gestionar', NULL, 'INSTITUCIONAL', 'INST', 'inst_cronograma', '/institucional/cronogramas', 1, NOW(), NOW()),
('institucional.gestion.oferta', 'Oferta académica: gestionar', NULL, 'INSTITUCIONAL', 'INST', 'inst_oferta', '/institucional/oferta', 1, NOW(), NOW()),
('institucional.gestion.horarios', 'Horarios: asignar', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios', '/institucional/horarios', 1, NOW(), NOW()),
('institucional.oferta.gestionar', 'Inscripción por materia o curso', NULL, 'INSTITUCIONAL', 'INST', 'inst_oferta', '/institucional/oferta', 1, NOW(), NOW()),
('institucional.horario.asignar', 'Generar horarios', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios', '/institucional/horarios/generar', 1, NOW(), NOW()),
('institucional.gestion.pasadas', 'Gestiones pasadas: ver', NULL, 'INSTITUCIONAL', 'INST', 'inst_pasadas', '/institucional/pasadas', 1, NOW(), NOW()),
('institucional.horario.plantilla', 'Gestión de horarios: trabajar plantilla base', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_plantilla', '/institucional/horarios/plantilla', 1, NOW(), NOW()),
('institucional.horario.armado', 'Gestión de horarios: armado operativo de bloques', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_armado', '/institucional/horarios/armado', 1, NOW(), NOW()),
('institucional.horario.conflictos', 'Gestión de horarios: revisión y resolución de conflictos (UI en armado)', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_armado', '/institucional/horarios/armado', 1, NOW(), NOW()),
('institucional.horario.publicacion', 'Gestión de horarios: publicación de horarios vigentes', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_publicacion', '/institucional/horarios/publicacion', 1, NOW(), NOW()),
('institucional.oferta.gestion-plan', 'Oferta: habilitar planes en gestión', NULL, 'INSTITUCIONAL', 'INST', 'inst_oferta_academica', '/institucional/oferta', 1, NOW(), NOW()),
('institucional.oferta.paralelo-gestion', 'Oferta: paralelos de gestión', NULL, 'INSTITUCIONAL', 'INST', 'inst_oferta_academica', '/institucional/oferta', 1, NOW(), NOW()),
('institucional.oferta.cursos', 'Oferta: cursos ofertados por paralelo', NULL, 'INSTITUCIONAL', 'INST', 'inst_oferta_academica', '/institucional/oferta', 1, NOW(), NOW()),
('institucional.horarios.asignacion-docente', 'Horarios: asignación docente por oferta', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_asignacion', '/institucional/horarios/asignacion-docente', 1, NOW(), NOW()),
('institucional.horarios.color-docente', 'Horarios: color del docente', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_asignacion', '/institucional/horarios/asignacion-docente', 1, NOW(), NOW()),
('institucional.horarios.carga-docente', 'Horarios: carga horaria de docentes', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_carga', '/institucional/horarios/carga-docentes', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo INST
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'institucional.gestion.actual' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'institucional.gestion.actual', 'EDITAR'
  UNION ALL SELECT 'institucional.gestion.cronograma', 'LISTAR'
  UNION ALL SELECT 'institucional.gestion.cronograma', 'CREAR'
  UNION ALL SELECT 'institucional.gestion.cronograma', 'EDITAR'
  UNION ALL SELECT 'institucional.gestion.cronograma', 'ELIMINAR'
  UNION ALL SELECT 'institucional.gestion.cronograma', 'DETALLE'
  UNION ALL SELECT 'institucional.gestion.oferta', 'LISTAR'
  UNION ALL SELECT 'institucional.gestion.oferta', 'CREAR'
  UNION ALL SELECT 'institucional.gestion.oferta', 'EDITAR'
  UNION ALL SELECT 'institucional.gestion.horarios', 'LISTAR'
  UNION ALL SELECT 'institucional.gestion.horarios', 'CREAR'
  UNION ALL SELECT 'institucional.gestion.horarios', 'EDITAR'
  UNION ALL SELECT 'institucional.gestion.horarios', 'ELIMINAR'
  UNION ALL SELECT 'institucional.oferta.gestionar', 'CREAR'
  UNION ALL SELECT 'institucional.oferta.gestionar', 'EDITAR'
  UNION ALL SELECT 'institucional.horario.asignar', 'CREAR'
  UNION ALL SELECT 'institucional.gestion.pasadas', 'LISTAR'
  UNION ALL SELECT 'institucional.horario.plantilla', 'LISTAR'
  UNION ALL SELECT 'institucional.horario.plantilla', 'CREAR'
  UNION ALL SELECT 'institucional.horario.plantilla', 'EDITAR'
  UNION ALL SELECT 'institucional.horario.plantilla', 'ELIMINAR'
  UNION ALL SELECT 'institucional.horario.armado', 'LISTAR'
  UNION ALL SELECT 'institucional.horario.armado', 'EDITAR'
  UNION ALL SELECT 'institucional.horario.conflictos', 'LISTAR'
  UNION ALL SELECT 'institucional.horario.conflictos', 'EDITAR'
  UNION ALL SELECT 'institucional.horario.publicacion', 'LISTAR'
  UNION ALL SELECT 'institucional.horario.publicacion', 'EDITAR'
  UNION ALL SELECT 'institucional.oferta.gestion-plan', 'LISTAR'
  UNION ALL SELECT 'institucional.oferta.gestion-plan', 'DETALLE'
  UNION ALL SELECT 'institucional.oferta.gestion-plan', 'CREAR'
  UNION ALL SELECT 'institucional.oferta.gestion-plan', 'EDITAR'
  UNION ALL SELECT 'institucional.oferta.gestion-plan', 'ELIMINAR'
  UNION ALL SELECT 'institucional.oferta.gestion-plan', 'ACTIVAR'
  UNION ALL SELECT 'institucional.oferta.paralelo-gestion', 'LISTAR'
  UNION ALL SELECT 'institucional.oferta.paralelo-gestion', 'DETALLE'
  UNION ALL SELECT 'institucional.oferta.paralelo-gestion', 'CREAR'
  UNION ALL SELECT 'institucional.oferta.paralelo-gestion', 'EDITAR'
  UNION ALL SELECT 'institucional.oferta.paralelo-gestion', 'ELIMINAR'
  UNION ALL SELECT 'institucional.oferta.paralelo-gestion', 'ACTIVAR'
  UNION ALL SELECT 'institucional.oferta.cursos', 'LISTAR'
  UNION ALL SELECT 'institucional.oferta.cursos', 'DETALLE'
  UNION ALL SELECT 'institucional.oferta.cursos', 'CREAR'
  UNION ALL SELECT 'institucional.oferta.cursos', 'EDITAR'
  UNION ALL SELECT 'institucional.oferta.cursos', 'ELIMINAR'
  UNION ALL SELECT 'institucional.oferta.cursos', 'ACTIVAR'
  UNION ALL SELECT 'institucional.horarios.asignacion-docente', 'LISTAR'
  UNION ALL SELECT 'institucional.horarios.asignacion-docente', 'DETALLE'
  UNION ALL SELECT 'institucional.horarios.asignacion-docente', 'CREAR'
  UNION ALL SELECT 'institucional.horarios.asignacion-docente', 'EDITAR'
  UNION ALL SELECT 'institucional.horarios.asignacion-docente', 'ELIMINAR'
  UNION ALL SELECT 'institucional.horarios.color-docente', 'LISTAR'
  UNION ALL SELECT 'institucional.horarios.color-docente', 'EDITAR'
  UNION ALL SELECT 'institucional.horarios.carga-docente', 'LISTAR'
  UNION ALL SELECT 'institucional.horarios.carga-docente', 'DETALLE'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo INST (roles 2-8; ADMIN_SISTEMA hereda por vista)
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  SELECT 'RECTOR' AS rol, 'institucional.gestion.actual' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.actual', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.actual', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.actual', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.actual', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.actual', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.cronograma', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.cronograma', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.cronograma', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.cronograma', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.cronograma', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.cronograma', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.cronograma', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.cronograma', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.cronograma', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.cronograma', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.cronograma', 'ELIMINAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.cronograma', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.cronograma', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.cronograma', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.cronograma', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.oferta', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.oferta', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.oferta', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.oferta', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.oferta', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.oferta', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.oferta', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.oferta', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.oferta', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.horarios', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.horarios', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.horarios', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.horarios', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.horarios', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.horarios', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.horarios', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.horarios', 'ELIMINAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.horarios', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.horarios', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.horarios', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.horarios', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'institucional.oferta.gestionar', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'institucional.oferta.gestionar', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.oferta.gestionar', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.oferta.gestionar', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.oferta.gestionar', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.oferta.gestionar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horario.asignar', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.horario.asignar', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horario.asignar', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'institucional.gestion.pasadas', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.gestion.pasadas', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.gestion.pasadas', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horario.armado', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horario.armado', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horario.armado', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horario.armado', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.horario.armado', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.horario.armado', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.horario.armado', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.horario.armado', 'ELIMINAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horario.armado', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horario.armado', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horario.armado', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horario.armado', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horario.conflictos', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horario.conflictos', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.horario.conflictos', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.horario.conflictos', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horario.conflictos', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horario.conflictos', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horario.publicacion', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horario.publicacion', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.horario.publicacion', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.horario.publicacion', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horario.publicacion', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horario.publicacion', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'institucional.oferta.gestion-plan', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.oferta.gestion-plan', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.oferta.gestion-plan', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.oferta.gestion-plan', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.oferta.gestion-plan', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.oferta.gestion-plan', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.oferta.gestion-plan', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.oferta.gestion-plan', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.oferta.paralelo-gestion', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.oferta.paralelo-gestion', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.oferta.paralelo-gestion', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.oferta.paralelo-gestion', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.oferta.paralelo-gestion', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.oferta.paralelo-gestion', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.oferta.paralelo-gestion', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.oferta.paralelo-gestion', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.oferta.cursos', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.oferta.cursos', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.oferta.cursos', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.oferta.cursos', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.oferta.cursos', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.oferta.cursos', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.oferta.cursos', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.oferta.cursos', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horarios.asignacion-docente', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horarios.asignacion-docente', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.horarios.asignacion-docente', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'institucional.horarios.asignacion-docente', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.horarios.asignacion-docente', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.horarios.asignacion-docente', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horarios.asignacion-docente', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horarios.asignacion-docente', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horarios.color-docente', 'CREAR'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.horarios.color-docente', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horarios.color-docente', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horarios.carga-docente', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horarios.carga-docente', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'institucional.horarios.carga-docente', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horarios.carga-docente', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'institucional.horarios.carga-docente', 'ACTIVAR'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.horarios.carga-docente', 'LISTAR'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.horarios.carga-docente', 'DETALLE'
  UNION ALL SELECT 'DIR_ADMIN', 'institucional.horarios.carga-docente', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horarios.carga-docente', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horarios.carga-docente', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horarios.carga-docente', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horarios.carga-docente', 'ELIMINAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'institucional.horarios.carga-docente', 'ACTIVAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

SET FOREIGN_KEY_CHECKS = 1;
