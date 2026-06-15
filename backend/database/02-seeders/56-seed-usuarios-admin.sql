-- ============================================
-- SEEDER: usuarios admin inicial v2
-- Sistema de Gestión Académica · Instituto INCOS
-- Archivo: backend/database/02-seeders/56-seed-usuarios-admin.sql
--
-- CAMBIOS respecto al legacy:
--   [CAMBIA] rol_id = 1 (ADMIN_SISTEMA ahora es id=1, antes era id=8)
--   [CAMBIA] sin columna usuarios.email — el correo va en personal.email_personal
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO personal (
  ci,
  expedicion,
  nombres,
  apellido_paterno,
  apellido_materno,
  email_personal,
  activo
) VALUES (
  '0000000',
  NULL,
  'Administrador',
  'Sistema',
  NULL,
  'admin@incos-santacruz.edu.bo',
  TRUE
);

SET @personal_admin_id = LAST_INSERT_ID();

INSERT INTO usuarios (id, username, password_hash, rol_id,
                      referencia_id, tipo_referencia, estado, activo) VALUES
(1, 'admin',
    '$2a$12$xVRJUKxiZ5wggdPBPjO7G.KUwxKMbAluUO/D2CybQ3k8Qq1RKgvxm',
    1, @personal_admin_id, NULL, NULL, TRUE);

UPDATE personal SET usuario_id = 1 WHERE id = @personal_admin_id;

SET FOREIGN_KEY_CHECKS = 1;

-- Verificación post-insert:
-- SELECT u.id, u.username, r.codigo AS rol, p.email_personal
-- FROM usuarios u JOIN roles r ON r.id = u.rol_id
-- LEFT JOIN personal p ON p.id = u.referencia_id AND u.tipo_referencia IS NULL;
-- Esperado: admin → ADMIN_SISTEMA con correo en personal
