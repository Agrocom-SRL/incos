-- ============================================
-- SEEDER: actividades_calendario
-- Sistema de Gestión Académica - Instituto INCOS
-- Calendario Académico Gestión 2025
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE actividades_calendario;

-- ============================================
-- VARIABLES PARA REFERENCIAS
-- ============================================

-- IDs de periodos académicos
SET @periodo_plan = (SELECT id FROM periodos_academicos WHERE codigo = '2025-PLAN' LIMIT 1);
SET @periodo_bim1 = (SELECT id FROM periodos_academicos WHERE codigo = '2025-BIM1' LIMIT 1);
SET @periodo_bim2 = (SELECT id FROM periodos_academicos WHERE codigo = '2025-BIM2' LIMIT 1);
SET @periodo_bim3 = (SELECT id FROM periodos_academicos WHERE codigo = '2025-BIM3' LIMIT 1);
SET @periodo_bim4 = (SELECT id FROM periodos_academicos WHERE codigo = '2025-BIM4' LIMIT 1);
SET @periodo_clau = (SELECT id FROM periodos_academicos WHERE codigo = '2025-CLAU' LIMIT 1);

-- IDs de actividades del catálogo
SET @act_inscripcion = (SELECT id FROM actividades WHERE nombre = 'Inscripción de estudiantes nuevos y antiguos' LIMIT 1);
SET @act_planificacion = (SELECT id FROM actividades WHERE nombre = 'Actividades de planificación y dosificación de contenidos' LIMIT 1);
SET @act_inauguracion = (SELECT id FROM actividades WHERE nombre = 'Inauguración de la Gestión Académica Institucional' LIMIT 1);
SET @act_diagnostico = (SELECT id FROM actividades WHERE nombre = 'Diagnóstico, orientación e inducción a estudiantes' LIMIT 1);
SET @act_desarrollo = (SELECT id FROM actividades WHERE nombre = 'Desarrollo de actividades académicas' LIMIT 1);
SET @act_pasantias = (SELECT id FROM actividades WHERE nombre = 'Recepción de solicitudes de pasantías' LIMIT 1);
SET @act_presentacion_plan = (SELECT id FROM actividades WHERE nombre = 'Presentación de Planificación Anual de Asignatura' LIMIT 1);
SET @act_modalidad_grado = (SELECT id FROM actividades WHERE nombre = 'Elección de Modalidad de Grado' LIMIT 1);
SET @act_aprobacion_perfiles = (SELECT id FROM actividades WHERE nombre = 'Aprobación de perfiles de proyectos de grado' LIMIT 1);
SET @act_presentacion_perfiles = (SELECT id FROM actividades WHERE nombre = 'Presentación de perfiles de proyectos de grado' LIMIT 1);
SET @act_convocatoria_feria = (SELECT id FROM actividades WHERE nombre = 'Publicación de Convocatoria para Feria Productiva' LIMIT 1);
SET @act_designacion_tutores = (SELECT id FROM actividades WHERE nombre = 'Designación de Tutores de proyecto de grado' LIMIT 1);
SET @act_feria_productiva = (SELECT id FROM actividades WHERE nombre = 'Feria Productiva interna' LIMIT 1);
SET @act_presentacion_calif = (SELECT id FROM actividades WHERE nombre = 'Presentación de calificaciones en Plataforma' LIMIT 1);
SET @act_consejo_docentes = (SELECT id FROM actividades WHERE nombre = 'Consejo de Docentes' LIMIT 1);
SET @act_entrega_calif = (SELECT id FROM actividades WHERE nombre = 'Entrega de calificaciones y registro pedagógico' LIMIT 1);
SET @act_entrega_boletines = (SELECT id FROM actividades WHERE nombre = 'Entrega de boletines de calificaciones' LIMIT 1);
SET @act_feriado_epl = (SELECT id FROM actividades WHERE nombre = 'Feriado del Estado Plurinacional de Bolivia' LIMIT 1);
SET @act_feriado_carnaval = (SELECT id FROM actividades WHERE nombre = 'Feriado por Carnaval' LIMIT 1);
SET @act_feriado_viernes_santo = (SELECT id FROM actividades WHERE nombre = 'Feriado por Viernes Santo' LIMIT 1);
SET @act_feriado_trabajo = (SELECT id FROM actividades WHERE nombre = 'Feriado por Día del Trabajo' LIMIT 1);
SET @act_dia_contador = (SELECT id FROM actividades WHERE nombre = 'Día del Contador' LIMIT 1);
SET @act_taller_contador = (SELECT id FROM actividades WHERE nombre = 'Taller por Día del Contador' LIMIT 1);
SET @act_dia_maestro = (SELECT id FROM actividades WHERE nombre = 'Día del Maestro' LIMIT 1);
SET @act_feriado_corpus = (SELECT id FROM actividades WHERE nombre = 'Feriado por Corpus Christi' LIMIT 1);
SET @act_feriado_aymara = (SELECT id FROM actividades WHERE nombre = 'Feriado por Año Nuevo Aymara' LIMIT 1);
SET @act_receso = (SELECT id FROM actividades WHERE nombre = 'Receso Académico' LIMIT 1);
SET @act_deportiva = (SELECT id FROM actividades WHERE nombre = 'Actividad deportiva por Aniversario del Instituto' LIMIT 1);
SET @act_aniversario = (SELECT id FROM actividades WHERE nombre = 'Aniversario de INCOS y confraternización' LIMIT 1);
SET @act_desfile = (SELECT id FROM actividades WHERE nombre = 'Desfile cívico' LIMIT 1);
SET @act_feriado_patria = (SELECT id FROM actividades WHERE nombre = 'Feriado por Día de la Patria' LIMIT 1);
SET @act_inscripcion_feria = (SELECT id FROM actividades WHERE nombre = 'Inscripción a Feria Productiva' LIMIT 1);
SET @act_elecciones = (SELECT id FROM actividades WHERE nombre = 'Elecciones nacionales' LIMIT 1);
SET @act_feria_innovacion = (SELECT id FROM actividades WHERE nombre = 'Feria de Innovación Productiva' LIMIT 1);
SET @act_seminario_admin = (SELECT id FROM actividades WHERE nombre = 'Seminario por Día del Administrador' LIMIT 1);
SET @act_dia_programador = (SELECT id FROM actividades WHERE nombre = 'Día del Programador' LIMIT 1);
SET @act_agasajo_estudiante = (SELECT id FROM actividades WHERE nombre = 'Agasajo Día del Estudiante' LIMIT 1);
SET @act_feriado_efemerides = (SELECT id FROM actividades WHERE nombre = 'Feriado por Efemérides Departamental' LIMIT 1);
SET @act_feriado_difuntos = (SELECT id FROM actividades WHERE nombre = 'Feriado por Día de los Fieles Difuntos' LIMIT 1);
SET @act_lista_recuperatorio = (SELECT id FROM actividades WHERE nombre = 'Publicación de lista de habilitados a prueba recuperatoria' LIMIT 1);
SET @act_recuperatorio = (SELECT id FROM actividades WHERE nombre = 'Aplicación de prueba recuperatoria' LIMIT 1);
SET @act_convocatoria_graduacion = (SELECT id FROM actividades WHERE nombre = 'Publicación de Convocatoria Modalidad de Graduación' LIMIT 1);
SET @act_predefensa = (SELECT id FROM actividades WHERE nombre = 'PreDefensa de Modalidad de Graduación' LIMIT 1);
SET @act_informe_suficiencia = (SELECT id FROM actividades WHERE nombre = 'Informe de Suficiencia para Modalidad de Graduación' LIMIT 1);
SET @act_empastado = (SELECT id FROM actividades WHERE nombre = 'Entrega de Empastado' LIMIT 1);
SET @act_defensa = (SELECT id FROM actividades WHERE nombre = 'Defensa de Modalidad de Graduación' LIMIT 1);
SET @act_rendicion_cuentas = (SELECT id FROM actividades WHERE nombre = 'Rendición de Cuentas e Informe Económico' LIMIT 1);
SET @act_clausura = (SELECT id FROM actividades WHERE nombre = 'Evaluación Institucional y Clausura' LIMIT 1);

-- ============================================
-- PERIODO DE INSCRIPCIÓN Y PLANIFICACIÓN
-- (13 enero - 09 febrero 2025)
-- ============================================

INSERT INTO actividades_calendario (periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin) VALUES
-- 1. Inscripción de estudiantes
(@periodo_plan, @act_inscripcion, '2025-PLAN-001', '2025-01-13', '2025-02-21'),

-- 2. Feriado Estado Plurinacional
(@periodo_plan, @act_feriado_epl, '2025-PLAN-002', '2025-01-22', NULL),

-- 3. Planificación y dosificación
(@periodo_plan, @act_planificacion, '2025-PLAN-003', '2025-02-03', '2025-02-07');

-- ============================================
-- PRIMER BIMESTRE
-- (10 febrero - 22 abril 2025)
-- ============================================

INSERT INTO actividades_calendario (periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin, nombre_personalizado) VALUES
-- 1. Inauguración
(@periodo_bim1, @act_inauguracion, '2025-BIM1-001', '2025-02-10', NULL, NULL),

-- 2. Diagnóstico e inducción
(@periodo_bim1, @act_diagnostico, '2025-BIM1-002', '2025-02-10', '2025-02-15', NULL),

-- 3. Desarrollo curricular
(@periodo_bim1, @act_desarrollo, '2025-BIM1-003', '2025-02-17', '2025-02-28', NULL),

-- 4. Recepción de solicitudes de pasantías (3er año)
(@periodo_bim1, @act_pasantias, '2025-BIM1-004', '2025-02-10', NULL, 'Recepción de solicitudes de pasantías - 3er año'),

-- 5. Feriado por Carnaval
(@periodo_bim1, @act_feriado_carnaval, '2025-BIM1-005', '2025-03-03', '2025-03-04', NULL),

-- 6. Presentación de Planificación Anual
(@periodo_bim1, @act_presentacion_plan, '2025-BIM1-006', '2025-03-08', NULL, NULL),

-- 7. Elección de Modalidad de Grado
(@periodo_bim1, @act_modalidad_grado, '2025-BIM1-007', '2025-03-14', NULL, NULL),

-- 8. Aprobación de perfiles (3er año)
(@periodo_bim1, @act_aprobacion_perfiles, '2025-BIM1-008', '2025-03-01', '2025-03-15', 'Aprobación de perfiles de proyectos de grado - 3er año'),

-- 9. Presentación de perfiles (3er año)
(@periodo_bim1, @act_presentacion_perfiles, '2025-BIM1-009', '2025-03-01', '2025-03-15', 'Presentación de perfiles a Dirección Académica - 3er año'),

-- 10. Convocatoria Feria Productiva (3er año)
(@periodo_bim1, @act_convocatoria_feria, '2025-BIM1-010', '2025-03-15', NULL, 'Convocatoria para Feria Productiva interna - 3er año'),

-- 11. Designación de Tutores
(@periodo_bim1, @act_designacion_tutores, '2025-BIM1-011', '2025-03-16', '2025-03-31', NULL),

-- 12. Desarrollo académico marzo
(@periodo_bim1, @act_desarrollo, '2025-BIM1-012', '2025-03-01', '2025-03-30', NULL),

-- 13. Desarrollo académico abril
(@periodo_bim1, @act_desarrollo, '2025-BIM1-013', '2025-04-01', '2025-04-17', NULL),

-- 14. Feriado Viernes Santo
(@periodo_bim1, @act_feriado_viernes_santo, '2025-BIM1-014', '2025-04-18', NULL, NULL),

-- 15. Presentación de calificaciones
(@periodo_bim1, @act_presentacion_calif, '2025-BIM1-015', '2025-04-20', NULL, 'Presentación de calificaciones del Primer Bimestre'),

-- 16. Consejo de Docentes
(@periodo_bim1, @act_consejo_docentes, '2025-BIM1-016', '2025-04-21', NULL, 'Consejo de Docentes del Primer Bimestre'),

-- 17. Feria interna 3er año
(@periodo_bim1, @act_feria_productiva, '2025-BIM1-017', '2025-04-26', NULL, 'Feria Productiva interna - 3er año'),

-- 18. Entrega de calificaciones
(@periodo_bim1, @act_entrega_calif, '2025-BIM1-018', '2025-04-21', '2025-04-28', 'Entrega de calificaciones del Primer Bimestre'),

-- 19. Entrega de boletines
(@periodo_bim1, @act_entrega_boletines, '2025-BIM1-019', '2025-04-28', NULL, 'Entrega de boletines del Primer Bimestre');

-- ============================================
-- SEGUNDO BIMESTRE
-- (02 mayo - 23 julio 2025)
-- ============================================

INSERT INTO actividades_calendario (periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin, nombre_personalizado) VALUES
-- 1. Feriado Día del Trabajo
(@periodo_bim2, @act_feriado_trabajo, '2025-BIM2-001', '2025-05-01', NULL, NULL),

-- 2. Desarrollo académico mayo
(@periodo_bim2, @act_desarrollo, '2025-BIM2-002', '2025-05-02', '2025-05-31', NULL),

-- 3. Día del Contador
(@periodo_bim2, @act_dia_contador, '2025-BIM2-003', '2025-05-18', NULL, NULL),

-- 4. Taller Día del Contador
(@periodo_bim2, @act_taller_contador, '2025-BIM2-004', '2025-05-18', NULL, NULL),

-- 5. Desarrollo académico junio
(@periodo_bim2, @act_desarrollo, '2025-BIM2-005', '2025-06-01', '2025-06-29', NULL),

-- 6. Día del Maestro
(@periodo_bim2, @act_dia_maestro, '2025-BIM2-006', '2025-06-06', NULL, NULL),

-- 7. Feriado Corpus Christi
(@periodo_bim2, @act_feriado_corpus, '2025-BIM2-007', '2025-06-19', NULL, NULL),

-- 8. Feriado Año Nuevo Aymara
(@periodo_bim2, @act_feriado_aymara, '2025-BIM2-008', '2025-06-21', NULL, NULL),

-- 9. Convocatoria Feria Productiva (2do año)
(@periodo_bim2, @act_convocatoria_feria, '2025-BIM2-009', '2025-06-24', NULL, 'Convocatoria para Feria Productiva interna - 2do año'),

-- 10. Receso Académico
(@periodo_bim2, @act_receso, '2025-BIM2-010', '2025-07-07', '2025-07-18', NULL),

-- 11. Desarrollo académico julio
(@periodo_bim2, @act_desarrollo, '2025-BIM2-011', '2025-07-19', '2025-07-23', NULL),

-- 12. Presentación de calificaciones
(@periodo_bim2, @act_presentacion_calif, '2025-BIM2-012', '2025-07-23', NULL, 'Presentación de calificaciones del Segundo Bimestre'),

-- 13. Consejo de Docentes
(@periodo_bim2, @act_consejo_docentes, '2025-BIM2-013', '2025-07-30', NULL, 'Consejo de Docentes del Segundo Bimestre'),

-- 14. Entrega de calificaciones
(@periodo_bim2, @act_entrega_calif, '2025-BIM2-014', '2025-07-20', '2025-07-26', 'Entrega de calificaciones del Segundo Bimestre'),

-- 15. Entrega de boletines
(@periodo_bim2, @act_entrega_boletines, '2025-BIM2-015', '2025-07-31', NULL, 'Entrega de boletines del Segundo Bimestre');

-- ============================================
-- TERCER BIMESTRE
-- (25 julio - 04 octubre 2025)
-- ============================================

INSERT INTO actividades_calendario (periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin, nombre_personalizado) VALUES
-- 1. Desarrollo académico julio
(@periodo_bim3, @act_desarrollo, '2025-BIM3-001', '2025-07-25', '2025-07-31', NULL),

-- 2. Desarrollo académico agosto
(@periodo_bim3, @act_desarrollo, '2025-BIM3-002', '2025-08-01', '2025-08-31', NULL),

-- 3. Actividad deportiva Aniversario INCOS
(@periodo_bim3, @act_deportiva, '2025-BIM3-003', '2025-08-01', '2025-08-08', 'Semana deportiva por Aniversario de INCOS'),

-- 4. Aniversario INCOS
(@periodo_bim3, @act_aniversario, '2025-BIM3-004', '2025-08-02', NULL, NULL),

-- 5. Desfile cívico Día de la Patria
(@periodo_bim3, @act_desfile, '2025-BIM3-005', '2025-08-05', NULL, 'Desfile cívico por Día de la Patria'),

-- 6. Feriado Día de la Patria
(@periodo_bim3, @act_feriado_patria, '2025-BIM3-006', '2025-08-06', NULL, NULL),

-- 7. Inscripción Feria Productiva (2do año)
(@periodo_bim3, @act_inscripcion_feria, '2025-BIM3-007', '2025-08-01', '2025-08-09', 'Inscripción a Feria Productiva - 2do año'),

-- 8. Elecciones nacionales
(@periodo_bim3, @act_elecciones, '2025-BIM3-008', '2025-08-17', NULL, NULL),

-- 9. Feria Innovación Productiva interna (2do año)
(@periodo_bim3, @act_feria_innovacion, '2025-BIM3-009', '2025-08-30', NULL, 'Feria de Innovación Productiva interna - 2do año'),

-- 10. Desarrollo académico septiembre
(@periodo_bim3, @act_desarrollo, '2025-BIM3-010', '2025-09-02', '2025-09-30', NULL),

-- 11. Seminario Día del Administrador
(@periodo_bim3, @act_seminario_admin, '2025-BIM3-011', '2025-09-09', NULL, NULL),

-- 12. Día del Programador
(@periodo_bim3, @act_dia_programador, '2025-BIM3-012', '2025-09-09', NULL, NULL),

-- 13. Feria Innovación Productiva departamental (2do año)
(@periodo_bim3, @act_feria_innovacion, '2025-BIM3-013', '2025-09-01', '2025-09-30', 'Feria de Innovación Productiva departamental - 2do año'),

-- 14. Agasajo Día del Estudiante
(@periodo_bim3, @act_agasajo_estudiante, '2025-BIM3-014', '2025-09-22', NULL, NULL),

-- 15. Desfile cívico Efemérides Departamental
(@periodo_bim3, @act_desfile, '2025-BIM3-015', '2025-09-23', NULL, 'Desfile cívico Efemérides Departamental'),

-- 16. Feriado Efemérides de Santa Cruz
(@periodo_bim3, @act_feriado_efemerides, '2025-BIM3-016', '2025-09-24', NULL, NULL),

-- 17. Presentación de calificaciones
(@periodo_bim3, @act_presentacion_calif, '2025-BIM3-017', '2025-10-02', NULL, 'Presentación de calificaciones del Tercer Bimestre'),

-- 18. Consejo de Docentes
(@periodo_bim3, @act_consejo_docentes, '2025-BIM3-018', '2025-10-07', NULL, 'Consejo de Docentes del Tercer Bimestre'),

-- 19. Entrega de calificaciones
(@periodo_bim3, @act_entrega_calif, '2025-BIM3-019', '2025-10-02', '2025-10-10', 'Entrega de calificaciones del Tercer Bimestre'),

-- 20. Entrega de boletines
(@periodo_bim3, @act_entrega_boletines, '2025-BIM3-020', '2025-10-10', NULL, 'Entrega de boletines del Tercer Bimestre');

-- ============================================
-- CUARTO BIMESTRE
-- (06 octubre - 10 diciembre 2025)
-- ============================================

INSERT INTO actividades_calendario (periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin, nombre_personalizado) VALUES
-- 1. Desarrollo académico octubre
(@periodo_bim4, @act_desarrollo, '2025-BIM4-001', '2025-10-06', '2025-10-31', NULL),

-- 2. Entrega de boletines Tercer Bimestre
(@periodo_bim4, @act_entrega_boletines, '2025-BIM4-002', '2025-10-07', NULL, 'Entrega de boletines del Tercer Bimestre'),

-- 3. Desarrollo académico noviembre (1° y 2° año)
(@periodo_bim4, @act_desarrollo, '2025-BIM4-003', '2025-11-01', '2025-11-30', 'Desarrollo de actividades académicas - 1° y 2° año'),

-- 4. Desarrollo académico noviembre (3° año)
(@periodo_bim4, @act_desarrollo, '2025-BIM4-004', '2025-11-01', '2025-11-08', 'Desarrollo de actividades académicas - 3° año'),

-- 5. Feriado Día de los Fieles Difuntos
(@periodo_bim4, @act_feriado_difuntos, '2025-BIM4-005', '2025-11-02', NULL, NULL),

-- 6. Presentación calificaciones (3° año)
(@periodo_bim4, @act_presentacion_calif, '2025-BIM4-006', '2025-11-08', NULL, 'Presentación de calificaciones 4to Bimestre - 3° año'),

-- 7. Consejo de Docentes (3° año)
(@periodo_bim4, @act_consejo_docentes, '2025-BIM4-007', '2025-11-10', NULL, 'Consejo de Docentes 4to Bimestre - 3° año'),

-- 8. Lista recuperatorio (3° año)
(@periodo_bim4, @act_lista_recuperatorio, '2025-BIM4-008', '2025-11-11', NULL, 'Lista de habilitados a prueba recuperatoria - 3° año'),

-- 9. Entrega calificaciones (3° año)
(@periodo_bim4, @act_entrega_calif, '2025-BIM4-009', '2025-11-11', NULL, 'Entrega de calificaciones y registro pedagógico - 3° año'),

-- 10. Prueba recuperatoria (3° año)
(@periodo_bim4, @act_recuperatorio, '2025-BIM4-010', '2025-11-12', '2025-11-14', 'Aplicación de prueba recuperatoria - 3° año'),

-- 11. Convocatoria Modalidad de Graduación
(@periodo_bim4, @act_convocatoria_graduacion, '2025-BIM4-011', '2025-11-12', NULL, NULL),

-- 12. PreDefensa Modalidad de Graduación
(@periodo_bim4, @act_predefensa, '2025-BIM4-012', '2025-11-17', '2025-11-20', NULL),

-- 13. Informe de Suficiencia
(@periodo_bim4, @act_informe_suficiencia, '2025-BIM4-013', '2025-11-21', NULL, NULL),

-- 14. Entrega de Empastado
(@periodo_bim4, @act_empastado, '2025-BIM4-014', '2025-11-01', '2025-11-25', NULL),

-- 15. Defensa Modalidad de Graduación
(@periodo_bim4, @act_defensa, '2025-BIM4-015', '2025-11-26', '2025-11-29', NULL),

-- 16. Desarrollo académico diciembre (1° y 2° año)
(@periodo_bim4, @act_desarrollo, '2025-BIM4-016', '2025-12-01', '2025-12-12', 'Desarrollo de actividades académicas - 1° y 2° año'),

-- 17. Presentación calificaciones (1° y 2° año)
(@periodo_bim4, @act_presentacion_calif, '2025-BIM4-017', '2025-12-05', NULL, 'Presentación de calificaciones 4to Bimestre - 1° y 2° año'),

-- 18. Consejo de Docentes (1° y 2° año)
(@periodo_bim4, @act_consejo_docentes, '2025-BIM4-018', '2025-12-06', NULL, 'Consejo de Docentes 4to Bimestre - 1° y 2° año'),

-- 19. Lista recuperatorio (1° y 2° año)
(@periodo_bim4, @act_lista_recuperatorio, '2025-BIM4-019', '2025-12-06', NULL, 'Lista de habilitados a prueba recuperatoria - 1° y 2° año'),

-- 20. Prueba recuperatoria (1° y 2° año)
(@periodo_bim4, @act_recuperatorio, '2025-BIM4-020', '2025-12-08', '2025-12-10', 'Aplicación de prueba recuperatoria - 1° y 2° año');

-- ============================================
-- PERIODO DE CLAUSURA
-- (11 - 12 diciembre 2025)
-- ============================================

INSERT INTO actividades_calendario (periodo_academico_id, actividad_id, codigo, fecha_inicio, fecha_fin, nombre_personalizado) VALUES
-- 1. Entrega calificaciones Cuarto Bimestre (1° y 2° año)
(@periodo_clau, @act_entrega_calif, '2025-CLAU-001', '2025-12-11', NULL, 'Entrega de calificaciones Cuarto Bimestre - 1° y 2° año'),

-- 2. Rendición de Cuentas
(@periodo_clau, @act_rendicion_cuentas, '2025-CLAU-002', '2025-12-11', NULL, NULL),

-- 3. Evaluación Institucional y Clausura
(@periodo_clau, @act_clausura, '2025-CLAU-003', '2025-12-12', NULL, NULL);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
