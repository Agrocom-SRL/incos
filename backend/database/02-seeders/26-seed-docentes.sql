-- ============================================
-- SEEDER: docentes
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Docentes extraídos del horario académico 2025
-- ============================================
-- Orden: SIS-INF (IDs 1-7), ADM-EMP (IDs 8-15), CON-GEN (IDs 16-30)
-- IDs fijos para facilitar referencias consistentes

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

-- DOCENTES - SISTEMAS INFORMÁTICOS (IDs 1-7)
INSERT INTO docentes (id, ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral) VALUES
(1, '12345014', 'SC', 'Ybeth', 'Camacho', NULL, '1988-09-12', 'FEMENINO', '70000014', 'Ingeniera', 'CONTRATO', 'ACTIVO'),
(2, '12345015', 'SC', 'Roxana', 'Justiniano', NULL, '1986-05-28', 'FEMENINO', '70000015', 'Ingeniera', 'CONTRATO', 'ACTIVO'),
(3, '12345016', 'SC', 'Magali', 'Ticlla', NULL, '1990-01-19', 'FEMENINO', '70000016', 'Ingeniera', 'CONTRATO', 'ACTIVO'),
(4, '12345017', 'SC', 'Waly', 'Vargas', NULL, '1984-10-07', 'MASCULINO', '70000017', 'Ingeniero', 'CONTRATO', 'ACTIVO'),
(5, '12345018', 'SC', 'Giovanna', 'Fernandez', NULL, '1989-04-15', 'FEMENINO', '70000018', 'Ingeniera', 'CONTRATO', 'ACTIVO'),
(6, '12345019', 'SC', 'Lily', 'Arenas', NULL, '1987-12-03', 'FEMENINO', '70000019', 'Ingeniera', 'CONTRATO', 'ACTIVO'),
(7, '12345020', 'SC', 'Yesmani', 'Fernandez', NULL, '1985-08-21', 'MASCULINO', '70000020', 'Ingeniero', 'CONTRATO', 'ACTIVO');

-- DOCENTES - ADMINISTRACIÓN DE EMPRESAS (IDs 8-15)
INSERT INTO docentes (id, ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral) VALUES
(8, '12345011', 'SC', 'Vladimir', 'Marca', NULL, '1983-03-08', 'MASCULINO', '70000011', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(9, '12345012', 'SC', 'Elio', 'Honor', NULL, '1987-11-17', 'MASCULINO', '70000012', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(10, '12345013', 'SC', 'Rafael', 'Montero', NULL, '1985-07-24', 'MASCULINO', '70000013', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(11, '12345014', 'SC', 'René', 'Roca', NULL, '1984-04-15', 'MASCULINO', '70000014', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(12, '12345015', 'SC', 'Georgina', 'Moron', NULL, '1986-08-22', 'FEMENINO', '70000015', 'Licenciada', 'CONTRATO', 'ACTIVO'),
(13, '12345016', 'SC', 'Puma', NULL, NULL, '1985-03-10', 'MASCULINO', '70000016', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(14, '12345017', 'SC', 'Jose Luiz', 'Uribe', NULL, '1987-11-30', 'MASCULINO', '70000017', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(15, '12345018', 'SC', 'Paola', 'Mariaca', NULL, '1988-05-20', 'FEMENINO', '70000018', 'Licenciada', 'CONTRATO', 'ACTIVO');

-- DOCENTES - CONTADURÍA GENERAL (IDs 16-30)
INSERT INTO docentes (id, ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral) VALUES
(16, '12345019', 'SC', 'Hilda', 'Barriga', NULL, '1985-05-15', 'FEMENINO', '70000019', 'Licenciada', 'CONTRATO', 'ACTIVO'),
(17, '12345020', 'SC', 'Sebastián', 'Vargas', NULL, '1982-03-20', 'MASCULINO', '70000020', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(18, '12345021', 'SC', 'Sonia', 'Carrizales', NULL, '1987-08-10', 'FEMENINO', '70000021', 'Licenciada', 'CONTRATO', 'ACTIVO'),
(19, '12345022', 'SC', 'Patricia', 'Rodriguez', 'Cuellar', '1990-11-25', 'FEMENINO', '70000022', 'Técnica', 'HORARIO', 'ACTIVO'),
(20, '12345023', 'SC', 'Gonzalo', 'Icuña', NULL, '1983-07-18', 'MASCULINO', '70000023', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(21, '12345024', 'SC', 'Miguel', 'Padilla', NULL, '1988-04-12', 'MASCULINO', '70000024', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(22, '12345025', 'SC', 'Jose Luis', 'Montenegro', NULL, '1984-09-30', 'MASCULINO', '70000025', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(23, '12345026', 'SC', 'Franz', 'Lujan', NULL, '1986-02-14', 'MASCULINO', '70000026', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(24, '12345027', 'SC', 'Manuel Ignacio', 'Ferrufino', NULL, '1985-06-22', 'MASCULINO', '70000027', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(25, '12345028', 'SC', 'Dory', 'Robles', NULL, '1989-12-05', 'FEMENINO', '70000028', 'Licenciada', 'CONTRATO', 'ACTIVO'),
(26, '12345029', 'SC', 'Willma', 'Fernandez', NULL, '1984-06-18', 'FEMENINO', '70000029', 'Licenciada', 'CONTRATO', 'ACTIVO'),
(27, '12345030', 'SC', 'Aurelio', 'Hurtado', NULL, '1983-09-22', 'MASCULINO', '70000030', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(28, '12345031', 'SC', 'Elias', 'Sarzuri', NULL, '1985-11-08', 'MASCULINO', '70000031', 'Licenciado', 'CONTRATO', 'ACTIVO'),
(29, '12345032', 'SC', 'Teodora', 'Paraguayo', NULL, '1986-04-14', 'FEMENINO', '70000032', 'Licenciada', 'CONTRATO', 'ACTIVO'),
(30, '12345033', 'SC', 'José Antonio', 'Vara', NULL, '1982-12-03', 'MASCULINO', '70000033', 'Licenciado', 'CONTRATO', 'ACTIVO');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE DOCENTES CREADOS
-- ============================================
-- SISTEMAS INFORMÁTICOS (IDs 1-7): 7 docentes
-- ADMINISTRACIÓN DE EMPRESAS (IDs 8-15): 8 docentes
--   - Vladimir Marca, Elio Honor, Rafael Montero, René Roca, Georgina Moron, PUMA, Jose Luiz Uribe, Paola Mariaca
-- CONTADURÍA GENERAL (IDs 16-30): 15 docentes
--   - Hilda Barriga, Sebastián Vargas, Sonia Carrizales, Patricia Rodriguez Cuellar, Gonzalo Icuña, Miguel Padilla, Jose Luis Montenegro, Franz Lujan, Manuel Ignacio Ferrufino, Dory Robles, Willma Fernandez, Aurelio Hurtado, Elias Sarzuri, Teodora Paraguayo, José Antonio Vara
-- TOTAL: 30 docentes
-- ============================================
-- FIN DEL SEEDER
-- ============================================
