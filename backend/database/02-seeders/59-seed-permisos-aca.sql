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
('aca_cal_cuaderno', 'Calificaciones · cuaderno · ver y exportar', 'ACADEMICO', 4, 1, NOW(), NOW()),
('aca_cal_cuaderno_evals', 'Calificaciones · cuaderno · evaluaciones (crear, editar, eliminar)', 'ACADEMICO', 5, 1, NOW(), NOW()),
('aca_cal_cuaderno_notas', 'Calificaciones · cuaderno · registrar notas', 'ACADEMICO', 6, 1, NOW(), NOW()),
('aca_cal_cuaderno_guardar', 'Calificaciones · cuaderno · cierre de bimestre (guardar y recalcular)', 'ACADEMICO', 7, 1, NOW(), NOW()),
('aca_cal_gestion_anual', 'Calificaciones · gestión anual', 'ACADEMICO', 8, 1, NOW(), NOW()),
('aca_cal_politica', 'Calificaciones · política institucional', 'ACADEMICO', 9, 1, NOW(), NOW()),
('aca_cal_bim_ajuste_admin', 'Calificaciones · bimestre · reabrir o consolidar (administrativo)', 'ACADEMICO', 10, 1, NOW(), NOW()),
('aca_asi_registro', 'Asistencia · registro diario', 'ACADEMICO', 11, 1, NOW(), NOW()),
('aca_asi_cnd', 'Asistencia · clases no dictadas', 'ACADEMICO', 12, 1, NOW(), NOW()),
('aca_asi_consolidado', 'Asistencia · consolidado %', 'ACADEMICO', 13, 1, NOW(), NOW()),
('aca_asi_licencias', 'Asistencia · licencias estudiantiles', 'ACADEMICO', 14, 1, NOW(), NOW()),
('aca_nivelaciones', 'Nivelaciones', 'ACADEMICO', 15, 1, NOW(), NOW()),
('aca_traspasos', 'Traspasos', 'ACADEMICO', 16, 1, NOW(), NOW()),
('aca_transitabilidad', 'Transitabilidad', 'ACADEMICO', 17, 1, NOW(), NOW()),
('aca_historial', 'Historial', 'ACADEMICO', 18, 1, NOW(), NOW()),
-- 2026-08-01 (agrupación de menú «Seguimiento académico», ítem ACA-SEGUIMIENTO):
-- avance, deserción y acompañamiento dejaron de ser ítems de sidebar y viven
-- como pestañas de /academico/seguimiento (las URLs viejas quedan como rutas
-- gemelas). Grupos, códigos, acciones y roles se conservan TAL CUAL — cero
-- cambios funcionales de RBAC; solo se renombran los grupos para leerse como
-- pestañas del ítem en la grilla de Seguridad y se alinea su ruta_sidebar.
('aca_avance', 'Seguimiento académico · avance', 'ACADEMICO', 19, 1, NOW(), NOW()),
('aca_cal_centralizador', 'Centralizador de notas', 'ACADEMICO', 20, 1, NOW(), NOW()),
-- 2026-07-29 (disolución REP): la deserción vive en ACA (pestaña de la página
-- Avance académico) con permiso propio — roles más restringidos que el avance.
('aca_desercion', 'Seguimiento académico · deserción', 'ACADEMICO', 21, 1, NOW(), NOW()),
-- 2026-07-30 (Fase 4, schema 25): libros físicos del centralizador (LIBRO N° /
-- FOLIO N°), un libro por gestión (compartido por las 3 carreras) con folios
-- por paralelo.
('aca_libros', 'Libros de registro', 'ACADEMICO', 22, 1, NOW(), NOW()),
-- 2026-07-31: acompañamiento pedagógico (alertas de riesgo + sesiones de
-- refuerzo + panel) reclasificado desde el módulo Titulación/TUT — sus datos
-- se derivan de asignaciones_docentes/vistas del centralizador, sin FK a
-- proyectos_grado/modalidades_grado. Ver 65-seed-permisos-tit.sql (nota).
('aca_acompanamiento', 'Seguimiento académico · acompañamiento', 'ACADEMICO', 23, 1, NOW(), NOW());

-- 1) Permisos del módulo ACA
INSERT INTO permisos (codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at) VALUES
('academico.calificacion.ingreso', 'Calificaciones · menú Académico', NULL, 'ACADEMICO', 'ACA', 'aca_cal_ingreso', '/academico/calificaciones', 1, NOW(), NOW()),
('academico.calificacion.coordinacion', 'Calificaciones · coordinación docentes', NULL, 'ACADEMICO', 'ACA', 'aca_cal_coordinacion', '/academico/calificaciones', 1, NOW(), NOW()),
('academico.calificacion.centralizador', 'Centralizador y boletín de estudiantes', NULL, 'ACADEMICO', 'ACA', 'aca_cal_centralizador', '/academico/calificaciones/centralizador', 1, NOW(), NOW()),
('academico.calificacion.mis_cursos', 'Calificaciones · mis cursos', NULL, 'ACADEMICO', 'ACA', 'aca_cal_mis_cursos', '/academico/calificaciones/mis-cursos', 1, NOW(), NOW()),
('academico.calificacion.cuaderno', 'Calificaciones · cuaderno · ver y exportar', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno', '/academico/calificaciones/mis-cursos/:asignacionId', 1, NOW(), NOW()),
('academico.calificacion.politica', 'Calificaciones · política institucional', NULL, 'ACADEMICO', 'ACA', 'aca_cal_politica', '/academico/calificaciones/politica', 1, NOW(), NOW()),
('academico.calificacion.gestion_bimestres', 'Calificaciones · gestión de bimestres', NULL, 'ACADEMICO', 'ACA', 'aca_cal_gestion_anual', '/academico/calificaciones/gestion-bimestres', 1, NOW(), NOW()),
('academico.calificacion.cuaderno.evaluaciones', 'Calificaciones · cuaderno · evaluaciones (crear, editar, eliminar)', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno_evals', '/academico/calificaciones/mis-cursos/:asignacionId/cuaderno/:n', 1, NOW(), NOW()),
('academico.calificacion.cuaderno.notas', 'Calificaciones · cuaderno · registrar notas', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno_notas', '/academico/calificaciones/mis-cursos/:asignacionId/cuaderno/:n', 1, NOW(), NOW()),
('academico.calificacion.cuaderno.guardar', 'Calificaciones · cuaderno · cierre de bimestre (guardar y recalcular)', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno_guardar', '/academico/calificaciones/mis-cursos/:asignacionId/cuaderno/:n', 1, NOW(), NOW()),
('academico.calificacion.bimestre.ajuste_admin', 'Calificaciones · bimestre · reabrir o consolidar (administrativo)', NULL, 'ACADEMICO', 'ACA', 'aca_cal_bim_ajuste_admin', '/academico/calificaciones/mis-cursos/:asignacionId/bimestre/:n/consolidado', 1, NOW(), NOW()),
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
-- 2026-07-30 (Fase 4): retirados los códigos apagados `academico.historial.folio`
-- (folio del egresado, concepto anterior al schema 25 → reemplazado por
-- `academico.libro`) y `academico.historial.validar` (la validación de egreso
-- pasa a la Fase 5, `tutorias.titulo.*`).
('academico.historial.academico', 'Historial: ver historial académico del alumno', NULL, 'ACADEMICO', 'ACA', 'aca_historial', '/academico/historial/academico', 1, NOW(), NOW()),
-- Libros de registro del centralizador (Fase 4, schema 25): sin ELIMINAR — un
-- folio no se borra, se ANULA (transición de estado con EDITAR/APROBAR).
('academico.libro', 'Libros de registro del centralizador', NULL, 'ACADEMICO', 'ACA', 'aca_libros', '/academico/libros', 1, NOW(), NOW()),
-- 2026-08-01 (agrupación «Seguimiento académico»): ruta_sidebar apunta al
-- contenedor /academico/seguimiento (pestañas gateadas por permiso); la URL
-- gemela /academico/avance sigue viva con ?tab=avance|desercion.
('academico.avance', 'Avance académico: ver progreso del estudiante en su carrera', NULL, 'ACADEMICO', 'ACA', 'aca_avance', '/academico/seguimiento', 1, NOW(), NOW()),
-- 2026-07-29 (disolución REP): reemplaza a reportes.desercion. Pestaña "Deserción"
-- (PermisoGuard por pestaña); métrica ANUAL por estados ABANDONO/RETIRADO de
-- matriculas_materia (vistas 172/173).
('academico.desercion', 'Deserción estudiantil: métrica anual de abandono por carrera', NULL, 'ACADEMICO', 'ACA', 'aca_desercion', '/academico/seguimiento', 1, NOW(), NOW()),
('academico.asistencia.licencia.ver', 'Asistencia · Licencias estudiantiles: listar y ver', NULL, 'ACADEMICO', 'ACA', 'aca_asi_licencias', '/academico/asistencia/licencias/listar', 1, NOW(), NOW()),
('academico.asistencia.licencia.crear', 'Asistencia · Licencias estudiantiles: solicitar', NULL, 'ACADEMICO', 'ACA', 'aca_asi_licencias', '/academico/asistencia/licencias/listar', 1, NOW(), NOW()),
('academico.asistencia.licencia.aprobar', 'Asistencia · Licencias estudiantiles: aprobar', NULL, 'ACADEMICO', 'ACA', 'aca_asi_licencias', '/academico/asistencia/licencias/listar', 1, NOW(), NOW()),
('academico.asistencia.registro.ver', 'Asistencia · Registro diario: mis cursos', NULL, 'ACADEMICO', 'ACA', 'aca_asi_registro', '/academico/asistencia', 1, NOW(), NOW()),
('academico.asistencia.registro.coordinacion', 'Asistencia · Registro diario: coordinación (elegir docente)', NULL, 'ACADEMICO', 'ACA', 'aca_asi_registro', '/academico/asistencia', 1, NOW(), NOW()),
('academico.asistencia.registro.cuaderno', 'Asistencia · Planilla diaria del curso', NULL, 'ACADEMICO', 'ACA', 'aca_asi_registro', '/academico/asistencia/mis-cursos', 1, NOW(), NOW()),
('academico.asistencia.clase_no_dictada.ver', 'Asistencia · Clases no dictadas', NULL, 'ACADEMICO', 'ACA', 'aca_asi_cnd', '/academico/asistencia/clases-no-dictadas', 1, NOW(), NOW()),
('academico.asistencia.consolidado.ver', 'Asistencia · Consolidado %', NULL, 'ACADEMICO', 'ACA', 'aca_asi_consolidado', '/academico/asistencia/consolidado', 1, NOW(), NOW()),
-- Acompañamiento pedagógico (2026-07-31, reclasificado desde TUT): riesgo
-- pedagógico (vista 156, sin tabla), sesiones de refuerzo (schema 23,
-- ancladas en asignaciones_docentes) y panel de indicadores. Desde el
-- 2026-08-01 son pestañas del contenedor /academico/seguimiento (las URLs
-- gemelas /academico/acompanamiento/* siguen vivas, incluido el ABM de sesiones).
('academico.acompanamiento.alerta', 'Alertas de riesgo pedagógico: listar y ver detalle por estudiante', NULL, 'ACADEMICO', 'ACA', 'aca_acompanamiento', '/academico/seguimiento', 1, NOW(), NOW()),
('academico.acompanamiento.sesion', 'Sesiones de refuerzo: listar, ver detalle, crear, editar y eliminar', NULL, 'ACADEMICO', 'ACA', 'aca_acompanamiento', '/academico/seguimiento', 1, NOW(), NOW()),
('academico.acompanamiento.panel', 'Panel de acompañamiento: ver indicadores y exportar PDF', NULL, 'ACADEMICO', 'ACA', 'aca_acompanamiento', '/academico/seguimiento', 1, NOW(), NOW());

-- 2) Acciones de los permisos del módulo ACA
INSERT INTO permiso_acciones (permiso_id, accion, activo, created_at, updated_at)
SELECT p.id, x.accion, 1, NOW(), NOW()
FROM permisos p
JOIN (
  SELECT 'academico.calificacion.ingreso' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'academico.calificacion.coordinacion', 'LISTAR'
  UNION ALL SELECT 'academico.calificacion.centralizador', 'LISTAR'
  UNION ALL SELECT 'academico.calificacion.centralizador', 'EXPORTAR'
  UNION ALL SELECT 'academico.calificacion.centralizador', 'EDITAR'
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
  UNION ALL SELECT 'academico.historial.academico', 'LISTAR'
  UNION ALL SELECT 'academico.historial.academico', 'DETALLE'
  UNION ALL SELECT 'academico.historial.academico', 'EXPORTAR'
  UNION ALL SELECT 'academico.libro', 'LISTAR'
  UNION ALL SELECT 'academico.libro', 'DETALLE'
  UNION ALL SELECT 'academico.libro', 'CREAR'
  UNION ALL SELECT 'academico.libro', 'EDITAR'
  UNION ALL SELECT 'academico.libro', 'APROBAR'
  UNION ALL SELECT 'academico.libro', 'EXPORTAR'
  UNION ALL SELECT 'academico.avance', 'LISTAR'
  UNION ALL SELECT 'academico.avance', 'EXPORTAR'
  UNION ALL SELECT 'academico.desercion', 'LISTAR'
  UNION ALL SELECT 'academico.desercion', 'EXPORTAR'
  UNION ALL SELECT 'academico.asistencia.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'academico.asistencia.licencia.ver', 'DETALLE'
  UNION ALL SELECT 'academico.asistencia.licencia.crear', 'CREAR'
  UNION ALL SELECT 'academico.asistencia.licencia.crear', 'EDITAR'
  UNION ALL SELECT 'academico.asistencia.licencia.crear', 'ELIMINAR'
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
  UNION ALL SELECT 'academico.acompanamiento.alerta', 'LISTAR'
  UNION ALL SELECT 'academico.acompanamiento.alerta', 'DETALLE'
  UNION ALL SELECT 'academico.acompanamiento.sesion', 'LISTAR'
  UNION ALL SELECT 'academico.acompanamiento.sesion', 'DETALLE'
  UNION ALL SELECT 'academico.acompanamiento.sesion', 'CREAR'
  UNION ALL SELECT 'academico.acompanamiento.sesion', 'EDITAR'
  UNION ALL SELECT 'academico.acompanamiento.sesion', 'ELIMINAR'
  UNION ALL SELECT 'academico.acompanamiento.panel', 'LISTAR'
  UNION ALL SELECT 'academico.acompanamiento.panel', 'EXPORTAR'
) AS x ON x.codigo = p.codigo;

-- 3) Roles-permisos del módulo ACA (roles 2-8; ADMIN_SISTEMA hereda por vista)
INSERT INTO roles_permisos (rol_id, permiso_id, accion, activo, created_at, updated_at)
SELECT r.id, p.id, g.accion, 1, NOW(), NOW()
FROM (
  SELECT 'RECTOR' AS rol, 'academico.calificacion.ingreso' AS codigo, 'LISTAR' AS accion
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.ingreso', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.ingreso', 'LISTAR'
  -- ESTUDIANTE: la misma opción de menú "Calificaciones" → "Mi boletín" por wrapper de rol
  UNION ALL SELECT 'ESTUDIANTE', 'academico.calificacion.ingreso', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.coordinacion', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.coordinacion', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.centralizador', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.centralizador', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.centralizador', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.centralizador', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.centralizador', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.centralizador', 'EDITAR'
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
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.cuaderno.notas', 'EDITAR'
  UNION ALL SELECT 'DOCENTE', 'academico.calificacion.cuaderno.guardar', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.calificacion.bimestre.ajuste_admin', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.calificacion.bimestre.ajuste_admin', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.nivelacion.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.nivelacion.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.nivelacion.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.nivelacion.ver', 'DETALLE'
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
  UNION ALL SELECT 'RECTOR', 'academico.historial.academico', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.historial.academico', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.historial.academico', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.historial.academico', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.historial.academico', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.historial.academico', 'EXPORTAR'
  -- DOCENTE sin historial (decisión 2026-07-02): el kardex es administración
  -- académica (REC, DIRA, SECA) + el propio estudiante; el docente ya tiene
  -- sus notas en Calificaciones/Centralizador.
  -- SEC_ACADEMICA: operación completa del historial (matriz: REC, DIRA, SECA).
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.historial.academico', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.historial.academico', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.historial.academico', 'EXPORTAR'
  -- ESTUDIANTE: "Mi historial" (menú) + su propio transcript; el backend
  -- fuerza el id propio en servidor (estudianteSelfOnlyGuard, anti-IDOR).
  -- EXPORTAR (2026-07-03): descarga de su propio historial — la UI del portal
  -- solo ofrece el PDF (FORM-SIE-ITT-04), espejo del criterio de Mi boletín.
  UNION ALL SELECT 'ESTUDIANTE', 'academico.historial.academico', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'academico.historial.academico', 'DETALLE'
  UNION ALL SELECT 'ESTUDIANTE', 'academico.historial.academico', 'EXPORTAR'
  -- Libros de registro (2026-07-30, Fase 4): RECTOR y DIR_ACADEMICO operan y
  -- FIRMAN (APROBAR = firmar/anular folio); SEC_ACADEMICA prepara el libro
  -- (abre, genera folios, edita, exporta) pero NO firma. DOCENTE/ESTUDIANTE: nada.
  UNION ALL SELECT 'RECTOR', 'academico.libro', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.libro', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.libro', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'academico.libro', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.libro', 'APROBAR'
  UNION ALL SELECT 'RECTOR', 'academico.libro', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.libro', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.libro', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.libro', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.libro', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.libro', 'APROBAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.libro', 'EXPORTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.libro', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.libro', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.libro', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.libro', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.libro', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'academico.avance', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.avance', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.avance', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.avance', 'EXPORTAR'
  -- DOCENTE/ESTUDIANTE en avance: LISTAR; el backend acota en servidor al
  -- estudiante vinculado si el usuario tiene vínculo EST (anti-IDOR, "Mi avance").
  UNION ALL SELECT 'DOCENTE', 'academico.avance', 'LISTAR'
  UNION ALL SELECT 'ESTUDIANTE', 'academico.avance', 'LISTAR'
  -- Deserción (2026-07-29): métrica institucional — solo dirección.
  UNION ALL SELECT 'RECTOR', 'academico.desercion', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.desercion', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.desercion', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.desercion', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.licencia.ver', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.licencia.ver', 'DETALLE'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.asistencia.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.asistencia.licencia.ver', 'DETALLE'
  -- DOCENTE: solicita y ve licencias desde su planilla (icon por estudiante); no aprueba.
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.licencia.ver', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.licencia.ver', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.licencia.crear', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.licencia.crear', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.asistencia.licencia.crear', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.licencia.crear', 'CREAR'
  -- Editar (solo PENDIENTE) y cancelar (PENDIENTE|APROBADA): roles que gestionan licencias.
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.licencia.crear', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.licencia.crear', 'EDITAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.asistencia.licencia.crear', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.licencia.crear', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.licencia.crear', 'ELIMINAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.asistencia.licencia.crear', 'ELIMINAR'
  -- DOCENTE (2026-07-03): el docente edita/cancela SOLO sus propias solicitudes
  -- pendientes — guard created_by+estado en servidor (EditarLicenciaUseCase /
  -- CancelarLicenciaUseCase); aprobar sigue en REC/DIRA/SECA.
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.licencia.crear', 'EDITAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.licencia.crear', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.licencia.aprobar', 'APROBAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.licencia.aprobar', 'APROBAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.asistencia.licencia.aprobar', 'APROBAR'
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
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.asistencia.clase_no_dictada.ver', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.asistencia.clase_no_dictada.ver', 'CREAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.asistencia.clase_no_dictada.ver', 'EDITAR'
  UNION ALL SELECT 'DOCENTE', 'academico.asistencia.consolidado.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.consolidado.ver', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.asistencia.consolidado.ver', 'EXPORTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.consolidado.ver', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.asistencia.consolidado.ver', 'EXPORTAR'
  -- Acompañamiento pedagógico (2026-07-31, reclasificado desde TUT). Réplica
  -- EXACTA del acceso que tenía en 65-seed-permisos-tut.sql: allí DIR_ACADEMICO
  -- y RECTOR llegaban por el catch-all `p.modulo = 'TUT'` (control total de
  -- TODAS las acciones sembradas); aquí ACA no tiene catch-all de módulo, así
  -- que se replican como filas explícitas para no perder acceso en silencio.
  -- DIR_ACADEMICO y RECTOR: control total de los 3 permisos.
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.acompanamiento.alerta', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.acompanamiento.alerta', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.acompanamiento.alerta', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.acompanamiento.alerta', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.acompanamiento.sesion', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.acompanamiento.sesion', 'DETALLE'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.acompanamiento.sesion', 'CREAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.acompanamiento.sesion', 'EDITAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.acompanamiento.sesion', 'ELIMINAR'
  UNION ALL SELECT 'RECTOR', 'academico.acompanamiento.sesion', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.acompanamiento.sesion', 'DETALLE'
  UNION ALL SELECT 'RECTOR', 'academico.acompanamiento.sesion', 'CREAR'
  UNION ALL SELECT 'RECTOR', 'academico.acompanamiento.sesion', 'EDITAR'
  UNION ALL SELECT 'RECTOR', 'academico.acompanamiento.sesion', 'ELIMINAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.acompanamiento.panel', 'LISTAR'
  UNION ALL SELECT 'DIR_ACADEMICO', 'academico.acompanamiento.panel', 'EXPORTAR'
  UNION ALL SELECT 'RECTOR', 'academico.acompanamiento.panel', 'LISTAR'
  UNION ALL SELECT 'RECTOR', 'academico.acompanamiento.panel', 'EXPORTAR'
  -- SEC_ACADEMICA: solo lectura de alertas (sin sesiones ni panel, igual que en TUT).
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.acompanamiento.alerta', 'LISTAR'
  UNION ALL SELECT 'SEC_ACADEMICA', 'academico.acompanamiento.alerta', 'DETALLE'
  -- DOCENTE: docente de materia — alertas de sus cursos + gestión de sesiones
  -- de refuerzo (sin ELIMINAR, sin panel, igual que en TUT).
  UNION ALL SELECT 'DOCENTE', 'academico.acompanamiento.alerta', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.acompanamiento.alerta', 'DETALLE'
  UNION ALL SELECT 'DOCENTE', 'academico.acompanamiento.sesion', 'LISTAR'
  UNION ALL SELECT 'DOCENTE', 'academico.acompanamiento.sesion', 'DETALLE'
  UNION ALL SELECT 'DOCENTE', 'academico.acompanamiento.sesion', 'CREAR'
  UNION ALL SELECT 'DOCENTE', 'academico.acompanamiento.sesion', 'EDITAR'
) AS g
JOIN roles r ON r.codigo = g.rol
JOIN permisos p ON p.codigo = g.codigo;

-- ============================================================
-- DESHABILITACIÓN TEMPORAL · páginas aún no construidas (2026-06-24)
-- Nivelaciones, Traspasos y Transitabilidad: se ocultan hasta que las
-- pantallas existan. (Calificaciones y Asistencia SÍ están construidas y
-- permanecen activas.)
-- 2026-07-29 (disolución REP): `academico.avance` y su grupo `aca_avance`
-- REHABILITADOS — el backend de Avance/Deserción existe (vistas 170-173,
-- endpoints /avance-academico y /desercion); la página con tabs es la
-- iteración frontend siguiente. `academico.desercion` nace activo.
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
  -- Nivelaciones
  'academico.nivelacion.ver',
  'academico.nivelacion.inscribir',
  'academico.nivelacion.aprobar',
  -- Traspasos
  'academico.trazabilidad.traspaso.ver',
  'academico.trazabilidad.traspaso.solicitar',
  'academico.trazabilidad.traspaso.recibir',
  'academico.trazabilidad.traspaso.convalidar',
  'academico.trazabilidad.traspaso.aprobar',
  -- Transitabilidad
  'academico.trazabilidad.transitabilidad.ver',
  'academico.trazabilidad.transitabilidad.solicitar',
  'academico.trazabilidad.transitabilidad.recibir',
  'academico.trazabilidad.transitabilidad.convalidar',
  'academico.trazabilidad.transitabilidad.aprobar'
  -- Historial: la pantalla del kardex (academico.historial.academico) ya
  -- está construida (2026-07-02) y queda ACTIVA.
  -- 'academico.historial.folio' y 'academico.historial.validar' RETIRADOS del
  -- seed (2026-07-30, Fase 4): el folio del egresado fue reemplazado por
  -- `academico.libro` (schema 25) y la validación de egreso pasa a la Fase 5
  -- (`tutorias.titulo.*`). Ya no se siembran, por eso tampoco se apagan aquí.
  -- 'academico.avance' rehabilitado (2026-07-29): backend construido (REP disuelto).
);

-- 2) Cascada: acciones de esos permisos
UPDATE permiso_acciones pa
JOIN permisos p ON p.id = pa.permiso_id
SET pa.activo = 0, pa.deleted_at = @fecha_baja
WHERE p.modulo = 'ACA' AND p.deleted_at IS NOT NULL;

-- 3) Cascada: asignaciones a roles de esos permisos
UPDATE roles_permisos rp
JOIN permisos p ON p.id = rp.permiso_id
SET rp.activo = 0, rp.deleted_at = @fecha_baja
WHERE p.modulo = 'ACA' AND p.deleted_at IS NOT NULL;

-- 4) Grupos de UI cuyas páginas quedan completamente ocultas
UPDATE grupos_ui
SET activo = 0, deleted_at = @fecha_baja
WHERE codigo IN (
  'aca_nivelaciones',
  'aca_traspasos',
  'aca_transitabilidad'
  -- 'aca_historial' reactivado (2026-07-02): la pantalla de historial existe.
  -- 'aca_avance' reactivado (2026-07-29): backend Avance/Deserción construido.
);

SET FOREIGN_KEY_CHECKS = 1;
