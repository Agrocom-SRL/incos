-- ============================================
-- SEEDER permisos · módulo Académico (incluye Asistencia) (ACA)
-- Sin ids: id por AUTO_INCREMENT; tablas hijas referencian por CÓDIGO.
-- Orden: roles (55) → usuarios-admin (56) → permisos+acciones+roles por módulo (57-64).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- 0) Nombres amigables de los grupos de UI (grilla de Seguridad)
INSERT INTO grupos_ui (codigo, nombre, dominio, orden, activo, created_at, updated_at) VALUES
('aca_cal_ingreso', 'Calificaciones · menú', 'ACADEMICO', 1, 1, NOW(), NOW()),
('aca_cal_coordinacion', 'Calificaciones · coordinación', 'ACADEMICO', 2, 1, NOW(), NOW()),
('aca_cal_mis_cursos', 'Calificaciones · mis cursos', 'ACADEMICO', 3, 1, NOW(), NOW()),
('aca_cal_cuaderno', 'Calificaciones · cuaderno', 'ACADEMICO', 4, 1, NOW(), NOW()),
('aca_cal_cuaderno_evals', 'Calificaciones · cuaderno · evaluaciones', 'ACADEMICO', 5, 1, NOW(), NOW()),
('aca_cal_cuaderno_notas', 'Calificaciones · cuaderno · notas', 'ACADEMICO', 6, 1, NOW(), NOW()),
('aca_cal_cuaderno_guardar', 'Calificaciones · cuaderno · guardar bimestre', 'ACADEMICO', 7, 1, NOW(), NOW()),
('aca_cal_gestion_anual', 'Calificaciones · gestión anual', 'ACADEMICO', 8, 1, NOW(), NOW()),
('aca_cal_politica', 'Calificaciones · política institucional', 'ACADEMICO', 9, 1, NOW(), NOW()),
('aca_cal_bim_ajuste_admin', 'Calificaciones · bimestre cerrado · ajuste administrativo', 'ACADEMICO', 10, 1, NOW(), NOW()),
('aca_asi_registro', 'Asistencia · registro diario', 'ACADEMICO', 11, 1, NOW(), NOW()),
('aca_asi_cnd', 'Asistencia · clases no dictadas', 'ACADEMICO', 12, 1, NOW(), NOW()),
('aca_asi_consolidado', 'Asistencia · consolidado %', 'ACADEMICO', 13, 1, NOW(), NOW()),
('aca_asi_licencias', 'Asistencia · licencias estudiantiles', 'ACADEMICO', 14, 1, NOW(), NOW()),
('aca_nivelaciones', 'Nivelaciones', 'ACADEMICO', 15, 1, NOW(), NOW()),
('aca_traspasos', 'Traspasos', 'ACADEMICO', 16, 1, NOW(), NOW()),
('aca_transitabilidad', 'Transitabilidad', 'ACADEMICO', 17, 1, NOW(), NOW()),
('aca_historial', 'Historial', 'ACADEMICO', 18, 1, NOW(), NOW()),
('aca_avance', 'Avance académico', 'ACADEMICO', 19, 1, NOW(), NOW());

-- 1) Permisos del módulo ACA
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('academico.calificacion.ingreso', 'Calificaciones · menú Académico', NULL, 'ACADEMICO', 'ACA', 'aca_cal_ingreso', '/academico/calificaciones', 1, NOW(), NOW()),
('academico.calificacion.coordinacion', 'Calificaciones · coordinación docentes', NULL, 'ACADEMICO', 'ACA', 'aca_cal_coordinacion', '/academico/calificaciones', 1, NOW(), NOW()),
('academico.calificacion.mis_cursos', 'Calificaciones · mis cursos', NULL, 'ACADEMICO', 'ACA', 'aca_cal_mis_cursos', '/academico/calificaciones/mis-cursos', 1, NOW(), NOW()),
('academico.calificacion.cuaderno', 'Calificaciones · cuaderno y registro de notas', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno', '/academico/calificaciones/mis-cursos/:asignacionId', 1, NOW(), NOW()),
('academico.calificacion.politica', 'Calificaciones · política institucional', NULL, 'ACADEMICO', 'ACA', 'aca_cal_politica', '/academico/calificaciones/politica', 1, NOW(), NOW()),
('academico.calificacion.gestion_bimestres', 'Calificaciones · gestión de bimestres', NULL, 'ACADEMICO', 'ACA', 'aca_cal_gestion_anual', '/academico/calificaciones/gestion-bimestres', 1, NOW(), NOW()),
('academico.calificacion.cuaderno.evaluaciones', 'Calificaciones · cuaderno · gestionar evaluaciones', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno_evals', '/academico/calificaciones/mis-cursos/:asignacionId/cuaderno/:n', 1, NOW(), NOW()),
('academico.calificacion.cuaderno.notas', 'Calificaciones · cuaderno · registrar/modificar notas', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno_notas', '/academico/calificaciones/mis-cursos/:asignacionId/cuaderno/:n', 1, NOW(), NOW()),
('academico.calificacion.cuaderno.guardar', 'Calificaciones · cuaderno · guardar y recalcular bimestre', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno_guardar', '/academico/calificaciones/mis-cursos/:asignacionId/cuaderno/:n', 1, NOW(), NOW()),
('academico.calificacion.bimestre.ajuste_admin', 'Calificaciones · bimestre cerrado · ajuste administrativo', NULL, 'ACADEMICO', 'ACA', 'aca_cal_bim_ajuste_admin', '/academico/calificaciones/mis-cursos/:asignacionId/bimestre/:n/consolidado', 1, NOW(), NOW()),
('academico.nivelacion.ver', 'Nivelaciones: listar y ver', NULL, 'ACADEMICO', 'ACA', 'aca_nivelaciones', '/academico/nivelaciones/listar', 1, NOW(), NOW()),
('academico.nivelacion.inscribir', 'Nivelaciones: inscribir estudiante', NULL, 'ACADEMICO', 'ACA', 'aca_nivelaciones', '/academico/nivelaciones/listar', 1, NOW(), NOW()),
('academico.nivelacion.aprobar', 'Nivelaciones: aprobar', NULL, 'ACADEMICO', 'ACA', 'aca_nivelaciones', '/academico/nivelaciones/listar', 1, NOW(), NOW()),
('academico.trazabilidad.traspaso.ver', 'Traspasos: listar y ver', NULL, 'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', 1, NOW(), NOW()),
('academico.trazabilidad.traspaso.solicitar', 'Traspasos: solicitar (salida)', NULL, 'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', 1, NOW(), NOW()),
('academico.trazabilidad.traspaso.recibir', 'Traspasos: recibir (entrada)', NULL, 'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', 1, NOW(), NOW()),
('academico.trazabilidad.traspaso.convalidar', 'Traspasos: convalidar notas', NULL, 'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', 1, NOW(), NOW()),
('academico.trazabilidad.traspaso.aprobar', 'Traspasos: aprobar', NULL, 'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', 1, NOW(), NOW()),
('academico.trazabilidad.transitabilidad.ver', 'Transitabilidad: listar y ver', NULL, 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', 1, NOW(), NOW()),
('academico.trazabilidad.transitabilidad.solicitar', 'Transitabilidad: solicitar', NULL, 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', 1, NOW(), NOW()),
('academico.trazabilidad.transitabilidad.recibir', 'Transitabilidad: recibir', NULL, 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', 1, NOW(), NOW()),
('academico.trazabilidad.transitabilidad.convalidar', 'Transitabilidad: convalidar notas', NULL, 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', 1, NOW(), NOW()),
('academico.trazabilidad.transitabilidad.aprobar', 'Transitabilidad: aprobar', NULL, 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', 1, NOW(), NOW()),
('academico.historial.folio', 'Historial: gestionar folio del egresado', NULL, 'ACADEMICO', 'ACA', 'aca_historial', '/academico/historial/academico', 1, NOW(), NOW()),
('academico.historial.academico', 'Historial: ver historial académico del alumno', NULL, 'ACADEMICO', 'ACA', 'aca_historial', '/academico/historial/academico', 1, NOW(), NOW()),
('academico.historial.validar', 'Historial: validar para egreso', NULL, 'ACADEMICO', 'ACA', 'aca_historial', '/academico/historial/academico', 1, NOW(), NOW()),
('academico.avance', 'Avance académico: ver progreso del estudiante en su carrera', NULL, 'ACADEMICO', 'ACA', 'aca_avance', '/academico/avance', 1, NOW(), NOW()),
('academico.asistencia.licencia.ver', 'Asistencia · Licencias estudiantiles: listar y ver', NULL, 'ACADEMICO', 'ACA', 'aca_asi_licencias', '/academico/asistencia/licencias/listar', 1, NOW(), NOW()),
('academico.asistencia.licencia.crear', 'Asistencia · Licencias estudiantiles: solicitar', NULL, 'ACADEMICO', 'ACA', 'aca_asi_licencias', '/academico/asistencia/licencias/listar', 1, NOW(), NOW()),
('academico.asistencia.licencia.aprobar', 'Asistencia · Licencias estudiantiles: aprobar', NULL, 'ACADEMICO', 'ACA', 'aca_asi_licencias', '/academico/asistencia/licencias/listar', 1, NOW(), NOW()),
('academico.asistencia.registro.ver', 'Asistencia · Registro diario: mis cursos', NULL, 'ACADEMICO', 'ACA', 'aca_asi_registro', '/academico/asistencia', 1, NOW(), NOW()),
('academico.asistencia.registro.coordinacion', 'Asistencia · Registro diario: coordinación (elegir docente)', NULL, 'ACADEMICO', 'ACA', 'aca_asi_registro', '/academico/asistencia', 1, NOW(), NOW()),
('academico.asistencia.registro.cuaderno', 'Asistencia · Planilla diaria del curso', NULL, 'ACADEMICO', 'ACA', 'aca_asi_registro', '/academico/asistencia/mis-cursos', 1, NOW(), NOW()),
('academico.asistencia.clase_no_dictada.ver', 'Asistencia · Clases no dictadas', NULL, 'ACADEMICO', 'ACA', 'aca_asi_cnd', '/academico/asistencia/clases-no-dictadas', 1, NOW(), NOW()),
('academico.asistencia.consolidado.ver', 'Asistencia · Consolidado %', NULL, 'ACADEMICO', 'ACA', 'aca_asi_consolidado', '/academico/asistencia/consolidado', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo ACA
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'academico.calificacion.ingreso' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'academico.calificacion.coordinacion', 'LISTAR'
  UNION ALL SELECT 'academico.calificacion.mis_cursos', 'LISTAR'
  UNION ALL SELECT 'academico.calificacion.mis_cursos', 'DETALLE'
  UNION ALL SELECT 'academico.calificacion.cuaderno', 'LISTAR'
  UNION ALL SELECT 'academico.calificacion.cuaderno', 'EXPORTAR'
  UNION ALL SELECT 'academico.calificacion.cuaderno', 'GENERAR_PDF'
  UNION ALL SELECT 'academico.calificacion.politica', 'LISTAR'
  UNION ALL SELECT 'academico.calificacion.politica', 'EDITAR'
  UNION ALL SELECT 'academico.calificacion.gestion_bimestres', 'LISTAR'
  UNION ALL SELECT 'academico.calificacion.gestion_bimestres', 'EDITAR'
  UNION ALL SELECT 'academico.calificacion.cuaderno.evaluaciones', 'CREAR'
  UNION ALL SELECT 'academico.calificacion.cuaderno.evaluaciones', 'EDITAR'
  UNION ALL SELECT 'academico.calificacion.cuaderno.evaluaciones', 'ELIMINAR'
  UNION ALL SELECT 'academico.calificacion.cuaderno.notas', 'EDITAR'
  UNION ALL SELECT 'academico.calificacion.cuaderno.guardar', 'EDITAR'
  UNION ALL SELECT 'academico.calificacion.bimestre.ajuste_admin', 'EDITAR'
  UNION ALL SELECT 'academico.nivelacion.ver', 'LISTAR'
  UNION ALL SELECT 'academico.nivelacion.ver', 'DETALLE'
  UNION ALL SELECT 'academico.nivelacion.inscribir', 'CREAR'
  UNION ALL SELECT 'academico.nivelacion.aprobar', 'APROBAR'
  UNION ALL SELECT 'academico.trazabilidad.traspaso.ver', 'LISTAR'
  UNION ALL SELECT 'academico.trazabilidad.traspaso.ver', 'DETALLE'
  UNION ALL SELECT 'academico.trazabilidad.traspaso.solicitar', 'CREAR'
  UNION ALL SELECT 'academico.trazabilidad.traspaso.recibir', 'CREAR'
  UNION ALL SELECT 'academico.trazabilidad.traspaso.convalidar', 'EDITAR'
  UNION ALL SELECT 'academico.trazabilidad.traspaso.aprobar', 'APROBAR'
  UNION ALL SELECT 'academico.trazabilidad.transitabilidad.ver', 'LISTAR'
  UNION ALL SELECT 'academico.trazabilidad.transitabilidad.ver', 'DETALLE'
  UNION ALL SELECT 'academico.trazabilidad.transitabilidad.solicitar', 'CREAR'
  UNION ALL SELECT 'academico.trazabilidad.transitabilidad.recibir', 'CREAR'
  UNION ALL SELECT 'academico.trazabilidad.transitabilidad.convalidar', 'EDITAR'
  UNION ALL SELECT 'academico.trazabilidad.transitabilidad.aprobar', 'APROBAR'
  UNION ALL SELECT 'academico.historial.folio', 'CREAR'
  UNION ALL SELECT 'academico.historial.folio', 'EDITAR'
  UNION ALL SELECT 'academico.historial.folio', 'GENERAR_PDF'
  UNION ALL SELECT 'academico.historial.academico', 'LISTAR'
  UNION ALL SELECT 'academico.historial.academico', 'DETALLE'
  UNION ALL SELECT 'academico.historial.academico', 'EXPORTAR'
  UNION ALL SELECT 'academico.historial.validar', 'APROBAR'
  UNION ALL SELECT 'academico.avance', 'LISTAR'
  UNION ALL SELECT 'academico.avance', 'EXPORTAR'
  UNION ALL SELECT 'academico.asistencia.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'academico.asistencia.licencia.ver', 'DETALLE'
  UNION ALL SELECT 'academico.asistencia.licencia.crear', 'CREAR'
  UNION ALL SELECT 'academico.asistencia.licencia.aprobar', 'APROBAR'
  UNION ALL SELECT 'academico.asistencia.registro.ver', 'LISTAR'
  UNION ALL SELECT 'academico.asistencia.registro.ver', 'DETALLE'
  UNION ALL SELECT 'academico.asistencia.registro.coordinacion', 'LISTAR'
  UNION ALL SELECT 'academico.asistencia.registro.cuaderno', 'LISTAR'
  UNION ALL SELECT 'academico.asistencia.registro.cuaderno', 'EDITAR'
  UNION ALL SELECT 'academico.asistencia.clase_no_dictada.ver', 'LISTAR'
  UNION ALL SELECT 'academico.asistencia.clase_no_dictada.ver', 'CREAR'
  UNION ALL SELECT 'academico.asistencia.clase_no_dictada.ver', 'EDITAR'
  UNION ALL SELECT 'academico.asistencia.consolidado.ver', 'LISTAR'
  UNION ALL SELECT 'academico.asistencia.consolidado.ver', 'EXPORTAR'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo ACA (roles 2-8; ADMIN_SISTEMA hereda por vista)
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  SELECT 'RECTOR' AS rol, 'academico.calificacion.ingreso' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.ingreso', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.ingreso', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'academico.calificacion.ingreso', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.coordinacion', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.coordinacion', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.mis_cursos', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.mis_cursos', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.mis_cursos', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.mis_cursos', 'DETALLE'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.mis_cursos', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.mis_cursos', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.cuaderno', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.cuaderno', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.cuaderno', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.cuaderno', 'EXPORTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.cuaderno', 'GENERAR_PDF'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.politica', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.politica', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.politica', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.politica', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.gestion_bimestres', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.gestion_bimestres', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.gestion_bimestres', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.gestion_bimestres', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.cuaderno.evaluaciones', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.cuaderno.evaluaciones', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.cuaderno.evaluaciones', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.cuaderno.evaluaciones', 'EDITAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.cuaderno.evaluaciones', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.cuaderno.notas', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.cuaderno.notas', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.cuaderno.notas', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.cuaderno.guardar', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.cuaderno.guardar', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.cuaderno.guardar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.bimestre.ajuste_admin', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.bimestre.ajuste_admin', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.nivelacion.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.nivelacion.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.nivelacion.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.nivelacion.ver', 'DETALLE'
  UNION ALL SELECT 'ESTUDIANTE', 'academico.nivelacion.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.nivelacion.inscribir', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.nivelacion.inscribir', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'academico.nivelacion.aprobar', 'APROBAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.nivelacion.aprobar', 'APROBAR'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.traspaso.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.traspaso.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.traspaso.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.traspaso.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.traspaso.solicitar', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.traspaso.solicitar', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.traspaso.recibir', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.traspaso.recibir', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.traspaso.convalidar', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.traspaso.convalidar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.traspaso.aprobar', 'APROBAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.traspaso.aprobar', 'APROBAR'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.transitabilidad.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.transitabilidad.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.transitabilidad.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.transitabilidad.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.transitabilidad.solicitar', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.transitabilidad.solicitar', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.transitabilidad.recibir', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.transitabilidad.recibir', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.transitabilidad.convalidar', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.transitabilidad.convalidar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.trazabilidad.transitabilidad.aprobar', 'APROBAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.trazabilidad.transitabilidad.aprobar', 'APROBAR'
  UNION ALL SELECT 'RECTOR', 'academico.historial.folio', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'academico.historial.folio', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.historial.folio', 'GENERAR_PDF'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.historial.folio', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.historial.folio', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.historial.folio', 'GENERAR_PDF'
  UNION ALL SELECT 'RECTOR', 'academico.historial.academico', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.historial.academico', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.historial.academico', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.historial.academico', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.historial.academico', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.historial.academico', 'EXPORTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.historial.academico', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'academico.historial.academico', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'academico.historial.academico', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.historial.validar', 'APROBAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.historial.validar', 'APROBAR'
  UNION ALL SELECT 'RECTOR', 'academico.avance', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.avance', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.avance', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.avance', 'EXPORTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.avance', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'academico.avance', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.licencia.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.licencia.ver', 'DETALLE'
  UNION ALL SELECT 'ESTUDIANTE', 'academico.asistencia.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.licencia.crear', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.licencia.crear', 'CREAR'
  UNION ALL SELECT 'ESTUDIANTE', 'academico.asistencia.licencia.crear', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.licencia.aprobar', 'APROBAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.licencia.aprobar', 'APROBAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.registro.ver', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.registro.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.registro.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.registro.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.registro.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.registro.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.registro.coordinacion', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.registro.coordinacion', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.registro.cuaderno', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.registro.cuaderno', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.registro.cuaderno', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.registro.cuaderno', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.clase_no_dictada.ver', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.clase_no_dictada.ver', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.clase_no_dictada.ver', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.clase_no_dictada.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.clase_no_dictada.ver', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.clase_no_dictada.ver', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.clase_no_dictada.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.clase_no_dictada.ver', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.clase_no_dictada.ver', 'EDITAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.consolidado.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.consolidado.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.consolidado.ver', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.consolidado.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.consolidado.ver', 'EXPORTAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

SET FOREIGN_KEY_CHECKS = 1;
