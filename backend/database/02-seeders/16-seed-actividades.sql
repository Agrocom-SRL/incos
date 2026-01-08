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
-- Actividades generales que se repiten en diferentes gestiones
-- ============================================

INSERT INTO actividades (nombre, descripcion, tipo, es_destacada, icono) VALUES
-- ACTIVIDADES DE INSCRIPCIÓN Y PLANIFICACIÓN
('Inscripción de estudiantes nuevos y antiguos', 'Proceso de inscripción para estudiantes nuevos y antiguos al inicio de la gestión', 'INSCRIPCION', TRUE, 'user-plus'),
('Actividades de planificación y dosificación de contenidos', 'Planificación curricular y dosificación de contenidos mínimos del plan de estudios', 'PLANIFICACION', FALSE, 'calendar-check'),

-- ACTIVIDADES ACADÉMICAS GENERALES
('Inauguración de la Gestión Académica Institucional', 'Acto de inauguración oficial de la gestión académica', 'EVENTO_INSTITUCIONAL', TRUE, 'flag'),
('Diagnóstico, orientación e inducción a estudiantes', 'Actividades de diagnóstico, orientación e inducción para estudiantes', 'ACADEMICA', FALSE, 'users'),
('Desarrollo de actividades académicas', 'Desarrollo de avance curricular y evaluación permanente', 'ACADEMICA', FALSE, 'book-open'),
('Recepción de solicitudes de pasantías', 'Recepción de solicitudes de pasantías para estudiantes de tercer año', 'ADMINISTRATIVA', FALSE, 'file-text'),
('Presentación de Planificación Anual de Asignatura', 'Presentación de planificación anual y plan quincenal a Dirección Académica', 'PLANIFICACION', FALSE, 'clipboard'),

-- MODALIDAD DE GRADO
('Elección de Modalidad de Grado', 'Elección de modalidad de grado mediante formulario FDMG-1', 'MODALIDAD_GRADO', FALSE, 'file-check'),
('Aprobación de perfiles de proyectos de grado', 'Aprobación de perfiles de proyectos de grado en cada carrera', 'MODALIDAD_GRADO', FALSE, 'check-circle'),
('Presentación de perfiles de proyectos de grado', 'Presentación de perfiles a Dirección Académica y solicitud de designación de tutor', 'MODALIDAD_GRADO', FALSE, 'upload'),
('Publicación de Convocatoria para Feria Productiva', 'Publicación de convocatoria para participar en feria productiva', 'FERIA', FALSE, 'megaphone'),
('Designación de Tutores de proyecto de grado', 'Asignación de tutores para proyectos de grado', 'MODALIDAD_GRADO', FALSE, 'user-check'),
('Feria Productiva interna', 'Feria de proyectos productivos de estudiantes', 'FERIA', TRUE, 'shopping-bag'),
('PreDefensa de Modalidad de Graduación', 'Predefensa de modalidad de graduación para estudiantes', 'MODALIDAD_GRADO', TRUE, 'clipboard'),
('Informe de Suficiencia para Modalidad de Graduación', 'Presentación de informe de suficiencia', 'MODALIDAD_GRADO', FALSE, 'file-text'),
('Entrega de Empastado', 'Entrega de documentos empastados de modalidad de graduación', 'MODALIDAD_GRADO', FALSE, 'book'),
('Defensa de Modalidad de Graduación', 'Defensa final de modalidad de graduación', 'MODALIDAD_GRADO', TRUE, 'award'),
('Publicación de Convocatoria Modalidad de Graduación', 'Publicación de convocatoria para modalidad de graduación', 'MODALIDAD_GRADO', FALSE, 'bell'),

-- EVALUACIONES Y CALIFICACIONES
('Presentación de calificaciones en Plataforma', 'Carga de calificaciones del bimestre en la plataforma', 'EVALUACION', TRUE, 'upload-cloud'),
('Consejo de Docentes', 'Reunión del consejo de docentes para evaluación del bimestre', 'ADMINISTRATIVA', TRUE, 'users'),
('Entrega de calificaciones y registro pedagógico', 'Entrega de calificaciones, estadísticas, informe y registro pedagógico', 'EVALUACION', FALSE, 'clipboard'),
('Entrega de boletines de calificaciones', 'Entrega de boletines de calificaciones a estudiantes', 'EVALUACION', FALSE, 'file-text'),
('Publicación de lista de habilitados a prueba recuperatoria', 'Publicación de lista de estudiantes habilitados para recuperatorio', 'EVALUACION', FALSE, 'list'),
('Aplicación de prueba recuperatoria', 'Aplicación de exámenes recuperatorios a estudiantes', 'EVALUACION', TRUE, 'edit'),

-- FERIADOS NACIONALES
('Feriado del Estado Plurinacional de Bolivia', 'Feriado nacional del Estado Plurinacional de Bolivia', 'FERIADO', TRUE, 'calendar'),
('Feriado por Carnaval', 'Feriado por celebración de Carnaval', 'FERIADO', TRUE, 'smile'),
('Feriado por Viernes Santo', 'Feriado religioso de Viernes Santo', 'FERIADO', TRUE, 'calendar'),
('Feriado por Día del Trabajo', 'Feriado nacional por Día del Trabajo', 'FERIADO', TRUE, 'briefcase'),
('Feriado por Corpus Christi', 'Feriado religioso de Corpus Christi', 'FERIADO', TRUE, 'calendar'),
('Feriado por Año Nuevo Aymara', 'Feriado por celebración del Año Nuevo Aymara Amazónico', 'FERIADO', TRUE, 'sun'),
('Feriado por Día de la Patria', 'Feriado nacional por Día de la Patria', 'FERIADO', TRUE, 'flag'),
('Feriado por Día de los Fieles Difuntos', 'Feriado por Día de los Fieles Difuntos', 'FERIADO', TRUE, 'calendar'),
('Feriado por Efemérides Departamental', 'Feriado departamental por efemérides de Santa Cruz', 'FERIADO', TRUE, 'map-pin'),

-- EVENTOS INSTITUCIONALES Y DÍAS ESPECIALES
('Día del Contador', 'Celebración del Día del Contador', 'EVENTO_INSTITUCIONAL', TRUE, 'calculator'),
('Taller por Día del Contador', 'Taller conmemorativo por el Día del Contador', 'EVENTO_INSTITUCIONAL', FALSE, 'book-open'),
('Día del Maestro', 'Celebración del Día del Maestro', 'EVENTO_INSTITUCIONAL', TRUE, 'award'),
('Receso Académico', 'Receso académico para estudiantes y docentes', 'OTRO', TRUE, 'coffee'),
('Actividad deportiva por Aniversario del Instituto', 'Semana deportiva por aniversario de INCOS', 'EVENTO_INSTITUCIONAL', TRUE, 'activity'),
('Aniversario de INCOS y confraternización', 'Celebración del aniversario del instituto con confraternización', 'EVENTO_INSTITUCIONAL', TRUE, 'cake'),
('Desfile cívico', 'Participación en desfile cívico', 'EVENTO_INSTITUCIONAL', TRUE, 'flag'),
('Elecciones nacionales', 'Jornada de elecciones nacionales', 'OTRO', TRUE, 'vote'),
('Feria de Innovación Productiva', 'Feria de innovación y proyectos productivos', 'FERIA', TRUE, 'lightbulb'),
('Inscripción a Feria Productiva', 'Periodo de inscripción para participar en feria productiva', 'FERIA', FALSE, 'edit'),
('Seminario por Día del Administrador', 'Seminario con expositores invitados por Día del Administrador', 'EVENTO_INSTITUCIONAL', TRUE, 'users'),
('Día del Programador', 'Seminarios técnicos por el Día del Programador', 'EVENTO_INSTITUCIONAL', TRUE, 'code'),
('Agasajo Día del Estudiante', 'Celebración y agasajo por el Día del Estudiante', 'EVENTO_INSTITUCIONAL', TRUE, 'smile'),

-- ACTIVIDADES ADMINISTRATIVAS
('Rendición de Cuentas e Informe Económico', 'Rendición de cuentas e informe económico con representantes estudiantiles', 'ADMINISTRATIVA', TRUE, 'dollar-sign'),
('Evaluación Institucional y Clausura', 'Evaluación institucional, informe económico y clausura de actividades académicas', 'ADMINISTRATIVA', TRUE, 'check-square');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
