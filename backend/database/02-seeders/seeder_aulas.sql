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
-- ============================================

-- LABORATORIOS
INSERT INTO aulas (codigo, nombre, categoria, capacidad, observaciones) VALUES
('LAB-1', 'Laboratorio 1', 'LABORATORIO', 35, 'Laboratorio de computación - Turno Tarde'),
('LAB-2', 'Laboratorio 2', 'LABORATORIO', 35, 'Laboratorio de computación - Turno Tarde'),
('LAB-3', 'Laboratorio 3', 'LABORATORIO', 35, 'Laboratorio de computación - Turno Tarde/Noche'),
('LAB-4', 'Laboratorio 4', 'LABORATORIO', 35, 'Laboratorio de computación - Turno Noche');

-- AULAS TEÓRICAS
INSERT INTO aulas (codigo, nombre, categoria, capacidad, observaciones) VALUES
('AULA-6', 'Aula 6', 'AULA', 40, 'Aula teórica - Turno Tarde/Noche'),
('AULA-8', 'Aula 8', 'AULA', 40, 'Aula teórica - Turno Noche');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
