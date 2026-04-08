-- ============================================
-- SEEDER: permisos
-- Sistema de Gestión Académica - Instituto INCOS
-- Códigos alineados al campo permiso en routes.jsx del frontend
-- Ejecutar después de 53-seed-roles.sql; antes de 55-seed-roles-permisos.sql
--
-- MATRÍCULA (sidebar): rutas UI vs permisos (acciones en 56-seed-permiso-acciones.sql)
--   /estudiantes/listar, /estudiantes/:id, exports estudiantes
--       → matricula.admision.ver (VER, EXPORTAR) + matricula.admision.editar (EDITAR, ELIMINAR)
--       + matricula.admision.crear (CREAR) + finanzas.pago.registrar (CREAR) para registrar pago
--   /estudiantes/registrar → matricula.admision.crear (VER, CREAR)
--   /estudiantes/:id/editar → matricula.admision.editar
--   /matricula/listar, /inscripciones/* → matricula.inscribir + matricula.inscripcion.editar
--       + matricula.documento.ver (CREAR) PDF inscripción
--   /estudiantes/becas/* → matricula.beca.ver | .asignar | .aprobar
--   /matricula/aportes/listar, /pagos/* (API pagos-aportes: también finanzas.pago.* vía OR)
--       → matricula.pago.aporte.ver + finanzas.pago.ver | .registrar | .editar
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- INSERTAR PERMISOS (IDs 1–87)
-- ============================================

INSERT INTO permisos (id, codigo, nombre, dominio, modulo, activo) VALUES

-- DOMINIO: MATRICULA (admisión / inscripción / becas / aportes en menú Matrícula)
(1, 'matricula.admision.ver', 'Admisiones: listar, ver ficha y exportar (Excel estadística / lista inscritos)', 'MATRICULA', 'MAT', TRUE),
(2, 'matricula.admision.crear', 'Admisiones: registrar nuevo estudiante (alta)', 'MATRICULA', 'MAT', TRUE),
(3, 'matricula.admision.editar', 'Admisiones: editar datos y eliminar estudiante', 'MATRICULA', 'MAT', TRUE),
(4, 'matricula.inscribir', 'Matrícula: listar, ver y crear inscripción', 'MATRICULA', 'MAT', TRUE),
(5, 'matricula.inscripcion.editar', 'Matrícula: editar, eliminar inscripción', 'MATRICULA', 'MAT', TRUE),
(6, 'matricula.beca.ver', 'Becas: listar asignaciones y ver detalle', 'MATRICULA', 'MAT', TRUE),
(7, 'matricula.beca.asignar', 'Becas: asignar, ajustar o quitar asignación', 'MATRICULA', 'MAT', TRUE),
(8, 'matricula.beca.aprobar', 'Becas: aprobar solicitudes (pantalla en construcción)', 'MATRICULA', 'MAT', TRUE),
(9, 'matricula.documento.ver', 'Documentos: ver y generar PDFs (acta, declaración, formulario inscripción)', 'MATRICULA', 'MAT', TRUE),
(10, 'matricula.pago.aporte.ver', 'Aportes matrícula: listar/ver (menú Matrícula); exportar recibo y anular cuota alternativos a Finanzas', 'MATRICULA', 'MAT', TRUE),

-- DOMINIO: ACADEMICO
(11, 'academico.licencia.ver', 'Ver Licencias de Estudiante', 'ACADEMICO', 'ACA', TRUE),
(12, 'academico.licencia.crear', 'Solicitar Licencia de Estudiante', 'ACADEMICO', 'ACA', TRUE),
(13, 'academico.licencia.aprobar', 'Aprobar Licencia de Estudiante', 'ACADEMICO', 'ACA', TRUE),
(14, 'academico.calificacion.registrar.parcial', 'Registrar Nota de Parciales', 'ACADEMICO', 'ACA', TRUE),
(15, 'academico.calificacion.registrar.practico', 'Registrar Notas de Prácticos', 'ACADEMICO', 'ACA', TRUE),
(16, 'academico.calificacion.registrar.recuperatorio', 'Registrar Recuperatorio', 'ACADEMICO', 'ACA', TRUE),
(17, 'academico.calificacion.curso', 'Calificaciones por Curso', 'ACADEMICO', 'ACA', TRUE),
(18, 'academico.calificacion.periodo', 'Entregar Notas por Período', 'ACADEMICO', 'ACA', TRUE),
(19, 'academico.calificacion.modificar', 'Modificar Calificaciones', 'ACADEMICO', 'ACA', TRUE),
(20, 'academico.nivelacion.ver', 'Ver Nivelaciones', 'ACADEMICO', 'ACA', TRUE),
(21, 'academico.nivelacion.inscribir', 'Inscribir Nivelación', 'ACADEMICO', 'ACA', TRUE),
(22, 'academico.nivelacion.aprobar', 'Aprobar Nivelación', 'ACADEMICO', 'ACA', TRUE),
(23, 'academico.trazabilidad.traspaso.ver', 'Ver Traspasos', 'ACADEMICO', 'ACA', TRUE),
(24, 'academico.trazabilidad.traspaso.solicitar', 'Solicitar Traspaso (Salida)', 'ACADEMICO', 'ACA', TRUE),
(25, 'academico.trazabilidad.traspaso.recibir', 'Recibir Traspaso (Entrada)', 'ACADEMICO', 'ACA', TRUE),
(26, 'academico.trazabilidad.traspaso.convalidar', 'Convalidar Notas de Traspaso', 'ACADEMICO', 'ACA', TRUE),
(27, 'academico.trazabilidad.traspaso.aprobar', 'Aprobar Traspaso', 'ACADEMICO', 'ACA', TRUE),
(28, 'academico.trazabilidad.transitabilidad.ver', 'Ver Transitabilidad', 'ACADEMICO', 'ACA', TRUE),
(29, 'academico.trazabilidad.transitabilidad.solicitar', 'Solicitar Transitabilidad (Salida)', 'ACADEMICO', 'ACA', TRUE),
(30, 'academico.trazabilidad.transitabilidad.recibir', 'Recibir Transitabilidad (Entrada)', 'ACADEMICO', 'ACA', TRUE),
(31, 'academico.trazabilidad.transitabilidad.convalidar', 'Convalidar Notas de Transitabilidad', 'ACADEMICO', 'ACA', TRUE),
(32, 'academico.trazabilidad.transitabilidad.aprobar', 'Aprobar Transitabilidad', 'ACADEMICO', 'ACA', TRUE),
(33, 'academico.historial.folio', 'Gestionar Folio del Egresado', 'ACADEMICO', 'ACA', TRUE),
(34, 'academico.historial.academico', 'Ver Historial Académico', 'ACADEMICO', 'ACA', TRUE),
(35, 'academico.historial.validar', 'Validar Historial Académico', 'ACADEMICO', 'ACA', TRUE),

-- DOMINIO: DOCENTES
(36, 'docentes.ver', 'Ver Docentes', 'DOCENTES', 'DOC', TRUE),
(37, 'docentes.crear', 'Registrar Docente', 'DOCENTES', 'DOC', TRUE),
(38, 'docentes.asignar', 'Asignar Docente a Oferta Académica', 'DOCENTES', 'DOC', TRUE),
(39, 'docentes.licencia.ver', 'Ver Licencias de Docente', 'DOCENTES', 'DOC', TRUE),
(40, 'docentes.licencia.crear', 'Solicitar Licencia de Docente', 'DOCENTES', 'DOC', TRUE),
(41, 'docentes.licencia.aprobar', 'Aprobar Licencia de Docente', 'DOCENTES', 'DOC', TRUE),
(42, 'docentes.supervision.evaluar', 'Evaluar Docente (Supervisión)', 'DOCENTES', 'DOC', TRUE),
(43, 'docentes.supervision.reporte', 'Ver Reportes de Supervisión', 'DOCENTES', 'DOC', TRUE),
(44, 'docentes.supervision.programar', 'Programar Supervisión', 'DOCENTES', 'DOC', TRUE),
(45, 'docentes.supervision.ficha.crear', 'Crear Ficha de Supervisión', 'DOCENTES', 'DOC', TRUE),
(46, 'docentes.supervision.ficha.editar', 'Editar Ficha de Supervisión', 'DOCENTES', 'DOC', TRUE),
(47, 'docentes.supervision.pasantia.solicitar', 'Solicitar Pasantía', 'DOCENTES', 'DOC', TRUE),
(48, 'docentes.supervision.pasantia.seguimiento', 'Seguimiento de Pasantía', 'DOCENTES', 'DOC', TRUE),
(49, 'docentes.supervision.pasantia.evaluar', 'Evaluación Final de Pasantía', 'DOCENTES', 'DOC', TRUE),

-- DOMINIO: FINANZAS
(50, 'finanzas.pago.ver', 'Ver Pagos', 'FINANZAS', 'FIN', TRUE),
(51, 'finanzas.pago.registrar', 'Registrar Pago', 'FINANZAS', 'FIN', TRUE),
(52, 'finanzas.pago.editar', 'Editar Pago', 'FINANZAS', 'FIN', TRUE),
(53, 'finanzas.pago.adicionales', 'Registrar Pagos Adicionales', 'FINANZAS', 'FIN', TRUE),
(54, 'finanzas.pago.reporte.carrera', 'Reporte de Pagos por Carrera', 'FINANZAS', 'FIN', TRUE),
(55, 'finanzas.pago.reporte.estudiante', 'Reporte de Pagos por Estudiante', 'FINANZAS', 'FIN', TRUE),
(56, 'finanzas.pago.reporte.gestion', 'Reporte de Pagos por Gestión', 'FINANZAS', 'FIN', TRUE),

-- DOMINIO: INSTITUCIONAL
(57, 'institucional.gestion.actual', 'Ver Gestión Actual', 'INSTITUCIONAL', 'INST', TRUE),
(58, 'institucional.gestion.cronograma', 'Gestionar Cronogramas', 'INSTITUCIONAL', 'INST', TRUE),
(59, 'institucional.gestion.oferta', 'Gestionar Oferta Académica', 'INSTITUCIONAL', 'INST', TRUE),
(60, 'institucional.gestion.horarios', 'Asignar Horarios (Gestión)', 'INSTITUCIONAL', 'INST', TRUE),
(61, 'institucional.oferta.gestionar', 'Inscribir por Materia o Curso', 'INSTITUCIONAL', 'INST', TRUE),
(62, 'institucional.horario.asignar', 'Generar Horarios', 'INSTITUCIONAL', 'INST', TRUE),
(63, 'institucional.gestion.pasadas', 'Ver Gestiones Pasadas', 'INSTITUCIONAL', 'INST', TRUE),
(64, 'institucional.config.academico.carreras', 'Gestionar Carreras', 'INSTITUCIONAL', 'INST', TRUE),
(65, 'institucional.config.academico.materias', 'Gestionar Materias', 'INSTITUCIONAL', 'INST', TRUE),
(66, 'institucional.config.academico.plan', 'Gestionar Plan de Estudios', 'INSTITUCIONAL', 'INST', TRUE),
(67, 'institucional.config.academico.cursos', 'Gestionar Cursos/Paralelos', 'INSTITUCIONAL', 'INST', TRUE),
(68, 'institucional.config.academico.turnos', 'Gestionar Turnos', 'INSTITUCIONAL', 'INST', TRUE),
(69, 'institucional.config.documentacion.inscripcion', 'Config. Documentación Inscripción', 'INSTITUCIONAL', 'INST', TRUE),
(70, 'institucional.config.documentacion.becas', 'Config. Documentación Becas', 'INSTITUCIONAL', 'INST', TRUE),
(71, 'institucional.config.documentacion.pasantias', 'Config. Documentación Pasantías', 'INSTITUCIONAL', 'INST', TRUE),
(72, 'institucional.config.documentacion.traslado', 'Config. Documentación Traslado', 'INSTITUCIONAL', 'INST', TRUE),
(73, 'institucional.config.complementario.discapacidad', 'Config. Discapacidad', 'INSTITUCIONAL', 'INST', TRUE),
(74, 'institucional.config.complementario.apoderados', 'Config. Apoderados', 'INSTITUCIONAL', 'INST', TRUE),
(75, 'institucional.config.complementario.idiomas', 'Config. Idiomas', 'INSTITUCIONAL', 'INST', TRUE),
(76, 'institucional.config.gestionar', 'Gestionar Configuración de Pagos (Sistema)', 'INSTITUCIONAL', 'INST', TRUE),
(77, 'institucional.config.historial_actividades', 'Ver Historial de Actividades', 'INSTITUCIONAL', 'INST', TRUE),

-- DOMINIO: REPORTES
(78, 'reportes.avance_academico', 'Reporte de Avance Académico', 'REPORTES', 'REP', TRUE),
(79, 'reportes.asistencia', 'Reporte de Asistencia', 'REPORTES', 'REP', TRUE),
(80, 'reportes.desercion', 'Reporte de Deserción', 'REPORTES', 'REP', TRUE),
(81, 'reportes.solicitudes.general', 'Reporte General de Solicitudes', 'REPORTES', 'REP', TRUE),
(82, 'reportes.solicitudes.becas', 'Reporte de Solicitudes de Becas', 'REPORTES', 'REP', TRUE),
(83, 'reportes.solicitudes.traspaso', 'Reporte de Solicitudes de Traspaso', 'REPORTES', 'REP', TRUE),
(84, 'reportes.solicitudes.pasantia', 'Reporte de Solicitudes de Pasantía', 'REPORTES', 'REP', TRUE),

-- DOMINIO: SEGURIDAD
(85, 'seguridad.usuario.crear', 'Crear Usuario', 'SEGURIDAD', 'SEG', TRUE),
(86, 'seguridad.usuario.administrar', 'Administrar Usuarios', 'SEGURIDAD', 'SEG', TRUE),
(87, 'seguridad.rol.gestionar', 'Administrar Roles y Permisos', 'SEGURIDAD', 'SEG', TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER (permisos)
-- ============================================