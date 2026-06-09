-- ============================================
-- SEEDER: permisos v3
-- Sistema de Gestión Académica · Instituto INCOS
-- Archivo: backend/database/02-seeders/54-seed-permisos.sql
--
-- Orden: por módulo (MAT → ACA → DOC → FIN → INST → CFG → REP → SEG → SYS).
-- Calificaciones (ACA): un permiso por pantalla (grupo_ui único = fila en grilla Seguridad).
--   15 ingreso      → menú + CalificacionesEntradaConnector (LISTAR)
--   16 coordinacion → CoordinacionPage; API coordinación; habilitación bimestre cerrado (LISTAR)
--   17 mis_cursos   → MisCursosPage; docente propio o tras elegir docente en coordinación (LISTAR, DETALLE)
--   18 cuaderno     → ConsolidadoPage, CuadernoPage, BimestreConsolidadoPage lectura (LISTAR)
--   19 politica     → PoliticaInstitucionalPage (LISTAR, EDITAR)
--   20 gestion_bimestres → cierre/inicio bimestres — solo coordinación (LISTAR, EDITAR)
--   21-23           → operaciones del cuaderno (evaluaciones, notas, guardar bimestre vigente)
--   24              → consolidado bimestre: ajuste administrativo (habilitación) en bimestre cerrado
--
-- [TOTAL] 111 permisos · orden: MAT → ACA → DOC → FIN → INST (67-83) → CFG (84-100) → REP → SEG → SYS
-- Ejecutar después de: 53-seed-roles.sql
-- Ejecutar antes de:   56-seed-permiso-acciones.sql, 55-seed-roles-permisos.sql
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- Sincronizado con dump local 2026-06 (111 filas)
INSERT INTO permisos (id, codigo, nombre, descripcion, dominio, modulo, grupo_ui, ruta_sidebar, activo, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) VALUES
(1, 'matricula.admision.ver', 'Admisión: listar, ver ficha; exportar Excel estadística de inscritos', NULL, 'MATRICULA', 'MAT', 'mat_admision', '/estudiantes/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(2, 'matricula.admision.crear', 'Admisión: registrar nuevo estudiante', NULL, 'MATRICULA', 'MAT', 'mat_admision', '/estudiantes/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(3, 'matricula.admision.editar', 'Admisión: editar datos, eliminar y activar', NULL, 'MATRICULA', 'MAT', 'mat_admision', '/estudiantes/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(4, 'matricula.inscribir', 'Matrículas: listar, ver y crear inscripción; exportar Excel lista por carrera', NULL, 'MATRICULA', 'MAT', 'mat_inscripcion', '/matricula/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(5, 'matricula.inscripcion.editar', 'Matrículas: editar y eliminar inscripción', NULL, 'MATRICULA', 'MAT', 'mat_inscripcion', '/matricula/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(6, 'matricula.beca.ver', 'Becas: listar asignaciones, ver detalle de asignación y ficha desde contexto', NULL, 'MATRICULA', 'MAT', 'mat_becas', '/estudiantes/becas/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(7, 'matricula.beca.asignar', 'Becas: asignar, ajustar o quitar', NULL, 'MATRICULA', 'MAT', 'mat_becas', '/estudiantes/becas/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(8, 'matricula.beca.aprobar', 'Becas: aprobar solicitudes', NULL, 'MATRICULA', 'MAT', 'mat_becas', '/estudiantes/becas/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(9, 'matricula.documento.ver', 'Documentos: ver y generar PDFs (acta, declaración, formulario)', NULL, 'MATRICULA', 'MAT', 'mat_documentos', '/estudiantes/documentos', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(10, 'matricula.pago.aporte.ver', 'Aportes: listar, detalle, editar cuotas, anular, exportar recibo PDF y Excel estado por carrera', NULL, 'MATRICULA', 'MAT', 'mat_aportes', '/matricula/aportes/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(11, 'matricula.pasantia.ver', 'Pasantías estudiantiles: listar y ver', NULL, 'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(12, 'matricula.pasantia.solicitar', 'Pasantías estudiantiles: solicitar', NULL, 'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(13, 'matricula.pasantia.aprobar', 'Pasantías estudiantiles: aprobar', NULL, 'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(14, 'matricula.pasantia.evaluar', 'Pasantías estudiantiles: evaluación final', NULL, 'MATRICULA', 'MAT', 'mat_pasantias', '/pasantias/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(15, 'academico.calificacion.ingreso', 'Calificaciones · menú Académico', NULL, 'ACADEMICO', 'ACA', 'aca_cal_ingreso', '/academico/calificaciones', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(16, 'academico.calificacion.coordinacion', 'Calificaciones · coordinación docentes', NULL, 'ACADEMICO', 'ACA', 'aca_cal_coordinacion', '/academico/calificaciones', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(17, 'academico.calificacion.mis_cursos', 'Calificaciones · mis cursos', NULL, 'ACADEMICO', 'ACA', 'aca_cal_mis_cursos', '/academico/calificaciones/mis-cursos', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(18, 'academico.calificacion.cuaderno', 'Calificaciones · cuaderno y registro de notas', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno', '/academico/calificaciones/mis-cursos/:asignacionId', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(19, 'academico.calificacion.politica', 'Calificaciones · política institucional', NULL, 'ACADEMICO', 'ACA', 'aca_cal_politica', '/academico/calificaciones/politica', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(20, 'academico.calificacion.gestion_bimestres', 'Calificaciones · gestión de bimestres', NULL, 'ACADEMICO', 'ACA', 'aca_cal_gestion_anual', '/academico/calificaciones/gestion-bimestres', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(21, 'academico.calificacion.cuaderno.evaluaciones', 'Calificaciones · cuaderno · gestionar evaluaciones', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno_evals', '/academico/calificaciones/mis-cursos/:asignacionId/cuaderno/:n', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(22, 'academico.calificacion.cuaderno.notas', 'Calificaciones · cuaderno · registrar/modificar notas', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno_notas', '/academico/calificaciones/mis-cursos/:asignacionId/cuaderno/:n', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(23, 'academico.calificacion.cuaderno.guardar', 'Calificaciones · cuaderno · guardar y recalcular bimestre', NULL, 'ACADEMICO', 'ACA', 'aca_cal_cuaderno_guardar', '/academico/calificaciones/mis-cursos/:asignacionId/cuaderno/:n', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(24, 'academico.calificacion.bimestre.ajuste_admin', 'Calificaciones · bimestre cerrado · ajuste administrativo', NULL, 'ACADEMICO', 'ACA', 'aca_cal_bim_ajuste_admin', '/academico/calificaciones/mis-cursos/:asignacionId/bimestre/:n/consolidado', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(25, 'academico.nivelacion.ver', 'Nivelaciones: listar y ver', NULL, 'ACADEMICO', 'ACA', 'aca_nivelaciones', '/academico/nivelaciones/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(26, 'academico.nivelacion.inscribir', 'Nivelaciones: inscribir estudiante', NULL, 'ACADEMICO', 'ACA', 'aca_nivelaciones', '/academico/nivelaciones/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(27, 'academico.nivelacion.aprobar', 'Nivelaciones: aprobar', NULL, 'ACADEMICO', 'ACA', 'aca_nivelaciones', '/academico/nivelaciones/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(28, 'academico.trazabilidad.traspaso.ver', 'Traspasos: listar y ver', NULL, 'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(29, 'academico.trazabilidad.traspaso.solicitar', 'Traspasos: solicitar (salida)', NULL, 'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(30, 'academico.trazabilidad.traspaso.recibir', 'Traspasos: recibir (entrada)', NULL, 'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(31, 'academico.trazabilidad.traspaso.convalidar', 'Traspasos: convalidar notas', NULL, 'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(32, 'academico.trazabilidad.traspaso.aprobar', 'Traspasos: aprobar', NULL, 'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(33, 'academico.trazabilidad.transitabilidad.ver', 'Transitabilidad: listar y ver', NULL, 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(34, 'academico.trazabilidad.transitabilidad.solicitar', 'Transitabilidad: solicitar', NULL, 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(35, 'academico.trazabilidad.transitabilidad.recibir', 'Transitabilidad: recibir', NULL, 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(36, 'academico.trazabilidad.transitabilidad.convalidar', 'Transitabilidad: convalidar notas', NULL, 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(37, 'academico.trazabilidad.transitabilidad.aprobar', 'Transitabilidad: aprobar', NULL, 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(38, 'academico.historial.folio', 'Historial: gestionar folio del egresado', NULL, 'ACADEMICO', 'ACA', 'aca_historial', '/academico/historial/academico', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(39, 'academico.historial.academico', 'Historial: ver historial académico del alumno', NULL, 'ACADEMICO', 'ACA', 'aca_historial', '/academico/historial/academico', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(40, 'academico.historial.validar', 'Historial: validar para egreso', NULL, 'ACADEMICO', 'ACA', 'aca_historial', '/academico/historial/academico', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(41, 'academico.avance', 'Avance académico: ver progreso del estudiante en su carrera', NULL, 'ACADEMICO', 'ACA', 'aca_avance', '/academico/avance', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(42, 'academico.licencia.ver', 'Licencias estudiantiles: listar y ver', NULL, 'ACADEMICO', 'ACA', 'aca_licencias_est', '/academico/licencias/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(43, 'academico.licencia.crear', 'Licencias estudiantiles: solicitar', NULL, 'ACADEMICO', 'ACA', 'aca_licencias_est', '/academico/licencias/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(44, 'academico.licencia.aprobar', 'Licencias estudiantiles: aprobar', NULL, 'ACADEMICO', 'ACA', 'aca_licencias_est', '/academico/licencias/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(45, 'docentes.ver', 'Docentes: listar y ver ficha', NULL, 'DOCENTES', 'DOC', 'doc_docentes', '/docentes/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(46, 'docentes.crear', 'Docentes: registrar nuevo docente', NULL, 'DOCENTES', 'DOC', 'doc_docentes', '/docentes/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(47, 'docentes.asignar', 'Docentes: asignar a oferta académica', NULL, 'DOCENTES', 'DOC', 'doc_docentes', '/docentes/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(48, 'docentes.licencia.ver', 'Licencias docentes: listar y ver', NULL, 'DOCENTES', 'DOC', 'doc_licencias', '/docentes/licencias/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(49, 'docentes.licencia.crear', 'Licencias docentes: solicitar', NULL, 'DOCENTES', 'DOC', 'doc_licencias', '/docentes/licencias/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(50, 'docentes.licencia.aprobar', 'Licencias docentes: aprobar', NULL, 'DOCENTES', 'DOC', 'doc_licencias', '/docentes/licencias/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(51, 'docentes.supervision.evaluar', 'Supervisión: evaluar docente', NULL, 'DOCENTES', 'DOC', 'doc_supervision', '/supervision', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(52, 'docentes.supervision.reporte', 'Supervisión: ver reportes', NULL, 'DOCENTES', 'DOC', 'doc_supervision', '/supervision', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(53, 'docentes.supervision.programar', 'Supervisión: programar sesión', NULL, 'DOCENTES', 'DOC', 'doc_supervision', '/supervision', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(54, 'docentes.supervision.ficha.crear', 'Supervisión: crear ficha de evaluación', NULL, 'DOCENTES', 'DOC', 'doc_supervision', '/supervision', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(55, 'docentes.supervision.ficha.editar', 'Supervisión: editar ficha de evaluación', NULL, 'DOCENTES', 'DOC', 'doc_supervision', '/supervision', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(56, 'docentes.supervision.pasantia.solicitar', 'Pasantías docentes: solicitar', NULL, 'DOCENTES', 'DOC', 'doc_pasantias', '/supervision/pasantias', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(57, 'docentes.supervision.pasantia.seguimiento', 'Pasantías docentes: seguimiento', NULL, 'DOCENTES', 'DOC', 'doc_pasantias', '/supervision/pasantias', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(58, 'docentes.supervision.pasantia.evaluar', 'Pasantías docentes: evaluación final', NULL, 'DOCENTES', 'DOC', 'doc_pasantias', '/supervision/pasantias', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(59, 'docentes.editar', 'Docentes: editar ficha y eliminar o desactivar registro', NULL, 'DOCENTES', 'DOC', 'doc_docentes', '/docentes/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(60, 'finanzas.pago.ver', 'Pagos: listar, ver detalle; exportar recibos y Excel estado aportes por carrera', NULL, 'FINANZAS', 'FIN', 'fin_pagos', '/pagos/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(61, 'finanzas.pago.registrar', 'Pagos: registrar pago', NULL, 'FINANZAS', 'FIN', 'fin_pagos', '/pagos/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(62, 'finanzas.pago.editar', 'Pagos: editar y eliminar pago', NULL, 'FINANZAS', 'FIN', 'fin_pagos', '/pagos/listar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(63, 'finanzas.pago.adicionales', 'Pagos adicionales: gestionar', NULL, 'FINANZAS', 'FIN', 'fin_adicionales', '/pagos/adicionales', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(64, 'finanzas.pago.reporte.carrera', 'Reportes de pagos: por carrera', NULL, 'FINANZAS', 'FIN', 'fin_reportes', '/pagos/reportes', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(65, 'finanzas.pago.reporte.estudiante', 'Reportes de pagos: por estudiante', NULL, 'FINANZAS', 'FIN', 'fin_reportes', '/pagos/reportes', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(66, 'finanzas.pago.reporte.gestion', 'Reportes de pagos: por gestión', NULL, 'FINANZAS', 'FIN', 'fin_reportes', '/pagos/reportes', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(67, 'institucional.gestion.actual', 'Gestión actual: ver', NULL, 'INSTITUCIONAL', 'INST', 'inst_gestion', '/institucional/actual', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(68, 'institucional.gestion.cronograma', 'Cronogramas: gestionar', NULL, 'INSTITUCIONAL', 'INST', 'inst_cronograma', '/institucional/cronogramas', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(69, 'institucional.gestion.oferta', 'Oferta académica: gestionar', NULL, 'INSTITUCIONAL', 'INST', 'inst_oferta', '/institucional/oferta', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(70, 'institucional.gestion.horarios', 'Horarios: asignar', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios', '/institucional/horarios', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(71, 'institucional.oferta.gestionar', 'Inscripción por materia o curso', NULL, 'INSTITUCIONAL', 'INST', 'inst_oferta', '/institucional/oferta', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(72, 'institucional.horario.asignar', 'Generar horarios', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios', '/institucional/horarios/generar', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(73, 'institucional.gestion.pasadas', 'Gestiones pasadas: ver', NULL, 'INSTITUCIONAL', 'INST', 'inst_pasadas', '/institucional/pasadas', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(74, 'institucional.horario.plantilla', 'Gestión de horarios: trabajar plantilla base', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_plantilla', '/institucional/horarios/plantilla', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(75, 'institucional.horario.armado', 'Gestión de horarios: armado operativo de bloques', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_armado', '/institucional/horarios/armado', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(76, 'institucional.horario.conflictos', 'Gestión de horarios: revisión y resolución de conflictos (UI en armado)', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_armado', '/institucional/horarios/armado', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(77, 'institucional.horario.publicacion', 'Gestión de horarios: publicación de horarios vigentes', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_publicacion', '/institucional/horarios/publicacion', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(78, 'institucional.oferta.gestion-plan', 'Oferta: habilitar planes en gestión', NULL, 'INSTITUCIONAL', 'INST', 'inst_oferta_academica', '/institucional/oferta', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(79, 'institucional.oferta.paralelo-gestion', 'Oferta: paralelos de gestión', NULL, 'INSTITUCIONAL', 'INST', 'inst_oferta_academica', '/institucional/oferta', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(80, 'institucional.oferta.cursos', 'Oferta: cursos ofertados por paralelo', NULL, 'INSTITUCIONAL', 'INST', 'inst_oferta_academica', '/institucional/oferta', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(81, 'institucional.horarios.asignacion-docente', 'Horarios: asignación docente por oferta', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_asignacion', '/institucional/horarios/asignacion-docente', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(82, 'institucional.horarios.color-docente', 'Horarios: color del docente', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_asignacion', '/institucional/horarios/asignacion-docente', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(83, 'institucional.horarios.carga-docente', 'Horarios: carga horaria de docentes', NULL, 'INSTITUCIONAL', 'INST', 'inst_horarios_carga', '/institucional/horarios/carga-docentes', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(84, 'configuracion.plan-estudio', 'Académico: planes de estudio', NULL, 'CONFIGURACION', 'CFG', 'configuracion_academico_plan', '/configuracion/academico', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(85, 'configuracion.carrera', 'Académico: carreras', NULL, 'CONFIGURACION', 'CFG', 'configuracion_academico_carrera', '/configuracion/academico', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(86, 'configuracion.materia', 'Académico: materias', NULL, 'CONFIGURACION', 'CFG', 'configuracion_academico_materia', '/configuracion/academico', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(87, 'configuracion.plan-estudio.periodos', 'Plan: periodos (años)', NULL, 'CONFIGURACION', 'CFG', 'configuracion_plan_periodos', '/configuracion/academico', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(88, 'configuracion.plan-estudio.asignaturas', 'Plan: asignaturas por periodo', NULL, 'CONFIGURACION', 'CFG', 'configuracion_plan_asignaturas', '/configuracion/academico', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(89, 'configuracion.plan-estudio.prerrequisitos', 'Académico: prerrequisitos', NULL, 'CONFIGURACION', 'CFG', 'configuracion_academico_prerrequisitos', '/configuracion/academico', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(90, 'configuracion.paralelo', 'Académico: paralelos maestro', NULL, 'CONFIGURACION', 'CFG', 'configuracion_academico_paralelo', '/configuracion/academico', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(91, 'configuracion.documentacion.inscripcion', 'Documentación: inscripción', NULL, 'CONFIGURACION', 'CFG', 'configuracion_documentacion', '/configuracion/documentacion', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(92, 'configuracion.documentacion.becas', 'Documentación: becas', NULL, 'CONFIGURACION', 'CFG', 'configuracion_documentacion', '/configuracion/documentacion', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(93, 'configuracion.documentacion.pasantias', 'Documentación: pasantías', NULL, 'CONFIGURACION', 'CFG', 'configuracion_documentacion', '/configuracion/documentacion', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(94, 'configuracion.documentacion.traslado', 'Documentación: traslado', NULL, 'CONFIGURACION', 'CFG', 'configuracion_documentacion', '/configuracion/documentacion', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(95, 'configuracion.complementario.discapacidad', 'Complementarios: discapacidad', NULL, 'CONFIGURACION', 'CFG', 'configuracion_complementario', '/configuracion/datos-complementarios', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(96, 'configuracion.complementario.apoderados', 'Complementarios: apoderados', NULL, 'CONFIGURACION', 'CFG', 'configuracion_complementario', '/configuracion/datos-complementarios', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(97, 'configuracion.complementario.idiomas', 'Complementarios: idiomas', NULL, 'CONFIGURACION', 'CFG', 'configuracion_complementario', '/configuracion/datos-complementarios', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(98, 'configuracion.convenios', 'Empresas y convenios', NULL, 'CONFIGURACION', 'CFG', 'configuracion_convenios', '/configuracion/convenios', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(99, 'configuracion.pagos', 'Configuración de pagos y aranceles', NULL, 'CONFIGURACION', 'CFG', 'configuracion_pagos', '/pagos/configuracion', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(100, 'configuracion.historial-actividades', 'Historial de actividades', NULL, 'CONFIGURACION', 'CFG', 'configuracion_historial', '/configuracion/historial-actividades', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(101, 'reportes.avance_academico', 'Reporte de avance académico', NULL, 'REPORTES', 'REP', 'rep_avance', '/reportes/avance-academico', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(102, 'reportes.asistencia', 'Reporte de asistencia', NULL, 'REPORTES', 'REP', 'rep_asistencia', '/reportes/asistencia', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(103, 'reportes.desercion', 'Reporte de deserción', NULL, 'REPORTES', 'REP', 'rep_desercion', '/reportes/desercion', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(104, 'reportes.solicitudes.general', 'Reporte general de solicitudes', NULL, 'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(105, 'reportes.solicitudes.becas', 'Reporte de solicitudes de becas', NULL, 'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(106, 'reportes.solicitudes.traspaso', 'Reporte de solicitudes de traspaso', NULL, 'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(107, 'reportes.solicitudes.pasantia', 'Reporte de solicitudes de pasantía', NULL, 'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(108, 'seguridad.usuario.crear', 'Usuarios: crear nuevo usuario', NULL, 'SEGURIDAD', 'SEG', 'seg_usuarios', '/seguridad/usuarios', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(109, 'seguridad.usuario.administrar', 'Usuarios: listar, ver y administrar', NULL, 'SEGURIDAD', 'SEG', 'seg_usuarios', '/seguridad/usuarios', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(110, 'seguridad.rol.gestionar', 'Roles y permisos: ver y administrar', NULL, 'SEGURIDAD', 'SEG', 'seg_roles', '/seguridad/roles', 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL),
(111, 'sistema.catalogo.referencia', 'Catálogos de referencia: APIs transversales para combos (ubicación, tipos, bancos, etc.)', NULL, 'SISTEMA', 'SYS', NULL, NULL, 1, '2026-06-08 14:50:35', '2026-06-08 14:50:35', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
-- TOTAL: 111 filas (permisos)
