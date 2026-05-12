-- ============================================
-- SEEDER: aulas
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos reales: Aulas y laboratorios según plano institucional
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE aulas;

-- ============================================
-- CRITERIO DE CARGA
-- ============================================
-- capacidad = mayor cantidad de estudiantes observada en el plano real.
-- CONTA = Contaduría General
-- ADM = Administración de Empresas
-- SISTEMAS = Sistemas Informáticos
--
-- Se mantiene compatibilidad parcial con IDs anteriores:
-- LAB-1 = 1
-- LAB-2 = 2
-- LAB-3 = 3
-- LAB-4 = 4
-- AULA-6 = 5
-- AULA-8 = 6
-- LAB-5 = 7
-- ============================================

-- ============================================
-- INSERTAR LABORATORIOS
-- ============================================

INSERT INTO aulas 
(id, codigo, nombre, categoria, capacidad, observaciones, activo) 
VALUES
(1, 'LAB-1', 'Laboratorio 1', 'LABORATORIO', 37, 
 '1ro B de Sistemas - 37 estudiantes.', 1),
(2, 'LAB-2', 'Sala de Docentes', 'LABORATORIO', 0, 
 'Sala de Docentes. No asignar clases ni horarios académicos.', 0),
(3, 'LAB-3', 'Laboratorio 3', 'LABORATORIO', 38, 
 '2do A de Sistemas - 32 estudiantes / 1ro A de Administración - 38 estudiantes.', 1),
(4, 'LAB-4', 'Laboratorio 4', 'LABORATORIO', 37, 
 '1ro A de Sistemas - 37 estudiantes.', 1),
(7, 'LAB-5', 'Laboratorio 5', 'LABORATORIO', 25, 
 '3ro A de Sistemas - 25 estudiantes.', 1);

-- ============================================
-- INSERTAR AULAS TEÓRICAS
-- ============================================

INSERT INTO aulas 
(id, codigo, nombre, categoria, capacidad, observaciones, activo) 
VALUES
(8, 'AULA-1', 'Aula 1', 'AULA', 32, 
 '2do A de Contaduría tarde - 32 estudiantes / 2do B de Administración noche - 32 estudiantes.', 1),
(9, 'AULA-2', 'Aula 2', 'AULA', 45, 
 '1ro A de Contaduría tarde - 37 estudiantes / 3ro A de Administración noche - 45 estudiantes.', 1),
(10, 'AULA-3', 'Aula 3', 'AULA', 37, 
 '1ro A de Contaduría tarde - 30 estudiantes / 1ro C de Administración noche - 37 estudiantes.', 1),
(11, 'AULA-4', 'Aula 4', 'AULA', 35, 
 '1ro D de Contaduría noche - 35 estudiantes / 2do A de Administración tarde - 20 estudiantes.', 1),
(12, 'AULA-5', 'Aula 5', 'AULA', 36, 
 '3ro A de Contaduría tarde - 30 estudiantes / 1ro C de Contaduría noche - 36 estudiantes.', 1),
(5, 'AULA-6', 'Aula 6', 'AULA', 34, 
 '2do B de Contaduría noche - 34 estudiantes.', 1),
(13, 'AULA-7', 'Aula 7', 'AULA', 20, 
 '1ro B de Administración - 20 estudiantes.', 1),
(6, 'AULA-8', 'Aula 8', 'AULA', 27, 
 '3ro B de Contaduría noche - 27 estudiantes.', 1);


-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================