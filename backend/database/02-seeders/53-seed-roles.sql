-- ============================================
-- SEEDER: roles v2
-- Sistema de Gestión Académica · Instituto INCOS
-- Archivo: backend/database/02-seeders/53-seed-roles.sql
--
-- CAMBIOS respecto al legacy:
--   [NUEVO]   is_system   = TRUE en todos (protegidos de eliminación en UI)
--   [REMOVIDO] nivel_acceso (columna eliminada del schema v2)
--   [CAMBIA]  Orden de IDs: ADMIN_SISTEMA ahora es id=1 (antes era id=8)
--
-- IDs FIJOS v2:
--   1 = ADMIN_SISTEMA   (técnico del sistema, sin filas en roles_permisos)
--   2 = RECTOR
--   3 = DIR_ACADEMICO
--   4 = DIR_ADMIN
--   5 = SEC_ACADEMICA
--   6 = SEC_ADMIN
--   7 = DOCENTE
--   8 = ESTUDIANTE
--
-- NOTA: ADMIN_SISTEMA (id=1) no tiene filas en roles_permisos.
--       Sus permisos se resuelven dinámicamente desde permiso_acciones
--       en AuthRepository.findPermisosEfectivos (caso especial rol_id=1).
-- Ejecutar antes de: 54-seed-permisos.sql, 55-seed-roles-permisos.sql
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO roles (id, codigo, nombre, is_system, activo) VALUES
(1, 'ADMIN_SISTEMA', 'Administrador del Sistema', TRUE, TRUE),
(2, 'RECTOR',        'Rector',                    TRUE, TRUE),
(3, 'DIR_ACADEMICO', 'Director Académico',        TRUE, TRUE),
(4, 'DIR_ADMIN',     'Director Administrativo',   TRUE, TRUE),
(5, 'SEC_ACADEMICA', 'Secretaria Académica',      TRUE, TRUE),
(6, 'SEC_ADMIN',     'Secretaria Administrativa', TRUE, TRUE),
(7, 'DOCENTE',       'Docente',                   TRUE, TRUE),
(8, 'ESTUDIANTE',    'Estudiante',                TRUE, TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- Verificación post-insert:
-- SELECT id, codigo, is_system FROM roles ORDER BY id;
-- Esperado: 8 filas, is_system=TRUE en todas, ADMIN_SISTEMA con id=1
