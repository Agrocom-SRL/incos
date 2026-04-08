-- ============================================
-- SEEDER: permisos v2
-- Sistema de Gestión Académica · Instituto INCOS
-- Archivo: backend/database/02-seeders/54-seed-permisos.sql
--
-- CAMBIOS respecto al legacy:
--   [NUEVO]   columnas grupo_ui y ruta_sidebar en todos los registros
--   [NUEVO]   dominio CONFIGURACION (separado de INSTITUCIONAL)
--   [NUEVO]   permisos 11-14: pasantías estudiantiles (antes en DOC, ahora en MAT)
--   [NUEVO]   permiso 37:     avance académico
--   [NUEVO]   permisos 81-83: convenios (cfg)
--   [NUEVO]   permiso 84:     config. pagos (cfg)
--   [NUEVO]   permiso 85:     historial actividades (cfg)
--   [TOTAL]   95 permisos (antes 87)
--
-- Ejecutar después de: 53-seed-roles.sql
-- Ejecutar antes de:   56-seed-permiso-acciones.sql, 55-seed-roles-permisos.sql
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO permisos (id, codigo, nombre, dominio, modulo, grupo_ui, ruta_sidebar, activo) VALUES

-- DOMINIO: MATRICULA (módulo sidebar: MAT)
(1,  'matricula.admision.ver',    'Admisión: listar, ver ficha; exportar Excel estadística de inscritos', 'MATRICULA', 'MAT', 'mat_admision', '/estudiantes/listar', TRUE),
(2,  'matricula.admision.crear',  'Admisión: registrar nuevo estudiante',             'MATRICULA', 'MAT', 'mat_admision',    '/estudiantes/listar',       TRUE),
(3,  'matricula.admision.editar', 'Admisión: editar datos, eliminar y activar',       'MATRICULA', 'MAT', 'mat_admision',    '/estudiantes/listar',       TRUE),
(4,  'matricula.inscribir',           'Matrículas: listar, ver y crear inscripción; exportar Excel lista por carrera', 'MATRICULA', 'MAT', 'mat_inscripcion', '/matricula/listar', TRUE),
(5,  'matricula.inscripcion.editar',  'Matrículas: editar y eliminar inscripción',   'MATRICULA', 'MAT', 'mat_inscripcion', '/matricula/listar',         TRUE),
(6,  'matricula.beca.ver',     'Becas: listar asignaciones y ver detalle',           'MATRICULA', 'MAT', 'mat_becas',       '/estudiantes/becas/listar', TRUE),
(7,  'matricula.beca.asignar', 'Becas: asignar, ajustar o quitar',                  'MATRICULA', 'MAT', 'mat_becas',       '/estudiantes/becas/listar', TRUE),
(8,  'matricula.beca.aprobar', 'Becas: aprobar solicitudes',                         'MATRICULA', 'MAT', 'mat_becas',       '/estudiantes/becas/listar', TRUE),
(9,  'matricula.documento.ver', 'Documentos: ver y generar PDFs (acta, declaración, formulario)', 'MATRICULA', 'MAT', 'mat_documentos', '/estudiantes/documentos', TRUE),
(10, 'matricula.pago.aporte.ver', 'Aportes: listar, anular, exportar recibo PDF y Excel estado por carrera', 'MATRICULA', 'MAT', 'mat_aportes', '/matricula/aportes/listar', TRUE),
(11, 'matricula.pasantia.ver',       'Pasantías estudiantiles: listar y ver',        'MATRICULA', 'MAT', 'mat_pasantias',   '/pasantias/listar',         TRUE),
(12, 'matricula.pasantia.solicitar', 'Pasantías estudiantiles: solicitar',           'MATRICULA', 'MAT', 'mat_pasantias',   '/pasantias/listar',         TRUE),
(13, 'matricula.pasantia.aprobar',   'Pasantías estudiantiles: aprobar',             'MATRICULA', 'MAT', 'mat_pasantias',   '/pasantias/listar',         TRUE),
(14, 'matricula.pasantia.evaluar',   'Pasantías estudiantiles: evaluación final',    'MATRICULA', 'MAT', 'mat_pasantias',   '/pasantias/listar',         TRUE),

-- DOMINIO: ACADEMICO (módulo sidebar: ACA)
(15, 'academico.calificacion.registrar.parcial',      'Calificaciones: registrar nota de parciales',    'ACADEMICO', 'ACA', 'aca_calificaciones', '/calificaciones', TRUE),
(16, 'academico.calificacion.registrar.practico',     'Calificaciones: registrar notas de prácticos',   'ACADEMICO', 'ACA', 'aca_calificaciones', '/calificaciones', TRUE),
(17, 'academico.calificacion.registrar.recuperatorio','Calificaciones: registrar recuperatorio',         'ACADEMICO', 'ACA', 'aca_calificaciones', '/calificaciones', TRUE),
(18, 'academico.calificacion.curso',                  'Calificaciones: ver notas por curso',            'ACADEMICO', 'ACA', 'aca_calificaciones', '/calificaciones', TRUE),
(19, 'academico.calificacion.periodo',                'Calificaciones: entregar notas por período',     'ACADEMICO', 'ACA', 'aca_calificaciones', '/calificaciones', TRUE),
(20, 'academico.calificacion.modificar',              'Calificaciones: modificar notas',                'ACADEMICO', 'ACA', 'aca_calificaciones', '/calificaciones', TRUE),
(21, 'academico.nivelacion.ver',       'Nivelaciones: listar y ver',                 'ACADEMICO', 'ACA', 'aca_nivelaciones',    '/nivelaciones/listar', TRUE),
(22, 'academico.nivelacion.inscribir', 'Nivelaciones: inscribir estudiante',          'ACADEMICO', 'ACA', 'aca_nivelaciones',    '/nivelaciones/listar', TRUE),
(23, 'academico.nivelacion.aprobar',   'Nivelaciones: aprobar',                       'ACADEMICO', 'ACA', 'aca_nivelaciones',    '/nivelaciones/listar', TRUE),
(24, 'academico.trazabilidad.traspaso.ver',        'Traspasos: listar y ver',         'ACADEMICO', 'ACA', 'aca_traspasos', '/transitabilidad/traspasos/listar', TRUE),
(25, 'academico.trazabilidad.traspaso.solicitar',  'Traspasos: solicitar (salida)',    'ACADEMICO', 'ACA', 'aca_traspasos', '/transitabilidad/traspasos/listar', TRUE),
(26, 'academico.trazabilidad.traspaso.recibir',    'Traspasos: recibir (entrada)',     'ACADEMICO', 'ACA', 'aca_traspasos', '/transitabilidad/traspasos/listar', TRUE),
(27, 'academico.trazabilidad.traspaso.convalidar', 'Traspasos: convalidar notas',      'ACADEMICO', 'ACA', 'aca_traspasos', '/transitabilidad/traspasos/listar', TRUE),
(28, 'academico.trazabilidad.traspaso.aprobar',    'Traspasos: aprobar',               'ACADEMICO', 'ACA', 'aca_traspasos', '/transitabilidad/traspasos/listar', TRUE),
(29, 'academico.trazabilidad.transitabilidad.ver',        'Transitabilidad: listar y ver',    'ACADEMICO', 'ACA', 'aca_transitabilidad', '/transitabilidad/transitabilidad/listar', TRUE),
(30, 'academico.trazabilidad.transitabilidad.solicitar',  'Transitabilidad: solicitar',        'ACADEMICO', 'ACA', 'aca_transitabilidad', '/transitabilidad/transitabilidad/listar', TRUE),
(31, 'academico.trazabilidad.transitabilidad.recibir',    'Transitabilidad: recibir',          'ACADEMICO', 'ACA', 'aca_transitabilidad', '/transitabilidad/transitabilidad/listar', TRUE),
(32, 'academico.trazabilidad.transitabilidad.convalidar', 'Transitabilidad: convalidar notas', 'ACADEMICO', 'ACA', 'aca_transitabilidad', '/transitabilidad/transitabilidad/listar', TRUE),
(33, 'academico.trazabilidad.transitabilidad.aprobar',    'Transitabilidad: aprobar',          'ACADEMICO', 'ACA', 'aca_transitabilidad', '/transitabilidad/transitabilidad/listar', TRUE),
(34, 'academico.historial.folio',    'Historial: gestionar folio del egresado',       'ACADEMICO', 'ACA', 'aca_historial', '/historial/academico', TRUE),
(35, 'academico.historial.academico','Historial: ver historial académico del alumno', 'ACADEMICO', 'ACA', 'aca_historial', '/historial/academico', TRUE),
(36, 'academico.historial.validar',  'Historial: validar para egreso',                'ACADEMICO', 'ACA', 'aca_historial', '/historial/academico', TRUE),
(37, 'academico.avance', 'Avance académico: ver progreso del estudiante en su carrera', 'ACADEMICO', 'ACA', 'aca_avance', '/academico/avance', TRUE),
(38, 'academico.licencia.ver',    'Licencias estudiantiles: listar y ver',            'ACADEMICO', 'ACA', 'aca_licencias_est', '/estudiantes/licencias/listar', TRUE),
(39, 'academico.licencia.crear',  'Licencias estudiantiles: solicitar',               'ACADEMICO', 'ACA', 'aca_licencias_est', '/estudiantes/licencias/listar', TRUE),
(40, 'academico.licencia.aprobar','Licencias estudiantiles: aprobar',                 'ACADEMICO', 'ACA', 'aca_licencias_est', '/estudiantes/licencias/listar', TRUE),

-- DOMINIO: DOCENTES (módulo sidebar: DOC)
(41, 'docentes.ver',    'Docentes: listar y ver ficha',                               'DOCENTES', 'DOC', 'doc_docentes',   '/docentes/listar', TRUE),
(42, 'docentes.crear',  'Docentes: registrar nuevo docente',                          'DOCENTES', 'DOC', 'doc_docentes',   '/docentes/listar', TRUE),
(43, 'docentes.asignar','Docentes: asignar a oferta académica',                       'DOCENTES', 'DOC', 'doc_docentes',   '/docentes/listar', TRUE),
(44, 'docentes.licencia.ver',    'Licencias docentes: listar y ver',                  'DOCENTES', 'DOC', 'doc_licencias',  '/docentes/licencias/listar', TRUE),
(45, 'docentes.licencia.crear',  'Licencias docentes: solicitar',                     'DOCENTES', 'DOC', 'doc_licencias',  '/docentes/licencias/listar', TRUE),
(46, 'docentes.licencia.aprobar','Licencias docentes: aprobar',                       'DOCENTES', 'DOC', 'doc_licencias',  '/docentes/licencias/listar', TRUE),
(47, 'docentes.supervision.evaluar',    'Supervisión: evaluar docente',               'DOCENTES', 'DOC', 'doc_supervision', '/supervision', TRUE),
(48, 'docentes.supervision.reporte',    'Supervisión: ver reportes',                  'DOCENTES', 'DOC', 'doc_supervision', '/supervision', TRUE),
(49, 'docentes.supervision.programar',  'Supervisión: programar sesión',              'DOCENTES', 'DOC', 'doc_supervision', '/supervision', TRUE),
(50, 'docentes.supervision.ficha.crear','Supervisión: crear ficha de evaluación',     'DOCENTES', 'DOC', 'doc_supervision', '/supervision', TRUE),
(51, 'docentes.supervision.ficha.editar','Supervisión: editar ficha de evaluación',   'DOCENTES', 'DOC', 'doc_supervision', '/supervision', TRUE),
(52, 'docentes.supervision.pasantia.solicitar',  'Pasantías docentes: solicitar',      'DOCENTES', 'DOC', 'doc_pasantias', '/supervision/pasantias', TRUE),
(53, 'docentes.supervision.pasantia.seguimiento','Pasantías docentes: seguimiento',    'DOCENTES', 'DOC', 'doc_pasantias', '/supervision/pasantias', TRUE),
(54, 'docentes.supervision.pasantia.evaluar',    'Pasantías docentes: evaluación final','DOCENTES','DOC', 'doc_pasantias', '/supervision/pasantias', TRUE),

-- DOMINIO: FINANZAS (módulo sidebar: FIN)
(55, 'finanzas.pago.ver',        'Pagos: listar, ver detalle; exportar recibos y Excel estado aportes por carrera', 'FINANZAS', 'FIN', 'fin_pagos', '/pagos/listar', TRUE),
(56, 'finanzas.pago.registrar',  'Pagos: registrar pago',                             'FINANZAS', 'FIN', 'fin_pagos',       '/pagos/listar',        TRUE),
(57, 'finanzas.pago.editar',     'Pagos: editar y eliminar pago',                     'FINANZAS', 'FIN', 'fin_pagos',       '/pagos/listar',        TRUE),
(58, 'finanzas.pago.adicionales','Pagos adicionales: gestionar',                      'FINANZAS', 'FIN', 'fin_adicionales', '/pagos/adicionales',   TRUE),
(59, 'finanzas.pago.reporte.carrera',   'Reportes de pagos: por carrera',             'FINANZAS', 'FIN', 'fin_reportes',    '/pagos/reportes',      TRUE),
(60, 'finanzas.pago.reporte.estudiante','Reportes de pagos: por estudiante',          'FINANZAS', 'FIN', 'fin_reportes',    '/pagos/reportes',      TRUE),
(61, 'finanzas.pago.reporte.gestion',   'Reportes de pagos: por gestión',             'FINANZAS', 'FIN', 'fin_reportes',    '/pagos/reportes',      TRUE),

-- DOMINIO: INSTITUCIONAL (módulo sidebar: INST)
(62, 'institucional.gestion.actual',    'Gestión actual: ver',                        'INSTITUCIONAL', 'INST', 'inst_gestion',    '/gestiones/actual',          TRUE),
(63, 'institucional.gestion.cronograma','Cronogramas: gestionar',                     'INSTITUCIONAL', 'INST', 'inst_cronograma', '/gestiones/cronograma',      TRUE),
(64, 'institucional.gestion.oferta',    'Oferta académica: gestionar',                'INSTITUCIONAL', 'INST', 'inst_oferta',     '/gestiones/oferta',          TRUE),
(65, 'institucional.gestion.horarios',  'Horarios: asignar',                          'INSTITUCIONAL', 'INST', 'inst_horarios',   '/gestiones/horarios/asignar',TRUE),
(66, 'institucional.oferta.gestionar',  'Inscripción por materia o curso',            'INSTITUCIONAL', 'INST', 'inst_oferta',     '/gestiones/oferta',          TRUE),
(67, 'institucional.horario.asignar',   'Generar horarios',                           'INSTITUCIONAL', 'INST', 'inst_horarios',   '/gestiones/horarios/asignar',TRUE),
(68, 'institucional.gestion.pasadas',   'Gestiones pasadas: ver',                     'INSTITUCIONAL', 'INST', 'inst_pasadas',    '/gestiones/pasadas',         TRUE),

-- DOMINIO: CONFIGURACION (módulo sidebar: CFG)
(69, 'cfg.academico.carreras', 'Config. académica: carreras',                         'CONFIGURACION', 'CFG', 'cfg_academico', '/configuracion/academico', TRUE),
(70, 'cfg.academico.materias', 'Config. académica: materias',                         'CONFIGURACION', 'CFG', 'cfg_academico', '/configuracion/academico', TRUE),
(71, 'cfg.academico.plan',     'Config. académica: plan de estudios',                 'CONFIGURACION', 'CFG', 'cfg_academico', '/configuracion/academico', TRUE),
(72, 'cfg.academico.cursos',   'Config. académica: cursos/paralelos',                 'CONFIGURACION', 'CFG', 'cfg_academico', '/configuracion/academico', TRUE),
(73, 'cfg.academico.turnos',   'Config. académica: turnos',                           'CONFIGURACION', 'CFG', 'cfg_academico', '/configuracion/academico', TRUE),
(74, 'cfg.documentacion.inscripcion', 'Config. documentación: inscripción',           'CONFIGURACION', 'CFG', 'cfg_documentacion', '/configuracion/documentacion', TRUE),
(75, 'cfg.documentacion.becas',       'Config. documentación: becas',                 'CONFIGURACION', 'CFG', 'cfg_documentacion', '/configuracion/documentacion', TRUE),
(76, 'cfg.documentacion.pasantias',   'Config. documentación: pasantías',             'CONFIGURACION', 'CFG', 'cfg_documentacion', '/configuracion/documentacion', TRUE),
(77, 'cfg.documentacion.traslado',    'Config. documentación: traslado',              'CONFIGURACION', 'CFG', 'cfg_documentacion', '/configuracion/documentacion', TRUE),
(78, 'cfg.complementario.discapacidad', 'Datos complementarios: discapacidad',        'CONFIGURACION', 'CFG', 'cfg_complementario', '/configuracion/complementario', TRUE),
(79, 'cfg.complementario.apoderados',   'Datos complementarios: apoderados',          'CONFIGURACION', 'CFG', 'cfg_complementario', '/configuracion/complementario', TRUE),
(80, 'cfg.complementario.idiomas',      'Datos complementarios: idiomas',             'CONFIGURACION', 'CFG', 'cfg_complementario', '/configuracion/complementario', TRUE),
(81, 'cfg.convenios.ver',    'Convenios: listar empresas e instituciones',            'CONFIGURACION', 'CFG', 'cfg_convenios', '/configuracion/convenios', TRUE),
(82, 'cfg.convenios.crear',  'Convenios: registrar empresa/institución',              'CONFIGURACION', 'CFG', 'cfg_convenios', '/configuracion/convenios', TRUE),
(83, 'cfg.convenios.editar', 'Convenios: editar empresa/institución',                 'CONFIGURACION', 'CFG', 'cfg_convenios', '/configuracion/convenios', TRUE),
(84, 'cfg.pagos.gestionar', 'Config. de pagos: gestionar aranceles y cuotas',        'CONFIGURACION', 'CFG', 'cfg_pagos', '/pagos/configuracion', TRUE),
(85, 'cfg.historial_actividades', 'Historial de actividades del sistema',             'CONFIGURACION', 'CFG', 'cfg_historial', '/configuracion/historial-actividades', TRUE),

-- DOMINIO: REPORTES (módulo sidebar: REP)
(86, 'reportes.avance_academico',    'Reporte de avance académico',                   'REPORTES', 'REP', 'rep_avance',      '/reportes/avance-academico', TRUE),
(87, 'reportes.asistencia',          'Reporte de asistencia',                         'REPORTES', 'REP', 'rep_asistencia',  '/reportes/asistencia',       TRUE),
(88, 'reportes.desercion',           'Reporte de deserción',                          'REPORTES', 'REP', 'rep_desercion',   '/reportes/desercion',        TRUE),
(89, 'reportes.solicitudes.general', 'Reporte general de solicitudes',                'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes',      TRUE),
(90, 'reportes.solicitudes.becas',   'Reporte de solicitudes de becas',               'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes',      TRUE),
(91, 'reportes.solicitudes.traspaso','Reporte de solicitudes de traspaso',            'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes',      TRUE),
(92, 'reportes.solicitudes.pasantia','Reporte de solicitudes de pasantía',            'REPORTES', 'REP', 'rep_solicitudes', '/reportes/solicitudes',      TRUE),

-- DOMINIO: SEGURIDAD (módulo sidebar: SEG)
(93, 'seguridad.usuario.crear',      'Usuarios: crear nuevo usuario',                 'SEGURIDAD', 'SEG', 'seg_usuarios', '/seguridad/usuarios', TRUE),
(94, 'seguridad.usuario.administrar','Usuarios: listar, ver y administrar',           'SEGURIDAD', 'SEG', 'seg_usuarios', '/seguridad/usuarios', TRUE),
(95, 'seguridad.rol.gestionar',      'Roles y permisos: ver y administrar',           'SEGURIDAD', 'SEG', 'seg_roles',    '/seguridad/roles',    TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- Verificación post-insert:
-- SELECT COUNT(*) FROM permisos WHERE activo = 1;                        -- 95
-- SELECT COUNT(*) FROM permisos WHERE grupo_ui IS NULL AND activo = 1;   -- 0
-- SELECT COUNT(*) FROM permisos WHERE ruta_sidebar IS NULL AND activo=1; -- 0
