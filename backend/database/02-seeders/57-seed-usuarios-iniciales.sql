-- ============================================
-- SEEDER: usuarios
-- Sistema de Gestión Académica - Instituto INCOS
-- Usuario administrador inicial del sistema
-- Ejecutar después de 56-seed-permiso-acciones.sql
-- (El rol ADMIN_SISTEMA debe tener catálogo completo en roles_permisos)
-- ADVERTENCIA: cambiar la contraseña en el primer acceso al sistema
-- ============================================
-- NOTA: password_hash bcrypt corresponde a la contraseña de prueba '12345678'
--       (solo para desarrollo; cambiar en producción o tras el primer acceso)

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- INSERTAR USUARIO ADMINISTRADOR INICIAL
-- Usuario técnico para primer arranque y gestión del sistema
-- IDs fijos para facilitar migraciones y referencias consistentes
-- Contraseña de prueba: 12345678 (cambiar en producción)
-- ============================================

INSERT INTO usuarios (id, username, email, password_hash, rol_id,
                      referencia_id, tipo_referencia, estado, activo) VALUES
(1, 'admin', 'admin@incos-santacruz.edu.bo',
    '$2a$12$xVRJUKxiZ5wggdPBPjO7G.KUwxKMbAluUO/D2CybQ3k8Qq1RKgvxm',
    8, NULL, NULL, NULL, TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER (usuarios)
-- ============================================

