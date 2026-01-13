-- ============================================
-- SEEDER: docentes
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Docentes extraídos del horario académico 2025
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE docentes;

-- ============================================
-- INSERTAR DOCENTES
-- ============================================
-- NOTA: Los datos de CI, expedición y fecha_nacimiento son ficticios
-- Se deben actualizar con datos reales del instituto

-- DOCENTES - CONTADURÍA GENERAL
INSERT INTO docentes (ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral) VALUES
('12345001', 'SC', 'Hilda', 'Barriga', NULL, '1985-05-15', 'FEMENINO', '70000001', 'Licenciada', 'CONTRATO', 'ACTIVO'),
('12345002', 'SC', 'Sebastián', 'Vargas', NULL, '1982-03-20', 'MASCULINO', '70000002', 'Licenciado', 'CONTRATO', 'ACTIVO'),
('12345003', 'SC', 'Sonia', 'Carrizales', NULL, '1987-08-10', 'FEMENINO', '70000003', 'Licenciada', 'CONTRATO', 'ACTIVO'),
('12345004', 'SC', 'Patricia', 'Rodriguez Cuellar', NULL, '1990-11-25', 'FEMENINO', '70000004', 'Técnica', 'HORARIO', 'ACTIVO'),
('12345005', 'SC', 'Gonzalo', 'Icuña', NULL, '1983-07-18', 'MASCULINO', '70000005', 'Licenciado', 'CONTRATO', 'ACTIVO'),
('12345006', 'SC', 'Miguel', 'Padilla', NULL, '1988-04-12', 'MASCULINO', '70000006', 'Licenciado', 'CONTRATO', 'ACTIVO'),
('12345007', 'SC', 'Jose Luis', 'Montenegro', NULL, '1984-09-30', 'MASCULINO', '70000007', 'Licenciado', 'CONTRATO', 'ACTIVO'),
('12345008', 'SC', 'Franz', 'Lujan', NULL, '1986-02-14', 'MASCULINO', '70000008', 'Licenciado', 'CONTRATO', 'ACTIVO'),
('12345009', 'SC', 'Manuel Ignacio', 'Ferrufino', NULL, '1985-06-22', 'MASCULINO', '70000009', 'Licenciado', 'CONTRATO', 'ACTIVO'),
('12345010', 'SC', 'Dory', 'Robles', NULL, '1989-12-05', 'FEMENINO', '70000010', 'Licenciada', 'CONTRATO', 'ACTIVO');

-- DOCENTES - ADMINISTRACIÓN DE EMPRESAS
INSERT INTO docentes (ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral) VALUES
('12345011', 'SC', 'Vladimir', 'Marca', NULL, '1983-03-08', 'MASCULINO', '70000011', 'Licenciado', 'CONTRATO', 'ACTIVO'),
('12345012', 'SC', 'Elio', 'Honor', NULL, '1987-11-17', 'MASCULINO', '70000012', 'Licenciado', 'CONTRATO', 'ACTIVO'),
('12345013', 'SC', 'Rafael', 'Montero', NULL, '1985-07-24', 'MASCULINO', '70000013', 'Licenciado', 'CONTRATO', 'ACTIVO');

-- DOCENTES - SISTEMAS INFORMÁTICOS
INSERT INTO docentes (ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral) VALUES
('12345014', 'SC', 'Ybeth', 'Camacho', NULL, '1988-09-12', 'FEMENINO', '70000014', 'Ingeniera', 'CONTRATO', 'ACTIVO'),
('12345015', 'SC', 'Roxana', 'Justiniano', NULL, '1986-05-28', 'FEMENINO', '70000015', 'Ingeniera', 'CONTRATO', 'ACTIVO'),
('12345016', 'SC', 'Magali', 'Ticlla', NULL, '1990-01-19', 'FEMENINO', '70000016', 'Ingeniera', 'CONTRATO', 'ACTIVO'),
('12345017', 'SC', 'Waly', 'Vargas', NULL, '1984-10-07', 'MASCULINO', '70000017', 'Ingeniero', 'CONTRATO', 'ACTIVO'),
('12345018', 'SC', 'Giovanna', 'Fernandez', NULL, '1989-04-15', 'FEMENINO', '70000018', 'Ingeniera', 'CONTRATO', 'ACTIVO'),
('12345019', 'SC', 'Lily', 'Arenas', NULL, '1987-12-03', 'FEMENINO', '70000019', 'Ingeniera', 'CONTRATO', 'ACTIVO'),
('12345020', 'SC', 'Yesmani', 'Fernandez', NULL, '1985-08-21', 'MASCULINO', '70000020', 'Ingeniero', 'CONTRATO', 'ACTIVO');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
