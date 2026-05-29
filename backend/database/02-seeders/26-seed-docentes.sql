-- ============================================
-- SEEDER: docentes
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Docentes extraídos del horario académico 2026
-- ============================================
-- Orden: SIS-INF (IDs 1-7), ADM-EMP (IDs 8-15), CON-GEN (IDs 16-31)
-- IDs fijos para facilitar referencias consistentes
-- color_hex: visualización en horarios (V2 — ya no vive en oferta_cursos)

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- INSERTAR DOCENTES
-- ============================================
-- NOTA: Los datos de CI, expedición y fecha_nacimiento son ficticios
-- Se deben actualizar con datos reales del instituto

-- DOCENTES - SISTEMAS INFORMÁTICOS (IDs 1-7)
INSERT INTO docentes (id, ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral, color_hex) VALUES
(1, '12345014', 'SC', 'Ybeth', 'Camacho', NULL, '1988-09-12', 'FEMENINO', '70000014', 'Ingeniera', 'CONTRATO', 'ACTIVO', '#0F01B1'),
(2, '12345015', 'SC', 'Roxana', 'Justiniano', NULL, '1986-05-28', 'FEMENINO', '70000015', 'Ingeniera', 'CONTRATO', 'ACTIVO', '#B14B6B'),
(3, '12345016', 'SC', 'Magali', 'Ticlla', NULL, '1990-01-19', 'FEMENINO', '70000016', 'Ingeniera', 'CONTRATO', 'ACTIVO', '#82F0C8'),
(4, '12345017', 'SC', 'Waly', 'Vargas', NULL, '1984-10-07', 'MASCULINO', '70000017', 'Ingeniero', 'CONTRATO', 'ACTIVO', '#E0A60E'),
(5, '12345018', 'SC', 'Giovanna', 'Fernandez', NULL, '1989-04-15', 'FEMENINO', '70000018', 'Ingeniera', 'CONTRATO', 'ACTIVO', '#9C129A'),
(6, '12345019', 'SC', 'Lily', 'Arenas', NULL, '1987-12-03', 'FEMENINO', '70000019', 'Ingeniera', 'CONTRATO', 'ACTIVO', '#FAC8E0'),
(7, '12345020', 'SC', 'Yesmani', 'Fernandez', NULL, '1985-08-21', 'MASCULINO', '70000020', 'Ingeniero', 'CONTRATO', 'ACTIVO', '#87D9C9');

-- DOCENTES - ADMINISTRACIÓN DE EMPRESAS (IDs 8-15)
INSERT INTO docentes (id, ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral, color_hex) VALUES
(8, '12345011', 'SC', 'Vladimir', 'Marca', NULL, '1983-03-08', 'MASCULINO', '70000011', 'Licenciado', 'CONTRATO', 'ACTIVO', '#9694CC'),
(9, '12345012', 'SC', 'Elio', 'Honor', NULL, '1987-11-17', 'MASCULINO', '70000012', 'Licenciado', 'CONTRATO', 'ACTIVO', '#625028'),
(10, '12345013', 'SC', 'Rafael', 'Montero', NULL, '1985-07-24', 'MASCULINO', '70000013', 'Licenciado', 'CONTRATO', 'ACTIVO', '#049AE2'),
(11, '12345014', 'SC', 'René', 'Roca', NULL, '1984-04-15', 'MASCULINO', '70000014', 'Licenciado', 'CONTRATO', 'ACTIVO', '#7C72FA'),
(12, '12345015', 'SC', 'Georgina', 'Moron', NULL, '1986-08-22', 'FEMENINO', '70000015', 'Licenciada', 'CONTRATO', 'ACTIVO', '#ABCD9D'),
(13, '12345016', 'SC', 'Puma', '', NULL, '1985-03-10', 'MASCULINO', '70000016', 'Licenciado', 'CONTRATO', 'ACTIVO', '#673929'),
(14, '12345017', 'SC', 'Jose Luiz', 'Uribe', NULL, '1987-11-30', 'MASCULINO', '70000017', 'Licenciado', 'CONTRATO', 'ACTIVO', '#C5EF6F'),
(15, '12345018', 'SC', 'Paola', 'Mariaca', NULL, '1988-05-20', 'FEMENINO', '70000018', 'Licenciada', 'CONTRATO', 'ACTIVO', '#6C222A');

-- DOCENTES - CONTADURÍA GENERAL (IDs 16-30)
INSERT INTO docentes (id, ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral, color_hex) VALUES
(16, '12345019', 'SC', 'Hilda', 'Barriga', NULL, '1985-05-15', 'FEMENINO', '70000019', 'Licenciada', 'CONTRATO', 'ACTIVO', '#33F585'),
(17, '12345020', 'SC', 'Sebastián', 'Vargas', NULL, '1982-03-20', 'MASCULINO', '70000020', 'Licenciado', 'CONTRATO', 'ACTIVO', '#183EE6'),
(18, '12345021', 'SC', 'Sonia', 'Carrizales', NULL, '1987-08-10', 'FEMENINO', '70000021', 'Licenciada', 'CONTRATO', 'ACTIVO', '#C0066E'),
(19, '12345022', 'SC', 'Patricia', 'Rodriguez', 'Cuellar', '1990-11-25', 'FEMENINO', '70000022', 'Técnica', 'HORARIO', 'ACTIVO', '#D4AA72'),
(20, '12345023', 'SC', 'Gonzalo', 'Icuña', NULL, '1983-07-18', 'MASCULINO', '70000023', 'Licenciado', 'CONTRATO', 'ACTIVO', '#0983E3'),
(21, '12345024', 'SC', 'Miguel', 'Padilla', NULL, '1988-04-12', 'MASCULINO', '70000024', 'Licenciado', 'CONTRATO', 'ACTIVO', '#76F42C'),
(22, '12345025', 'SC', 'Jose Luis', 'Montenegro', NULL, '1984-09-30', 'MASCULINO', '70000025', 'Licenciado', 'CONTRATO', 'ACTIVO', '#91ABCB'),
(23, '12345026', 'SC', 'Franz', 'Lujan', NULL, '1986-02-14', 'MASCULINO', '70000026', 'Licenciado', 'CONTRATO', 'ACTIVO', '#38DE86'),
(24, '12345027', 'SC', 'Manuel Ignacio', 'Ferrufino', NULL, '1985-06-22', 'MASCULINO', '70000027', 'Licenciado', 'CONTRATO', 'ACTIVO', NULL),
(25, '12345028', 'SC', 'Dory', 'Robles', NULL, '1989-12-05', 'FEMENINO', '70000028', 'Licenciada', 'CONTRATO', 'ACTIVO', '#B40AD2'),
(26, '12345029', 'SC', 'Willma', 'Fernandez', NULL, '1984-06-18', 'FEMENINO', '70000029', 'Licenciada', 'CONTRATO', 'ACTIVO', '#4C828A'),
(27, '12345030', 'SC', 'Aurelio', 'Hurtado', NULL, '1983-09-22', 'MASCULINO', '70000030', 'Licenciado', 'CONTRATO', 'ACTIVO', '#F5E019'),
(28, '12345031', 'SC', 'Elias', 'Sarzuri', NULL, '1985-11-08', 'MASCULINO', '70000031', 'Licenciado', 'CONTRATO', 'ACTIVO', '#80C62E'),
(29, '12345032', 'SC', 'Teodora', 'Paraguayo', NULL, '1986-04-14', 'FEMENINO', '70000032', 'Licenciada', 'CONTRATO', 'ACTIVO', '#BF71A1'),
(30, '12345033', 'SC', 'José Antonio', 'Vara', NULL, '1982-12-03', 'MASCULINO', '70000033', 'Licenciado', 'CONTRATO', 'ACTIVO', '#FF97B8');

-- DOCENTE ADICIONAL — Excel horarios 2026-02-18 (nombre en planilla; apellido pendiente)
INSERT INTO docentes (id, ci, expedicion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, celular, titulo_profesional, tipo_contrato, estado_laboral, color_hex) VALUES
(31, '12345034', 'SC', 'Yessica', '', NULL, '1990-01-01', 'FEMENINO', '70000034', 'Licenciada', 'CONTRATO', 'ACTIVO', '#FF5722');

SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 31 docentes (Gestión 2026)
