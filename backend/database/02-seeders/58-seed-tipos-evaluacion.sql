-- ============================================
-- SEEDER: tipos_evaluacion
-- Catálogo inicial de tipos de evaluación (bimestre y materia completa)
-- Alineado con 13-evaluaciones.sql (sin permite_multiples_intentos; intento en evaluaciones_*_notas)
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- TRUNCATE TABLE tipos_evaluacion;

INSERT INTO tipos_evaluacion (id, codigo, nombre, descripcion, ambito, es_recuperatorio, activo) VALUES
-- Evaluaciones de bimestre (tabla evaluaciones)
(1, 'EXAMEN_PARCIAL', 'Examen parcial', 'Examen escrito principal del bimestre', 'BIMESTRE', FALSE, TRUE),
(2, 'PRACTICO', 'Práctico', 'Evaluación práctica del bimestre', 'BIMESTRE', FALSE, TRUE),
(3, 'PROYECTO', 'Proyecto', 'Proyecto del bimestre', 'BIMESTRE', FALSE, TRUE),
(4, 'EXPOSICION', 'Exposición', 'Exposición oral', 'BIMESTRE', FALSE, TRUE),
(5, 'TALLER', 'Taller', 'Talleres prácticos en aula', 'BIMESTRE', FALSE, TRUE),
(6, 'ACTIVIDAD_EXTRACURRICULAR', 'Actividad extracurricular', 'Ferias, concursos y eventos', 'BIMESTRE', FALSE, TRUE),
(7, 'HABILITACION', 'Habilitación bimestral', 'Reemplaza la nota del bimestre si reprueba uno solo', 'BIMESTRE', TRUE, TRUE),
-- Evaluaciones de materia completa (tabla evaluaciones_finales / política institucional)
(10, 'EXAMEN_FINAL_ANUAL', 'Examen final anual', 'Examen que cubre toda la materia al cierre del año', 'MATERIA_COMPLETA', FALSE, TRUE),
(11, 'FERIA_ANUAL', 'Feria anual', 'Feria de ciencias o exposición anual', 'MATERIA_COMPLETA', FALSE, TRUE),
(12, 'PROYECTO_FINAL_ANUAL', 'Proyecto final', 'Proyecto integrador de fin de carrera o año', 'MATERIA_COMPLETA', FALSE, TRUE),
(13, 'RECUPERATORIO_ANUAL', 'Recuperatorio anual', 'Examen recuperatorio de fin de año', 'MATERIA_COMPLETA', TRUE, TRUE),
(14, 'PRUEBA_EXCEPCIONAL', 'Prueba excepcional', 'Tercer y último intento excepcional', 'MATERIA_COMPLETA', TRUE, TRUE);

SET FOREIGN_KEY_CHECKS = 1;
