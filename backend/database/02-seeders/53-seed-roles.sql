-- ============================================
-- SEEDER: roles v2 (actualizado)
-- Sistema de Gestión Académica · Instituto INCOS
-- Archivo: backend/database/02-seeders/53-seed-roles.sql
--
-- CAMBIOS v2.1:
--   [NUEVO] campo tipo VARCHAR(50): categoría visual del rol
--           Permite mostrar en la UI qué tipo de perfil representa el rol,
--           independiente de is_system (que protege de eliminación técnica).
--
-- IDs FIJOS:
--   1 = ADMIN_SISTEMA
--   2 = RECTOR
--   3 = DIR_ACADEMICO
--   4 = DIR_ADMIN
--   5 = SEC_ACADEMICA
--   6 = SEC_ADMIN
--   7 = DOCENTE
--   8 = ESTUDIANTE
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO roles (id, codigo, nombre, tipo, is_system, activo) VALUES
(1, 'ADMIN_SISTEMA', 'Administrador del Sistema', 'SISTEMA',     TRUE, TRUE),
(2, 'RECTOR',        'Rector',                    'RECTOR',   TRUE, TRUE),
(3, 'DIR_ACADEMICO', 'Director Académico',        'DIRECTIVO',   TRUE, TRUE),
(4, 'DIR_ADMIN',     'Director Administrativo',   'DIRECTIVO',   TRUE, TRUE),
(5, 'SEC_ACADEMICA', 'Secretaria Académica',      'SECRETARIA',  TRUE, TRUE),
(6, 'SEC_ADMIN',     'Secretaria Administrativa', 'SECRETARIA',  TRUE, TRUE),
(7, 'DOCENTE',       'Docente',                   'DOCENTE',     TRUE, TRUE),
(8, 'ESTUDIANTE',    'Estudiante',                'ESTUDIANTE',  TRUE, TRUE);

SET FOREIGN_KEY_CHECKS = 1;
