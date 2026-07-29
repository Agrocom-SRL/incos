-- ============================================
-- SEEDER permisos · módulo Docentes (DOC)
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-64).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('doc_docentes', 'Docentes', 'DOCENTES', 1, 1, NOW(), NOW()),
('doc_licencias', 'Licencias docentes', 'DOCENTES', 2, 1, NOW(), NOW()),
('doc_supervision', 'Supervisión', 'DOCENTES', 3, 1, NOW(), NOW());
-- Pasantías docentes: retiradas 2026-07-29. Eran códigos anteriores al schema
-- 24; las pasantías (estudiantiles) pasan al módulo Titulación (TUT) y lo
-- docente entra por wrappers del portal, sin permisos propios
-- (ver docs/plan/titulacion-y-dominios-pendientes.md).

-- 1) Permisos del módulo DOC
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('docentes.ver', 'Docentes: listar y ver ficha', NULL, 'DOCENTES', 'DOC', 'doc_docentes', '/docentes/listar', 1, NOW(), NOW()),
('docentes.crear', 'Docentes: registrar nuevo docente', NULL, 'DOCENTES', 'DOC', 'doc_docentes', '/docentes/listar', 1, NOW(), NOW()),
('docentes.asignar', 'Docentes: asignar a oferta académica', NULL, 'DOCENTES', 'DOC', 'doc_docentes', '/docentes/listar', 1, NOW(), NOW()),
('docentes.licencia.ver', 'Licencias docentes: listar y ver', NULL, 'DOCENTES', 'DOC', 'doc_licencias', '/docentes/licencias/listar', 1, NOW(), NOW()),
('docentes.licencia.crear', 'Licencias docentes: solicitar', NULL, 'DOCENTES', 'DOC', 'doc_licencias', '/docentes/licencias/listar', 1, NOW(), NOW()),
('docentes.licencia.aprobar', 'Licencias docentes: aprobar', NULL, 'DOCENTES', 'DOC', 'doc_licencias', '/docentes/licencias/listar', 1, NOW(), NOW()),
('docentes.supervision.evaluar', 'Supervisión: evaluar docente', NULL, 'DOCENTES', 'DOC', 'doc_supervision', '/supervision', 1, NOW(), NOW()),
('docentes.supervision.reporte', 'Supervisión: ver reportes', NULL, 'DOCENTES', 'DOC', 'doc_supervision', '/supervision', 1, NOW(), NOW()),
('docentes.supervision.programar', 'Supervisión: programar sesión', NULL, 'DOCENTES', 'DOC', 'doc_supervision', '/supervision', 1, NOW(), NOW()),
('docentes.supervision.ficha.crear', 'Supervisión: crear ficha de evaluación', NULL, 'DOCENTES', 'DOC', 'doc_supervision', '/supervision', 1, NOW(), NOW()),
('docentes.supervision.ficha.editar', 'Supervisión: editar ficha de evaluación', NULL, 'DOCENTES', 'DOC', 'doc_supervision', '/supervision', 1, NOW(), NOW()),
('docentes.editar', 'Docentes: editar ficha y eliminar o desactivar registro', NULL, 'DOCENTES', 'DOC', 'doc_docentes', '/docentes/listar', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo DOC
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'docentes.ver' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'docentes.ver', 'DETALLE'
  UNION ALL SELECT 'docentes.ver', 'EXPORTAR'
  UNION ALL SELECT 'docentes.crear', 'CREAR'
  UNION ALL SELECT 'docentes.asignar', 'CREAR'
  UNION ALL SELECT 'docentes.asignar', 'EDITAR'
  UNION ALL SELECT 'docentes.asignar', 'ELIMINAR'
  UNION ALL SELECT 'docentes.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'docentes.licencia.ver', 'DETALLE'
  UNION ALL SELECT 'docentes.licencia.crear', 'CREAR'
  UNION ALL SELECT 'docentes.licencia.aprobar', 'APROBAR'
  UNION ALL SELECT 'docentes.supervision.evaluar', 'LISTAR'
  UNION ALL SELECT 'docentes.supervision.evaluar', 'DETALLE'
  UNION ALL SELECT 'docentes.supervision.evaluar', 'EDITAR'
  UNION ALL SELECT 'docentes.supervision.reporte', 'LISTAR'
  UNION ALL SELECT 'docentes.supervision.reporte', 'EXPORTAR'
  UNION ALL SELECT 'docentes.supervision.programar', 'CREAR'
  UNION ALL SELECT 'docentes.supervision.ficha.crear', 'CREAR'
  UNION ALL SELECT 'docentes.supervision.ficha.editar', 'EDITAR'
  UNION ALL SELECT 'docentes.editar', 'EDITAR'
  UNION ALL SELECT 'docentes.editar', 'ELIMINAR'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo DOC (roles 2-8; ADMIN_SISTEMA hereda por vista)
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  SELECT 'RECTOR' AS rol, 'docentes.ver' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'RECTOR', 'docentes.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'docentes.ver', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.ver', 'EXPORTAR'
  -- DOCENTE (2026-07-03): portal docente — el ítem Docentes salta a SU propia ficha
  -- vía wrapper; anti-IDOR docenteSelfOnlyGuard en servidor (GET /docentes/:id solo
  -- acepta el id propio del docente de la sesión; staff sin restricción).
  -- La ficha DocentesDetail solo consume GET /docentes/:id (DETALLE); sin escritura.
  UNION ALL SELECT 'DOCENTE', 'docentes.ver', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'docentes.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'docentes.crear', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.crear', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'docentes.asignar', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'docentes.asignar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'docentes.asignar', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.asignar', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.asignar', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.asignar', 'ELIMINAR'
  -- DIR_ADMIN (2026-07-14): paridad con RECTOR/DIR_ACADEMICO para operar
  -- asignación docente/color/carga desde Institucional → Oferta (fallback real
  -- de institucional.horarios.asignacion-docente y color-docente en backend).
  UNION ALL SELECT 'DIR_ADMIN', 'docentes.asignar', 'CREAR'
  UNION ALL SELECT 'DIR_ADMIN', 'docentes.asignar', 'EDITAR'
  UNION ALL SELECT 'DIR_ADMIN', 'docentes.asignar', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'docentes.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'docentes.licencia.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.licencia.ver', 'DETALLE'
  UNION ALL SELECT 'DOCENTE', 'docentes.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'docentes.licencia.crear', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.licencia.crear', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'docentes.licencia.crear', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'docentes.licencia.aprobar', 'APROBAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.licencia.aprobar', 'APROBAR'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.evaluar', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.evaluar', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.evaluar', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.evaluar', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.evaluar', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.evaluar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.reporte', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.reporte', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.reporte', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.reporte', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.programar', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.programar', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.ficha.crear', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.ficha.crear', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.ficha.editar', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.ficha.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'docentes.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'docentes.editar', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.editar', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.editar', 'ELIMINAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

-- ============================================================
-- DESHABILITACIÓN TEMPORAL · páginas aún no construidas (2026-06-24)
-- Licencias docentes y Supervisión: se ocultan hasta que las pantallas
-- existan. (El listado/ficha de Docentes SÍ está construido y permanece
-- activo. Pasantías docentes eliminadas del seed 2026-07-29 — el dominio
-- pasantías vive en Titulación/TUT; la supervisión se rediseñará contra el
-- schema 27 fichas_seguimiento_clase en su fase.)
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
  -- Licencias docentes
  'docentes.licencia.ver',
  'docentes.licencia.crear',
  'docentes.licencia.aprobar',
  -- Supervisión
  'docentes.supervision.evaluar',
  'docentes.supervision.reporte',
  'docentes.supervision.programar',
  'docentes.supervision.ficha.crear',
  'docentes.supervision.ficha.editar'
);

-- 2) Cascada: acciones de esos permisos
UPDATE permiso_acciones pa
JOIN permisos p ON p.id = pa.permiso_id
SET pa.activo = 0, pa.deleted_at = @fecha_baja
WHERE p.modulo = 'DOC' AND p.deleted_at IS NOT NULL;

-- 3) Cascada: asignaciones a roles de esos permisos
UPDATE roles_permisos rp
JOIN permisos p ON p.id = rp.permiso_id
SET rp.activo = 0, rp.deleted_at = @fecha_baja
WHERE p.modulo = 'DOC' AND p.deleted_at IS NOT NULL;

-- 4) Grupos de UI cuyas páginas quedan completamente ocultas
UPDATE grupos_ui
SET activo = 0, deleted_at = @fecha_baja
WHERE codigo IN ('doc_licencias', 'doc_supervision');

SET FOREIGN_KEY_CHECKS = 1;
