-- ============================================
-- SEEDER: permisos v3
-- Sistema de Gestión Académica · Instituto INCOS
-- Archivo: backend/database/02-seeders/54-seed-permisos.sql
--
-- Orden: por módulo (MAT → ACA → DOC → FIN → INST → CFG → REP → SEG → SYS).
-- Calificaciones (ACA): un permiso por pantalla/ruta en routes.jsx.
--   15 ingreso (menú) · 16 coordinación (vista general docentes)
--   17 mis cursos · 18 cuaderno · 19 política · 20 tablero
--   21-24 operación en cuaderno (parcial, práctico, recuperatorio, modificar)
--
-- [TOTAL] 105 permisos
-- Ejecutar después de: 53-seed-roles.sql
-- Ejecutar antes de:   56-seed-permiso-acciones.sql, 55-seed-roles-permisos.sql
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO permisos (id, codigo, nombre, dominio, modulo, grupo_ui, ruta_sidebar, activo) VALUES

-- ── MATRICULA (MAT) ─────────────────────────────────────────────────────────
(1,  'matricula.admision.ver',    'Admisión: listar, ver ficha; exportar Excel estadística de inscritos', 'MATRICULA', 'MAT', 'mat_admision', '/estudiantes/listar', TRUE),
(2,  'matricula.admision.crear',  'Admisión: registrar nuevo estudiante',             'MATRICULA', 'MAT', 'mat_admision',    '/estudiantes/listar',       TRUE),
(3,  'matricula.admision.editar', 'Admisión: editar datos, eliminar y activar',       'MATRICULA', 'MAT', 'mat_admision',    '/estudiantes/listar',       TRUE),
(4,  'matricula.inscribir',           'Matrículas: listar, ver y crear inscripción; exportar Excel lista por carrera', 'MATRICULA', 'MAT', 'mat_inscripcion', '/matricula/listar', TRUE),
(5,  'matricula.inscripcion.editar',  'Matrículas: editar y eliminar inscripción',   'MATRICULA', 'MAT', 'mat_inscripcion', '/matricula/listar',         TRUE),
(6,  'matricula.beca.ver',     'Becas: listar asignaciones, ver detalle de asignación y ficha desde contexto', 'MATRICULA', 'MAT', 'mat_becas', '/estudiantes/becas/listar', TRUE),
(7,  'matricula.beca.asignar', 'Becas: asignar, ajustar o quitar',                  'MATRICULA', 'MAT', 'mat_becas',       '/estudiantes/becas/listar', TRUE),
(8,  'matricula.beca.aprobar', 'Becas: aprobar solicitudes',                         'MATRICULA', 'MAT', 'mat_becas',       '/estudiantes/becas/listar', TRUE),
(9,  'matricula.documento.ver', 'Documentos: ver y generar PDFs (acta, declaración, formulario)', 'MATRICULA', 'MAT', 'mat_documentos', '/estudiantes/documentos', TRUE),
(10, 'matricula.pago.aporte.ver', 'Aportes: listar, detalle, editar cuotas, anular, exportar recibo PDF y Excel estado por carrera', 'MATRICULA', 'MAT', 'mat_aportes', '/matricula/aportes/listar', TRUE),
(11, 'matricula.pasantia.ver',       'Pasantías estudiantiles: listar y ver',        'MATRICULA', 'MAT', 'mat_pasantias',   '/pasantias/listar',         TRUE),
(12, 'matricula.pasantia.solicitar', 'Pasantías estudiantiles: solicitar',           'MATRICULA', 'MAT', 'mat_pasantias',   '/pasantias/listar',         TRUE),
(13, 'matricula.pasantia.aprobar',   'Pasantías estudiantiles: aprobar',             'MATRICULA', 'MAT', 'mat_pasantias',   '/pasantias/listar',         TRUE),
(14, 'matricula.pasantia.evaluar',   'Pasantías estudiantiles: evaluación final',    'MATRICULA', 'MAT', 'mat_pasantias',   '/pasantias/listar',         TRUE),

-- ── ACADÉMICO · Calificaciones (ACA) — alineado con calificaciones/routes.jsx ─
(15, 'academico.calificacion.ingreso',        'Calificaciones: ítem del menú Académico',                         'ACADEMICO', 'ACA', 'aca_calificaciones', '/academico/calificaciones', TRUE),
(16, 'academico.calificacion.coordinacion',   'Calificaciones: vista general — docentes y cursos de la gestión', 'ACADEMICO', 'ACA', 'aca_calificaciones', '/academico/calificaciones', TRUE),
(17, 'academico.calificacion.mis_cursos',     'Calificaciones: mis cursos del docente',                          'ACADEMICO', 'ACA', 'aca_calificaciones', '/academico/calificaciones/docente/:docenteId', TRUE),
(18, 'academico.calificacion.cuaderno',       'Calificaciones: cuaderno de notas del curso',                     'ACADEMICO', 'ACA', 'aca_calificaciones', '/academico/calificaciones/docente/:docenteId/curso/:cursoId', TRUE),
(19, 'academico.calificacion.politica',       'Calificaciones: política institucional (Nivel 1)',                'ACADEMICO', 'ACA', 'aca_calificaciones', '/academico/calificaciones/politica', TRUE),
(20, 'academico.calificacion.tablero',        'Calificaciones: tablero de coordinación del año (Nivel 2)',       'ACADEMICO', 'ACA', 'aca_calificaciones', '/academico/calificaciones/tablero', TRUE),
(21, 'academico.calificacion.registrar.parcial',      'Calificaciones · cuaderno: registrar nota de parciales',   'ACADEMICO', 'ACA', 'aca_calificaciones', '/academico/calificaciones/docente/:docenteId/curso/:cursoId', TRUE),
(22, 'academico.calificacion.registrar.practico',     'Calificaciones · cuaderno: registrar notas de prácticos',  'ACADEMICO', 'ACA', 'aca_calificaciones', '/academico/calificaciones/docente/:docenteId/curso/:cursoId', TRUE),
(23, 'academico.calificacion.registrar.recuperatorio','Calificaciones · cuaderno: registrar recuperatorio',        'ACADEMICO', 'ACA', 'aca_calificaciones', '/academico/calificaciones/docente/:docenteId/curso/:cursoId', TRUE),
(24, 'academico.calificacion.modificar',              'Calificaciones · cuaderno: modificar notas cargadas',      'ACADEMICO', 'ACA', 'aca_calificaciones', '/academico/calificaciones/docente/:docenteId/curso/:cursoId', TRUE),

-- ── ACADÉMICO · resto ───────────────────────────────────────────────────────
(25, 'academico.nivelacion.ver',       'Nivelaciones: listar y ver',                 'ACADEMICO', 'ACA', 'aca_nivelaciones',    '/academico/nivelaciones/listar', TRUE),
(26, 'academico.nivelacion.inscribir', 'Nivelaciones: inscribir estudiante',          'ACADEMICO', 'ACA', 'aca_nivelaciones',    '/academico/nivelaciones/listar', TRUE),
(27, 'academico.nivelacion.aprobar',   'Nivelaciones: aprobar',                       'ACADEMICO', 'ACA', 'aca_nivelaciones',    '/academico/nivelaciones/listar', TRUE),
(28, 'academico.trazabilidad.traspaso.ver',        'Traspasos: listar y ver',         'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', TRUE),
(29, 'academico.trazabilidad.traspaso.solicitar',  'Traspasos: solicitar (salida)',    'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', TRUE),
(30, 'academico.trazabilidad.traspaso.recibir',    'Traspasos: recibir (entrada)',     'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', TRUE),
(31, 'academico.trazabilidad.traspaso.convalidar', 'Traspasos: convalidar notas',      'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', TRUE),
(32, 'academico.trazabilidad.traspaso.aprobar',    'Traspasos: aprobar',               'ACADEMICO', 'ACA', 'aca_traspasos', '/academico/traspasos/listar', TRUE),
(33, 'academico.trazabilidad.transitabilidad.ver',        'Transitabilidad: listar y ver',    'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', TRUE),
(34, 'academico.trazabilidad.transitabilidad.solicitar',  'Transitabilidad: solicitar',        'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', TRUE),
(35, 'academico.trazabilidad.transitabilidad.recibir',    'Transitabilidad: recibir',          'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', TRUE),
(36, 'academico.trazabilidad.transitabilidad.convalidar', 'Transitabilidad: convalidar notas', 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', TRUE),
(37, 'academico.trazabilidad.transitabilidad.aprobar',    'Transitabilidad: aprobar',          'ACADEMICO', 'ACA', 'aca_transitabilidad', '/academico/transitabilidad/listar', TRUE),
(38, 'academico.historial.folio',    'Historial: gestionar folio del egresado',       'ACADEMICO', 'ACA', 'aca_historial', '/academico/historial/academico', TRUE),
(39, 'academico.historial.academico','Historial: ver historial académico del alumno', 'ACADEMICO', 'ACA', 'aca_historial', '/academico/historial/academico', TRUE),
(40, 'academico.historial.validar',  'Historial: validar para egreso',                'ACADEMICO', 'ACA', 'aca_historial', '/academico/historial/academico', TRUE),
(41, 'academico.avance', 'Avance académico: ver progreso del estudiante en su carrera', 'ACADEMICO', 'ACA', 'aca_avance', '/academico/avance', TRUE),
(42, 'academico.licencia.ver',    'Licencias estudiantiles: listar y ver',            'ACADEMICO', 'ACA', 'aca_licencias_est', '/academico/licencias/listar', TRUE),
(43, 'academico.licencia.crear',  'Licencias estudiantiles: solicitar',               'ACADEMICO', 'ACA', 'aca_licencias_est', '/academico/licencias/listar', TRUE),
(44, 'academico.licencia.aprobar','Licencias estudiantiles: aprobar',                 'ACADEMICO', 'ACA', 'aca_licencias_est', '/academico/licencias/listar', TRUE),

-- ── DOCENTES (DOC) ──────────────────────────────────────────────────────────
(45, 'docentes.ver',    'Docentes: listar y ver ficha',                               'DOCENTES', 'DOC', 'doc_docentes',   '/docentes/listar', TRUE),
(46, 'docentes.crear',  'Docentes: registrar nuevo docente',                          'DOCENTES', 'DOC', 'doc_docentes',   '/docentes/listar', TRUE),
(47, 'docentes.asignar','Docentes: asignar a oferta académica',                       'DOCENTES', 'DOC', 'doc_docentes',   '/docentes/listar', TRUE),
(48, 'docentes.licencia.ver',    'Licencias docentes: listar y ver',                  'DOCENTES', 'DOC', 'doc_licencias',  '/docentes/licencias/listar', TRUE),
(49, 'docentes.licencia.crear',  'Licencias docentes: solicitar',                     'DOCENTES', 'DOC', 'doc_licencias',  '/docentes/licencias/listar', TRUE),
(50, 'docentes.licencia.aprobar','Licencias docentes: aprobar',                       'DOCENTES', 'DOC', 'doc_licencias',  '/docentes/licencias/listar', TRUE),
(51, 'docentes.supervision.evaluar',    'Supervisión: evaluar docente',               'DOCENTES', 'DOC', 'doc_supervision', '/supervision', TRUE),
(52, 'docentes.supervision.reporte',    'Supervisión: ver reportes',                  'DOCENTES', 'DOC', 'doc_supervision', '/supervision', TRUE),
(53, 'docentes.supervision.programar',  'Supervisión: programar sesión',              'DOCENTES', 'DOC', 'doc_supervision', '/supervision', TRUE),
(54, 'docentes.supervision.ficha.crear','Supervisión: crear ficha de evaluación',     'DOCENTES', 'DOC', 'doc_supervision', '/supervision', TRUE),
(55, 'docentes.supervision.ficha.editar','Supervisión: editar ficha de evaluación',   'DOCENTES', 'DOC', 'doc_supervision', '/supervision', TRUE),
(56, 'docentes.supervision.pasantia.solicitar',  'Pasantías docentes: solicitar',      'DOCENTES', 'DOC', 'doc_pasantias', '/supervision/pasantias', TRUE),
(57, 'docentes.supervision.pasantia.seguimiento','Pasantías docentes: seguimiento',    'DOCENTES', 'DOC', 'doc_pasantias', '/supervision/pasantias', TRUE),
(58, 'docentes.supervision.pasantia.evaluar',    'Pasantías docentes: evaluación final','DOCENTES','DOC', 'doc_pasantias', '/supervision/pasantias', TRUE),
(59, 'docentes.editar',              'Docentes: editar ficha y eliminar o desactivar registro', 'DOCENTES', 'DOC', 'doc_docentes', '/docentes/listar', TRUE),

-- ── FINANZAS (FIN) ──────────────────────────────────────────────────────────
(60, 'finanzas.pago.ver',        'Pagos: listar, ver detalle; exportar recibos y Excel estado aportes por carrera', 'FINANZAS', 'FIN', 'fin_pagos', '/pagos/listar', TRUE),
(61, 'finanzas.pago.registrar',  'Pagos: registrar pago',                             'FINANZAS', 'FIN', 'fin_pagos',       '/pagos/listar',        TRUE),
(62, 'finanzas.pago.editar',     'Pagos: editar y eliminar pago',                     'FINANZAS', 'FIN', 'fin_pagos',       '/pagos/listar',        TRUE),
(63, 'finanzas.pago.adicionales','Pagos adicionales: gestionar',                      'FINANZAS', 'FIN', 'fin_adicionales', '/pagos/adicionales',   TRUE),
(64, 'finanzas.pago.reporte.carrera',   'Reportes de pagos: por carrera',             'FINANZAS', 'FIN', 'fin_reportes',    '/pagos/reportes',      TRUE),
(65, 'finanzas.pago.reporte.estudiante','Reportes de pagos: por estudiante',          'FINANZAS', 'FIN', 'fin_reportes',    '/pagos/reportes',      TRUE),
(66, 'finanzas.pago.reporte.gestion',   'Reportes de pagos: por gestión',             'FINANZAS', 'FIN', 'fin_reportes',    '/pagos/reportes',      TRUE),

-- ── INSTITUCIONAL (INST) ────────────────────────────────────────────────────
(67, 'institucional.gestion.actual',    'Gestión actual: ver',                        'INSTITUCIONAL', 'INST', 'inst_gestion',    '/institucional/actual',                  TRUE),
(68, 'institucional.gestion.cronograma','Cronogramas: gestionar',                     'INSTITUCIONAL', 'INST', 'inst_cronograma', '/institucional/cronogramas',             TRUE),
(69, 'institucional.gestion.oferta',    'Oferta académica: gestionar',                'INSTITUCIONAL', 'INST', 'inst_oferta',     '/institucional/oferta',                  TRUE),
(70, 'institucional.gestion.horarios',  'Horarios: asignar',                          'INSTITUCIONAL', 'INST', 'inst_horarios',   '/institucional/horarios',                TRUE),
(71, 'institucional.oferta.gestionar',  'Inscripción por materia o curso',            'INSTITUCIONAL', 'INST', 'inst_oferta',     '/institucional/oferta',                  TRUE),
(72, 'institucional.horario.asignar',   'Generar horarios',                           'INSTITUCIONAL', 'INST', 'inst_horarios',   '/institucional/horarios/generar',        TRUE),
(73, 'institucional.gestion.pasadas',   'Gestiones pasadas: ver',                     'INSTITUCIONAL', 'INST', 'inst_pasadas',    '/institucional/pasadas',                 TRUE),
(74, 'institucional.horario.plantilla',  'Gestión de horarios: trabajar plantilla base',         'INSTITUCIONAL', 'INST', 'inst_horarios_plantilla', '/institucional/horarios/plantilla',      TRUE),
(75, 'institucional.horario.armado',     'Gestión de horarios: armado operativo de bloques',     'INSTITUCIONAL', 'INST', 'inst_horarios_armado', '/institucional/horarios/armado',         TRUE),
(76, 'institucional.horario.conflictos', 'Gestión de horarios: revisión y resolución de conflictos (UI en armado)', 'INSTITUCIONAL', 'INST', 'inst_horarios_armado', '/institucional/horarios/armado', TRUE),
(77, 'institucional.horario.publicacion', 'Gestión de horarios: publicación de horarios vigentes', 'INSTITUCIONAL', 'INST', 'inst_horarios_publicacion', '/institucional/horarios/publicacion',    TRUE),

-- ── CONFIGURACIÓN (CFG) ─────────────────────────────────────────────────────
(78, 'cfg.academico.carreras', 'Config. académica: carreras',                         'CONFIGURACION', 'CFG', 'cfg_academico', '/configuracion/academico', TRUE),
(79, 'cfg.academico.materias', 'Config. académica: materias',                         'CONFIGURACION', 'CFG', 'cfg_academico', '/configuracion/academico', TRUE),
(80, 'cfg.academico.plan',     'Config. académica: plan de estudios',                 'CONFIGURACION', 'CFG', 'cfg_academico', '/configuracion/academico', TRUE),
(81, 'cfg.academico.cursos',   'Config. académica: cursos/paralelos',                 'CONFIGURACION', 'CFG', 'cfg_academico', '/configuracion/academico', TRUE),
(82, 'cfg.academico.turnos',   'Config. académica: turnos',                           'CONFIGURACION', 'CFG', 'cfg_academico', '/configuracion/academico', TRUE),
(83, 'cfg.documentacion.inscripcion', 'Config. documentación: inscripción',           'CONFIGURACION', 'CFG', 'cfg_documentacion', '/configuracion/documentacion', TRUE),
(84, 'cfg.documentacion.becas',       'Config. documentación: becas',                 'CONFIGURACION', 'CFG', 'cfg_documentacion', '/configuracion/documentacion', TRUE),
(85, 'cfg.documentacion.pasantias',   'Config. documentación: pasantías',             'CONFIGURACION', 'CFG', 'cfg_documentacion', '/configuracion/documentacion', TRUE),
(86, 'cfg.documentacion.traslado',    'Config. documentación: traslado',              'CONFIGURACION', 'CFG', 'cfg_documentacion', '/configuracion/documentacion', TRUE),
(87, 'cfg.complementario.discapacidad', 'Datos complementarios: discapacidad',        'CONFIGURACION', 'CFG', 'cfg_complementario', '/configuracion/datos-complementarios', TRUE),
(88, 'cfg.complementario.apoderados',   'Datos complementarios: apoderados',          'CONFIGURACION', 'CFG', 'cfg_complementario', '/configuracion/datos-complementarios', TRUE),
(89, 'cfg.complementario.idiomas',      'Datos complementarios: idiomas',             'CONFIGURACION', 'CFG', 'cfg_complementario', '/configuracion/datos-complementarios', TRUE),
(90, 'cfg.convenios.ver',    'Convenios: listar empresas e instituciones',            'CONFIGURACION', 'CFG', 'cfg_convenios', '/configuracion/convenios', TRUE),
(91, 'cfg.convenios.crear',  'Convenios: registrar empresa/institución',              'CONFIGURACION', 'CFG', 'cfg_convenios', '/configuracion/convenios', TRUE),
(92, 'cfg.convenios.editar', 'Convenios: editar empresa/institución',                 'CONFIGURACION', 'CFG', 'cfg_convenios', '/configuracion/convenios', TRUE),
(93, 'cfg.pagos.gestionar', 'Config. de pagos: gestionar aranceles y cuotas',        'CONFIGURACION', 'CFG', 'cfg_pagos', '/pagos/configuracion', TRUE),
(94, 'cfg.historial_actividades', 'Historial de actividades del sistema',             'CONFIGURACION', 'CFG', 'cfg_historial', '/configuracion/historial-actividades', TRUE),

-- ── REPORTES (REP) ────────────────────────────────────────────────────────────
(95, 'reportes.avance_academico',    'Reporte de avance académico',                   'REPORTES', 'REP', 'rep_avance',      '/reportes/avance-academico', TRUE),
(96, 'reportes.asistencia',          'Reporte de asistencia',                         'REPORTES', 'REP', 'rep_asistencia',  '/reportes/asistencia',       TRUE),
(97, 'reportes.desercion',           'Reporte de deserción',                          'REPORTES', 'REP', 'rep_desercion',   '/reportes/desercion',        TRUE),
(98, 'reportes.solicitudes.general', 'Reporte general de solicitudes',                'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes',      TRUE),
(99, 'reportes.solicitudes.becas',   'Reporte de solicitudes de becas',               'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes',      TRUE),
(100, 'reportes.solicitudes.traspaso','Reporte de solicitudes de traspaso',            'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes',      TRUE),
(101, 'reportes.solicitudes.pasantia','Reporte de solicitudes de pasantía',            'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes',      TRUE),

-- ── SEGURIDAD (SEG) ───────────────────────────────────────────────────────────
(102, 'seguridad.usuario.crear',      'Usuarios: crear nuevo usuario',                 'SEGURIDAD', 'SEG', 'seg_usuarios', '/seguridad/usuarios', TRUE),
(103, 'seguridad.usuario.administrar','Usuarios: listar, ver y administrar',           'SEGURIDAD', 'SEG', 'seg_usuarios', '/seguridad/usuarios', TRUE),
(104, 'seguridad.rol.gestionar',      'Roles y permisos: ver y administrar',           'SEGURIDAD', 'SEG', 'seg_roles',    '/seguridad/roles',    TRUE),

-- ── SISTEMA (SYS) ───────────────────────────────────────────────────────────
(105, 'sistema.catalogo.referencia', 'Catálogos de referencia: APIs transversales para combos (ubicación, tipos, bancos, etc.)', 'SISTEMA', 'SYS', NULL, NULL, TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- Verificación post-insert:
-- SELECT COUNT(*) FROM permisos WHERE activo = 1;                        -- 105
-- SELECT COUNT(*) FROM permisos WHERE grupo_ui IS NULL AND activo = 1;   -- 1 (105)
-- SELECT id, codigo FROM permisos WHERE modulo = 'ACA' AND codigo LIKE 'academico.calificacion%' ORDER BY id;
