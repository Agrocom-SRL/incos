-- ============================================
-- SEEDER: paises
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Bolivia
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE paises;

-- ============================================
-- INSERTAR PAÍSES
-- ============================================

INSERT INTO paises (nombre, codigo_iso) VALUES
('Bolivia', 'BOL'),
('Argentina', 'ARG'),
('Brasil', 'BRA'),
('Chile', 'CHL'),
('Colombia', 'COL'),
('Ecuador', 'ECU'),
('Guyana', 'GUY'),
('Paraguay', 'PRY'),
('Perú', 'PER'),
('Surinam', 'SUR'),
('Uruguay', 'URY'),
('Venezuela', 'VEN'),
('Estados Unidos', 'USA'),
('España', 'ESP'),
('México', 'MEX'),
('Panamá', 'PAN'),
('Costa Rica', 'CRI'),
('República Dominicana', 'DOM'),
('Cuba', 'CUB'),
('Honduras', 'HND'),
('El Salvador', 'SLV'),
('Guatemala', 'GTM'),
('Nicaragua', 'NIC'),
('Haití', 'HTI'),
('Jamaica', 'JAM'),
('Trinidad y Tobago', 'TTO'),
('Barbados', 'BRB'),
('Bahamas', 'BHS'),
('Belice', 'BLZ'),
('Guyana Francesa', 'GUF'),
('Puerto Rico', 'PRI');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

