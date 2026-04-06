-- ============================================
-- SEEDER: usuarios
-- Sistema de Gestión Académica - Instituto INCOS
-- Usuario administrador inicial del sistema
-- Ejecutar después de 53-seed-roles.sql
-- ADVERTENCIA: cambiar la contraseña en el primer acceso al sistema
-- ============================================
-- NOTA: password_hash bcrypt corresponde a la contraseña 'Admin2025!'
--       Debe cambiarse en el primer acceso al sistema.

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- INSERTAR USUARIO ADMINISTRADOR INICIAL
-- Usuario técnico para primer arranque y gestión del sistema
-- IDs fijos para facilitar migraciones y referencias consistentes
-- ADVERTENCIA: la contraseña inicial es 'Admin2025!'
--              Debe cambiarse inmediatamente después del primer acceso
-- ============================================

INSERT INTO usuarios (id, username, email, password_hash, rol_id,
                      referencia_id, tipo_referencia, estado, activo) VALUES
(1, 'admin', 'admin@incos-santacruz.edu.bo',
    '$2a$12$m32JuiW73iPgLQt.oHmEB.uOR5l2FD8WAiIBI98L7RVsnKKVCDmtC',
    8, NULL, NULL, NULL, TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER (usuarios)
-- ============================================
