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
-- Supervisión docente (2026-07-30, Fase 3): rediseño contra el schema 27
-- fichas_seguimiento_clase. Los 5 códigos legacy (evaluar/reporte/programar/
-- ficha.crear/ficha.editar) se ELIMINAN — nunca tuvieron pantalla ni backend.
-- Permiso ÚNICO por ítem de menú: docentes.supervision.ficha. Sin ELIMINAR ni
-- APROBAR: la ficha realizada no se borra (soft-delete solo por vía técnica).
('docentes.supervision.ficha', 'Supervisión: fichas de seguimiento en clase', NULL, 'DOCENTES', 'DOC', 'doc_supervision', '/docentes/supervision', 1, NOW(), NOW()),
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
  UNION ALL SELECT 'docentes.supervision.ficha', 'LISTAR'
  UNION ALL SELECT 'docentes.supervision.ficha', 'DETALLE'
  UNION ALL SELECT 'docentes.supervision.ficha', 'CREAR'
  UNION ALL SELECT 'docentes.supervision.ficha', 'EDITAR'
  UNION ALL SELECT 'docentes.supervision.ficha', 'EXPORTAR'
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
  -- Supervisión docente: operan Dirección Académica y Rectorado (la ficha real
  -- lleva firma/sello de la Dirección Académica). ADMIN_SISTEMA hereda por
  -- vista. DOCENTE: SIN filas — ve solo SUS fichas por el wrapper self
  -- GET /supervision-docente/mis-fichas (resolveDocenteIdForUsuario, anti-IDOR).
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.ficha', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.ficha', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.ficha', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.ficha', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.supervision.ficha', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.ficha', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.ficha', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.ficha', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.ficha', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'docentes.supervision.ficha', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'docentes.editar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'docentes.editar', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.editar', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'docentes.editar', 'ELIMINAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

-- Licencias docentes: ELIMINADAS del alcance (2026-10). Se retiraron los permisos
-- docentes.licencia.{ver,crear,aprobar} y el grupo doc_licencias (no existe la
-- tabla licencias_docentes). Las licencias de ESTUDIANTES (academico.asistencia.
-- licencia.*) no cambian. Pasantías docentes: ver Titulación (TUT).

SET FOREIGN_KEY_CHECKS = 1;
