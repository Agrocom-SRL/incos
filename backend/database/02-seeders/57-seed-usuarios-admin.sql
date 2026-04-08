-- ============================================
-- SEEDER: usuarios admin inicial v2
-- Sistema de Gestión Académica · Instituto INCOS
-- Archivo: backend/database/02-seeders/57-seed-usuarios-admin.sql
--
-- CAMBIOS respecto al legacy:
--   [CAMBIA] rol_id = 1 (ADMIN_SISTEMA ahora es id=1, antes era id=8)
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO usuarios (id, username, email, password_hash, rol_id,
                      referencia_id, tipo_referencia, estado, activo) VALUES
(1, 'admin', 'admin@incos-santacruz.edu.bo',
    '$2a$12$xVRJUKxiZ5wggdPBPjO7G.KUwxKMbAluUO/D2CybQ3k8Qq1RKgvxm',
    1, NULL, NULL, NULL, TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- Verificación post-insert:
-- SELECT u.id, u.username, r.codigo AS rol
-- FROM usuarios u JOIN roles r ON r.id = u.rol_id;
-- Esperado: admin → ADMIN_SISTEMA
