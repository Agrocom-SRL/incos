-- ============================================
-- SEEDER: modalidades_grado — módulo Titulación (TUT)
-- Catálogo de modalidades de graduación del FMDG-1 (22-modalidades-grado.sql),
-- raíz del dominio de menú "Titulación" (proyectos de grado, pasantías, títulos).
-- Sin ids: id por AUTO_INCREMENT (proyectos_grado referencia en runtime).
-- La grupalidad NO es columna: criterio de aplicación por codigo = 'PSP'
-- (MODALIDAD_GRUPAL_CODIGO en domain/constants/tutorias.constants.js).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO modalidades_grado
(codigo, nombre, descripcion, requiere_tutor, requiere_proyecto, requiere_defensa, requiere_examen, duracion_meses, carga_horaria_estimada, observaciones, activo, created_at, updated_at) VALUES
('PSP', 'Proyecto Socio-comunitario Productivo',
 'Proyecto grupal (2 a 5 estudiantes) orientado a resolver una necesidad de la comunidad o del sector productivo. Única modalidad grupal.',
 TRUE, TRUE, TRUE, FALSE, 10, NULL, 'Modalidad grupal: integrantes en integrantes_proyecto.', TRUE, NOW(), NOW()),
('PG', 'Proyecto de Grado',
 'Proyecto individual de aplicación técnica de la especialidad, con perfil, desarrollo y defensa final.',
 TRUE, TRUE, TRUE, FALSE, 10, NULL, NULL, TRUE, NOW(), NOW()),
('PE', 'Proyecto de Emprendimiento',
 'Proyecto individual de creación de un emprendimiento productivo o de servicios vinculado a la carrera.',
 TRUE, TRUE, TRUE, FALSE, 10, NULL, NULL, TRUE, NOW(), NOW()),
('TD', 'Trabajo Dirigido',
 'Trabajo individual desarrollado en una institución o empresa bajo convenio, con supervisión del tutor.',
 TRUE, TRUE, TRUE, FALSE, 10, NULL, NULL, TRUE, NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;
