-- ============================================
-- SEEDER: aulas
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Aulas y laboratorios del instituto
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE aulas;

-- ============================================
-- INSERTAR AULAS Y LABORATORIOS
-- IDs fijos: 1-4 (Laboratorios), 5-6 (Aulas)
-- ============================================

-- LABORATORIOS
INSERT INTO aulas (id, codigo, nombre, categoria, capacidad, observaciones) VALUES
(1, 'LAB-1', 'Laboratorio 1', 'LABORATORIO', 35, 'Laboratorio de computación - Turno Tarde'),
(2, 'LAB-2', 'Laboratorio 2', 'LABORATORIO', 35, 'Laboratorio de computación - Turno Tarde'),
(3, 'LAB-3', 'Laboratorio 3', 'LABORATORIO', 35, 'Laboratorio de computación - Turno Tarde/Noche'),
(4, 'LAB-4', 'Laboratorio 4', 'LABORATORIO', 35, 'Laboratorio de computación - Turno Noche');

-- AULAS TEÓRICAS
INSERT INTO aulas (id, codigo, nombre, categoria, capacidad, observaciones) VALUES
(5, 'AULA-6', 'Aula 6', 'AULA', 40, 'Aula teórica - Turno Tarde/Noche'),
(6, 'AULA-8', 'Aula 8', 'AULA', 40, 'Aula teórica - Turno Noche');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
