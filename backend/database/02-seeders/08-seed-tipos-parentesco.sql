-- ============================================
-- SEEDER: tipos_parentesco
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Tipos de parentesco para apoderados/tutores
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE tipos_parentesco;

-- ============================================
-- INSERTAR TIPOS DE PARENTESCO
-- ============================================

INSERT INTO tipos_parentesco (nombre, descripcion) VALUES
('Padre', 'Padre biológico o adoptivo del estudiante'),
('Madre', 'Madre biológica o adoptiva del estudiante'),
('Padrastro', 'Cónyuge o pareja de la madre del estudiante (padre no biológico)'),
('Madrastra', 'Cónyuge o pareja del padre del estudiante (madre no biológica)'),
('Abuelo(a)', 'Abuelo o abuela del estudiante'),
('Abuelastro(a)', 'Cónyuge del abuelo o abuela del estudiante'),
('Tío(a)', 'Tío o tía del estudiante (hermano/a del padre o madre)'),
('Tío(a) Político(a)', 'Cónyuge del tío o tía del estudiante'),
('Hermano(a)', 'Hermano o hermana del estudiante (mayor de edad)'),
('Hermanastro(a)', 'Hijo o hija del padrastro o madrastra del estudiante'),
('Primo(a)', 'Primo o prima del estudiante (hijo/a del tío o tía)'),
('Cuñado(a)', 'Hermano o hermana del cónyuge del padre o madre'),
('Tutor(a)', 'Persona designada legalmente como tutor del estudiante'),
('Apoderado(a)', 'Persona autorizada para representar al estudiante'),
('Padrino/Madrina', 'Padrino o madrina del estudiante (compadre/comadre)'),
('Otro', 'Otra relación de parentesco o familiar no especificada');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

