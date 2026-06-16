-- ============================================
-- SEEDER: actividades_calendario
-- Sistema de Gestión Académica - Instituto INCOS
-- Solo gestión vigente 2026 (mismo criterio que gestiones_planes y periodos_academicos)
-- ============================================
-- Periodos 2026: ids 1-6 (PLAN, BIM1-BIM4, CLAU)
-- Actividades: 1-48 (catálogo maestro)
-- Feriados 2026 según calendario oficial de Bolivia

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE actividades_calendario;

-- ============================================
-- GESTIÓN 2026 (VIGENTE)
-- Inicio: lunes 19 enero 2026
-- Feriados 2026: Estado Plurinacional (22 ene), Carnaval (16-17 feb), Viernes Santo (3 abr),
-- Día Trabajo (1 may), Corpus Christi (4 jun), Año Nuevo Aymara (22 jun), Día Patria (6 ago),
-- Efemérides (24 sep), Fieles Difuntos (2 nov)
-- ============================================

-- PERIODO DE INSCRIPCIÓN Y PLANIFICACIÓN (periodo_id = 1)
INSERT INTO actividades_calendario (id, periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin, nombre_personalizado) VALUES
(1, 1, 1, '2026-PLAN-001', '2026-01-19', '2026-02-28', NULL),  -- Inscripción
(2, 1, 25, '2026-PLAN-002', '2026-01-22', NULL, NULL),  -- Feriado Estado Plurinacional
(3, 1, 2, '2026-PLAN-003', '2026-02-03', '2026-02-07', NULL);  -- Planificación

-- PRIMER BIMESTRE (periodo_id = 2)
INSERT INTO actividades_calendario (id, periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin, nombre_personalizado) VALUES
(4, 2, 3, '2026-BIM1-001', '2026-02-24', NULL, NULL),  -- Inauguración
(5, 2, 4, '2026-BIM1-002', '2026-02-24', '2026-03-01', NULL),  -- Diagnóstico
(6, 2, 5, '2026-BIM1-003', '2026-03-02', '2026-03-13', 'Desarrollo de avance curricular, evaluación permanente'),
(7, 2, 6, '2026-BIM1-004', '2026-02-24', NULL, 'Recepción de solicitudes de pasantías - 3er año'),
(8, 2, 26, '2026-BIM1-005', '2026-02-16', '2026-02-17', NULL),  -- Carnaval
(9, 2, 7, '2026-BIM1-006', '2026-03-14', NULL, 'Presentación de Planificación Anual de Asignatura, plan quincenal a Dirección Académica en la plataforma y en físico'),
(10, 2, 8, '2026-BIM1-007', '2026-03-20', NULL, 'Elección de Modalidad de Grado Formulario FDMG - 1'),
(11, 2, 9, '2026-BIM1-008', '2026-03-02', '2026-03-21', 'Aprobación de perfiles de proyectos de grado - 3er año'),
(12, 2, 10, '2026-BIM1-009', '2026-03-02', '2026-03-21', 'Presentación de perfiles a Dirección Académica - 3er año'),
(13, 2, 11, '2026-BIM1-010', '2026-03-21', NULL, 'Convocatoria para Feria Productiva interna - 3er año'),
(14, 2, 12, '2026-BIM1-011', '2026-03-22', '2026-04-05', NULL),  -- Designación Tutores
(15, 2, 5, '2026-BIM1-012', '2026-03-02', '2026-04-02', NULL),  -- Desarrollo marzo
(16, 2, 5, '2026-BIM1-013', '2026-04-04', '2026-04-24', NULL),  -- Desarrollo abril
(17, 2, 27, '2026-BIM1-014', '2026-04-03', NULL, NULL),  -- Viernes Santo
(18, 2, 19, '2026-BIM1-015', '2026-04-26', NULL, 'Presentación de calificaciones del Primer Bimestre'),
(19, 2, 20, '2026-BIM1-016', '2026-04-27', NULL, 'Consejo de Docentes del Primer Bimestre'),
(20, 2, 13, '2026-BIM1-017', '2026-05-02', NULL, 'Feria Productiva interna - 3er año'),
(21, 2, 21, '2026-BIM1-018', '2026-04-27', '2026-05-08', 'Entrega de calificaciones del Primer Parcial, estadísticas, informe y presentación de Registro Pedagógico'),
(22, 2, 22, '2026-BIM1-019', '2026-05-08', NULL, 'Entrega de boletines del Primer Bimestre');

-- SEGUNDO BIMESTRE (periodo_id = 3)
INSERT INTO actividades_calendario (id, periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin, nombre_personalizado) VALUES
(23, 3, 28, '2026-BIM2-001', '2026-05-01', NULL, NULL),  -- Día del Trabajo
(24, 3, 5, '2026-BIM2-002', '2026-05-02', '2026-05-31', NULL),  -- Desarrollo mayo
(25, 3, 34, '2026-BIM2-003', '2026-05-18', NULL, NULL),  -- Día del Contador
(26, 3, 35, '2026-BIM2-004', '2026-05-18', NULL, NULL),  -- Taller Contador
(27, 3, 5, '2026-BIM2-005', '2026-06-01', '2026-06-21', NULL),  -- Desarrollo junio
(28, 3, 36, '2026-BIM2-006', '2026-06-06', NULL, NULL),  -- Día del Maestro
(29, 3, 29, '2026-BIM2-007', '2026-06-04', NULL, NULL),  -- Corpus Christi
(30, 3, 30, '2026-BIM2-008', '2026-06-22', NULL, NULL),  -- Año Nuevo Aymara
(31, 3, 11, '2026-BIM2-009', '2026-06-30', NULL, 'Convocatoria para Feria Productiva interna - 2do año'),
(32, 3, 37, '2026-BIM2-010', '2026-07-13', '2026-07-24', NULL),  -- Receso
(33, 3, 5, '2026-BIM2-011', '2026-07-25', '2026-07-29', NULL),  -- Desarrollo julio
(34, 3, 19, '2026-BIM2-012', '2026-07-29', NULL, 'Presentación de calificaciones del Segundo Bimestre'),
(35, 3, 20, '2026-BIM2-013', '2026-08-05', NULL, 'Consejo de Docentes del Segundo Bimestre'),
(36, 3, 21, '2026-BIM2-014', '2026-07-26', '2026-08-01', 'Entrega de calificaciones del Segundo Bimestre, estadísticas, informe y presentación de Registro Pedagógico'),
(37, 3, 22, '2026-BIM2-015', '2026-08-07', NULL, 'Entrega de boletines del Segundo Bimestre');

-- TERCER BIMESTRE (periodo_id = 4)
INSERT INTO actividades_calendario (id, periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin, nombre_personalizado) VALUES
(38, 4, 5, '2026-BIM3-001', '2026-08-03', '2026-08-07', NULL),  -- Desarrollo julio
(39, 4, 5, '2026-BIM3-002', '2026-08-10', '2026-08-31', NULL),  -- Desarrollo agosto
(40, 4, 38, '2026-BIM3-003', '2026-08-03', '2026-08-10', 'Semana deportiva por Aniversario de INCOS'),
(41, 4, 39, '2026-BIM3-004', '2026-08-02', NULL, NULL),  -- Aniversario
(42, 4, 40, '2026-BIM3-005', '2026-08-05', NULL, 'Desfile cívico por Día de la Patria'),
(43, 4, 31, '2026-BIM3-006', '2026-08-06', NULL, NULL),  -- Día de la Patria
(44, 4, 43, '2026-BIM3-007', '2026-08-03', '2026-08-11', 'Inscripción a Feria Productiva - 2do año'),
(45, 4, 5, '2026-BIM3-008', '2026-08-10', '2026-08-31', NULL),  -- Desarrollo agosto (continuación)
(46, 4, 42, '2026-BIM3-009', '2026-08-28', NULL, 'Feria de Innovación Productiva interna - 2do año'),
(47, 4, 5, '2026-BIM3-010', '2026-09-01', '2026-09-30', NULL),  -- Desarrollo septiembre
(48, 4, 44, '2026-BIM3-011', '2026-09-09', NULL, NULL),  -- Seminario Administrador
(49, 4, 45, '2026-BIM3-012', '2026-09-09', NULL, NULL),  -- Día del Programador
(50, 4, 42, '2026-BIM3-013', '2026-09-01', '2026-09-30', 'Feria de Innovación Productiva departamental - 2do año'),
(51, 4, 46, '2026-BIM3-014', '2026-09-22', NULL, NULL),  -- Agasajo Estudiante
(52, 4, 40, '2026-BIM3-015', '2026-09-23', NULL, 'Desfile cívico Efemérides Departamental'),
(53, 4, 33, '2026-BIM3-016', '2026-09-24', NULL, NULL),  -- Efemérides
(54, 4, 19, '2026-BIM3-017', '2026-10-08', NULL, 'Presentación de calificaciones del Tercer Bimestre'),
(55, 4, 20, '2026-BIM3-018', '2026-10-13', NULL, 'Consejo de Docentes del Tercer Bimestre'),
(56, 4, 21, '2026-BIM3-019', '2026-10-08', '2026-10-16', 'Entrega de calificaciones del Tercer Bimestre, estadísticas, informe y presentación de Registro Pedagógico'),
(57, 4, 22, '2026-BIM3-020', '2026-10-16', NULL, 'Entrega de boletines del Tercer Bimestre');

-- CUARTO BIMESTRE (periodo_id = 5)
INSERT INTO actividades_calendario (id, periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin, nombre_personalizado) VALUES
(58, 5, 5, '2026-BIM4-001', '2026-10-14', '2026-10-31', NULL),  -- Desarrollo octubre
(59, 5, 5, '2026-BIM4-003', '2026-11-01', '2026-11-30', 'Desarrollo de actividades académicas - 1° y 2° año'),
(60, 5, 5, '2026-BIM4-004', '2026-11-01', '2026-11-06', 'Desarrollo de actividades académicas - 3° año'),
(61, 5, 32, '2026-BIM4-005', '2026-11-02', NULL, NULL),  -- Fieles Difuntos
(62, 5, 19, '2026-BIM4-006', '2026-11-06', NULL, 'Presentación de calificaciones 4to Bimestre - 3° año'),
(63, 5, 20, '2026-BIM4-007', '2026-11-08', NULL, 'Consejo de Docentes 4to Bimestre - 3° año'),
(64, 5, 23, '2026-BIM4-008', '2026-11-09', NULL, 'Lista de habilitados a prueba recuperatoria - 3° año'),
(65, 5, 21, '2026-BIM4-009', '2026-11-09', NULL, 'Entrega de calificaciones, estadísticas, informe y presentación de Registro Pedagógico 3° Año'),
(66, 5, 24, '2026-BIM4-010', '2026-11-10', '2026-11-12', 'Aplicación de prueba recuperatoria - 3° año'),
(67, 5, 18, '2026-BIM4-011', '2026-11-10', NULL, NULL),  -- Convocatoria Graduación
(68, 5, 14, '2026-BIM4-012', '2026-11-15', '2026-11-18', NULL),  -- PreDefensa
(69, 5, 15, '2026-BIM4-013', '2026-11-19', NULL, NULL),  -- Informe Suficiencia
(70, 5, 16, '2026-BIM4-014', '2026-11-01', '2026-11-23', NULL),  -- Empastado
(71, 5, 17, '2026-BIM4-015', '2026-11-24', '2026-11-27', NULL),  -- Defensa
(72, 5, 5, '2026-BIM4-016', '2026-12-01', '2026-12-09', 'Desarrollo de actividades académicas - 1° y 2° año'),
(73, 5, 19, '2026-BIM4-017', '2026-12-03', NULL, 'Presentación de calificaciones 4to Bimestre - 1° y 2° año'),
(74, 5, 20, '2026-BIM4-018', '2026-12-04', NULL, 'Consejo de Docentes 4to Bimestre - 1° y 2° año'),
(75, 5, 23, '2026-BIM4-019', '2026-12-04', NULL, 'Lista de habilitados a prueba recuperatoria - 1° y 2° año'),
(76, 5, 24, '2026-BIM4-020', '2026-12-06', '2026-12-08', 'Aplicación de prueba recuperatoria - 1° y 2° año');

-- CLAUSURA (periodo_id = 6)
INSERT INTO actividades_calendario (id, periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin, nombre_personalizado) VALUES
(77, 6, 21, '2026-CLAU-001', '2026-12-10', NULL, 'Entrega de calificaciones del Cuarto Bimestre estadísticas, informe y presentación de Registro Pedagógico (1° y 2° año)'),
(78, 6, 47, '2026-CLAU-002', '2026-12-10', NULL, NULL),  -- Rendición Cuentas
(79, 6, 48, '2026-CLAU-003', '2026-12-11', NULL, NULL);  -- Clausura

-- ============================================
-- DÍAS SIN CLASE (suspende_clases = TRUE) → neutros en el cálculo de asistencia
-- Feriados nacionales 2026 (actividad FERIADO) + Receso académico.
--   2  Estado Plurinacional (22 ene)    8  Carnaval (16-17 feb)
--   17 Viernes Santo (3 abr)            23 Día del Trabajo (1 may)
--   29 Corpus Christi (4 jun)           30 Año Nuevo Aymara (22 jun)
--   32 Receso académico (13-24 jul)     43 Día de la Patria (6 ago)
--   53 Efemérides departamental (24 sep) 61 Fieles Difuntos (2 nov)
-- ============================================
UPDATE actividades_calendario
SET suspende_clases = TRUE
WHERE id IN (2, 8, 17, 23, 29, 30, 32, 43, 53, 61);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
