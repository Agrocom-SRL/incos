-- ============================================
-- SEEDER: roles
-- Sistema de Gestión Académica - Instituto INCOS
-- Ejecutar antes de 54-seed-permisos.sql y 55-seed-roles-permisos.sql
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- INSERTAR ROLES
-- Ordenados de mayor a menor nivel de acceso
-- IDs fijos: 1=RECTOR … 7=ESTUDIANTE, 8=ADMIN_SISTEMA
-- ============================================

INSERT INTO roles (id, codigo, nombre, nivel_acceso, activo) VALUES
(1, 'RECTOR',        'Rector',                       5, TRUE),
(2, 'DIR_ACADEMICO', 'Director Académico',            4, TRUE),
(3, 'DIR_ADMIN',     'Director Administrativo',       4, TRUE),
(4, 'SEC_ACADEMICA', 'Secretaria Académica',          3, TRUE),
(5, 'SEC_ADMIN',     'Secretaria Administrativa',     3, TRUE),
(6, 'DOCENTE',       'Docente',                       2, TRUE),
(7, 'ESTUDIANTE',    'Estudiante',                    1, TRUE),
(8, 'ADMIN_SISTEMA', 'Administrador del Sistema',     5, TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER (roles)
-- ============================================
