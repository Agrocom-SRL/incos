-- ============================================
-- SEEDER: actividades
-- Sistema de Gestión Académica - Instituto INCOS
-- Catálogo maestro de actividades académicas reutilizables
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE actividades;

-- ============================================
-- INSERTAR ACTIVIDADES (Catálogo Maestro)
-- IDs fijos para facilitar referencias consistentes
-- Actividades generales que se repiten en diferentes gestiones
-- ============================================

INSERT INTO actividades (id, nombre, descripcion, tipo, es_destacada, icono) VALUES
-- ACTIVIDADES DE INSCRIPCIÓN Y PLANIFICACIÓN
(1, 'Inscripción de estudiantes nuevos y antiguos', 'Proceso de inscripción para estudiantes nuevos y antiguos al inicio de la gestión', 'INSCRIPCION', TRUE, 'user-plus'),
(2, 'Actividades de planificación y dosificación de contenidos', 'Planificación curricular y dosificación de contenidos mínimos del plan de estudios', 'PLANIFICACION', FALSE, 'calendar-check'),

-- ACTIVIDADES ACADÉMICAS GENERALES
(3, 'Inauguración de la Gestión Académica Institucional', 'Acto de inauguración oficial de la gestión académica', 'EVENTO_INSTITUCIONAL', TRUE, 'flag'),
(4, 'Diagnóstico, orientación e inducción a estudiantes', 'Actividades de diagnóstico, orientación e inducción para estudiantes', 'ACADEMICA', FALSE, 'users'),
(5, 'Desarrollo de actividades académicas', 'Desarrollo de avance curricular y evaluación permanente', 'ACADEMICA', FALSE, 'book-open'),
(6, 'Recepción de solicitudes de pasantías', 'Recepción de solicitudes de pasantías para estudiantes de tercer año', 'ADMINISTRATIVA', FALSE, 'file-text'),
(7, 'Presentación de Planificación Anual de Asignatura', 'Presentación de planificación anual y plan quincenal a Dirección Académica', 'PLANIFICACION', FALSE, 'clipboard'),

-- MODALIDAD DE GRADO
(8, 'Elección de Modalidad de Grado', 'Elección de modalidad de grado mediante formulario FDMG-1', 'MODALIDAD_GRADO', FALSE, 'file-check'),
(9, 'Aprobación de perfiles de proyectos de grado', 'Aprobación de perfiles de proyectos de grado en cada carrera', 'MODALIDAD_GRADO', FALSE, 'check-circle'),
(10, 'Presentación de perfiles de proyectos de grado', 'Presentación de perfiles a Dirección Académica y solicitud de designación de tutor', 'MODALIDAD_GRADO', FALSE, 'upload'),
(11, 'Publicación de Convocatoria para Feria Productiva', 'Publicación de convocatoria para participar en feria productiva', 'FERIA', FALSE, 'megaphone'),
(12, 'Designación de Tutores de proyecto de grado', 'Asignación de tutores para proyectos de grado', 'MODALIDAD_GRADO', FALSE, 'user-check'),
(13, 'Feria Productiva interna', 'Feria de proyectos productivos de estudiantes', 'FERIA', TRUE, 'shopping-bag'),
(14, 'PreDefensa de Modalidad de Graduación', 'Predefensa de modalidad de graduación para estudiantes', 'MODALIDAD_GRADO', TRUE, 'clipboard'),
(15, 'Informe de Suficiencia para Modalidad de Graduación', 'Presentación de informe de suficiencia', 'MODALIDAD_GRADO', FALSE, 'file-text'),
(16, 'Entrega de Empastado', 'Entrega de documentos empastados de modalidad de graduación', 'MODALIDAD_GRADO', FALSE, 'book'),
(17, 'Defensa de Modalidad de Graduación', 'Defensa final de modalidad de graduación', 'MODALIDAD_GRADO', TRUE, 'award'),
(18, 'Publicación de Convocatoria Modalidad de Graduación', 'Publicación de convocatoria para modalidad de graduación', 'MODALIDAD_GRADO', FALSE, 'bell'),

-- EVALUACIONES Y CALIFICACIONES
(19, 'Presentación de calificaciones en Plataforma', 'Carga de calificaciones del bimestre en la plataforma', 'EVALUACION', TRUE, 'upload-cloud'),
(20, 'Consejo de Docentes', 'Reunión del consejo de docentes para evaluación del bimestre', 'ADMINISTRATIVA', TRUE, 'users'),
(21, 'Entrega de calificaciones y registro pedagógico', 'Entrega de calificaciones, estadísticas, informe y registro pedagógico', 'EVALUACION', FALSE, 'clipboard'),
(22, 'Entrega de boletines de calificaciones', 'Entrega de boletines de calificaciones a estudiantes', 'EVALUACION', FALSE, 'file-text'),
(23, 'Publicación de lista de habilitados a prueba recuperatoria', 'Publicación de lista de estudiantes habilitados para recuperatorio', 'EVALUACION', FALSE, 'list'),
(24, 'Aplicación de prueba recuperatoria', 'Aplicación de exámenes recuperatorios a estudiantes', 'EVALUACION', TRUE, 'edit'),

-- FERIADOS NACIONALES
(25, 'Feriado del Estado Plurinacional de Bolivia', 'Feriado nacional del Estado Plurinacional de Bolivia', 'FERIADO', TRUE, 'calendar'),
(26, 'Feriado por Carnaval', 'Feriado por celebración de Carnaval', 'FERIADO', TRUE, 'smile'),
(27, 'Feriado por Viernes Santo', 'Feriado religioso de Viernes Santo', 'FERIADO', TRUE, 'calendar'),
(28, 'Feriado por Día del Trabajo', 'Feriado nacional por Día del Trabajo', 'FERIADO', TRUE, 'briefcase'),
(29, 'Feriado por Corpus Christi', 'Feriado religioso de Corpus Christi', 'FERIADO', TRUE, 'calendar'),
(30, 'Feriado por Año Nuevo Aymara', 'Feriado por celebración del Año Nuevo Aymara Amazónico', 'FERIADO', TRUE, 'sun'),
(31, 'Feriado por Día de la Patria', 'Feriado nacional por Día de la Patria', 'FERIADO', TRUE, 'flag'),
(32, 'Feriado por Día de los Fieles Difuntos', 'Feriado por Día de los Fieles Difuntos', 'FERIADO', TRUE, 'calendar'),
(33, 'Feriado por Efemérides Departamental', 'Feriado departamental por efemérides de Santa Cruz', 'FERIADO', TRUE, 'map-pin'),

-- EVENTOS INSTITUCIONALES Y DÍAS ESPECIALES
(34, 'Día del Contador', 'Celebración del Día del Contador', 'EVENTO_INSTITUCIONAL', TRUE, 'calculator'),
(35, 'Taller por Día del Contador', 'Taller conmemorativo por el Día del Contador', 'EVENTO_INSTITUCIONAL', FALSE, 'book-open'),
(36, 'Día del Maestro', 'Celebración del Día del Maestro', 'EVENTO_INSTITUCIONAL', TRUE, 'award'),
(37, 'Receso Académico', 'Receso académico para estudiantes y docentes', 'OTRO', TRUE, 'coffee'),
(38, 'Actividad deportiva por Aniversario del Instituto', 'Semana deportiva por aniversario de INCOS', 'EVENTO_INSTITUCIONAL', TRUE, 'activity'),
(39, 'Aniversario de INCOS y confraternización', 'Celebración del aniversario del instituto con confraternización', 'EVENTO_INSTITUCIONAL', TRUE, 'cake'),
(40, 'Desfile cívico', 'Participación en desfile cívico', 'EVENTO_INSTITUCIONAL', TRUE, 'flag'),
(41, 'Elecciones nacionales', 'Jornada de elecciones nacionales', 'OTRO', TRUE, 'vote'),
(42, 'Feria de Innovación Productiva', 'Feria de innovación y proyectos productivos', 'FERIA', TRUE, 'lightbulb'),
(43, 'Inscripción a Feria Productiva', 'Periodo de inscripción para participar en feria productiva', 'FERIA', FALSE, 'edit'),
(44, 'Seminario por Día del Administrador', 'Seminario con expositores invitados por Día del Administrador', 'EVENTO_INSTITUCIONAL', TRUE, 'users'),
(45, 'Día del Programador', 'Seminarios técnicos por el Día del Programador', 'EVENTO_INSTITUCIONAL', TRUE, 'code'),
(46, 'Agasajo Día del Estudiante', 'Celebración y agasajo por el Día del Estudiante', 'EVENTO_INSTITUCIONAL', TRUE, 'smile'),

-- ACTIVIDADES ADMINISTRATIVAS
(47, 'Rendición de Cuentas e Informe Económico', 'Rendición de cuentas e informe económico con representantes estudiantiles', 'ADMINISTRATIVA', TRUE, 'dollar-sign'),
(48, 'Evaluación Institucional y Clausura', 'Evaluación institucional, informe económico y clausura de actividades académicas', 'ADMINISTRATIVA', TRUE, 'check-square');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
