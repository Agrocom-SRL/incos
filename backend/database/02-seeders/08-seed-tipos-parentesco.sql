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
-- IDs fijos para facilitar migraciones y referencias consistentes
-- ============================================

INSERT INTO tipos_parentesco (id, nombre, descripcion) VALUES
(1, 'Padre', 'Padre biológico o adoptivo del estudiante'),
(2, 'Madre', 'Madre biológica o adoptiva del estudiante'),
(3, 'Padrastro', 'Cónyuge o pareja de la madre del estudiante (padre no biológico)'),
(4, 'Madrastra', 'Cónyuge o pareja del padre del estudiante (madre no biológica)'),
(5, 'Abuelo(a)', 'Abuelo o abuela del estudiante'),
(6, 'Abuelastro(a)', 'Cónyuge del abuelo o abuela del estudiante'),
(7, 'Tío(a)', 'Tío o tía del estudiante (hermano/a del padre o madre)'),
(8, 'Tío(a) Político(a)', 'Cónyuge del tío o tía del estudiante'),
(9, 'Hermano(a)', 'Hermano o hermana del estudiante (mayor de edad)'),
(10, 'Hermanastro(a)', 'Hijo o hija del padrastro o madrastra del estudiante'),
(11, 'Primo(a)', 'Primo o prima del estudiante (hijo/a del tío o tía)'),
(12, 'Cuñado(a)', 'Hermano o hermana del cónyuge del padre o madre'),
(13, 'Tutor(a)', 'Persona designada legalmente como tutor del estudiante'),
(14, 'Apoderado(a)', 'Persona autorizada para representar al estudiante'),
(15, 'Padrino/Madrina', 'Padrino o madrina del estudiante (compadre/comadre)'),
(16, 'Otro', 'Otra relación de parentesco o familiar no especificada');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

