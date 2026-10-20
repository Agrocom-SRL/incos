-- ============================================================================
-- SEED SOLO DE PRUEBAS — NUNCA CARGAR EN PRODUCCIÓN NI EN UNA BD CON DATOS REALES
-- ----------------------------------------------------------------------------
-- Archivo: backend/database/04-test-seeds/01-test-usuarios.sql
-- Lo carga únicamente `backend/scripts/ci-cargar-bd.sh` sobre una BD efímera
-- (`*_test`) para las pruebas de integración (`npm run test:integration`).
--
-- Contenido: un usuario FICTICIO por rol sembrado en 02-seeders/55-seed-roles.sql,
-- todos con la MISMA contraseña de prueba (no es un secreto):
--
--     contraseña: Test-Incos-2026
--     hash bcrypt (cost 10, bcryptjs, mismo algoritmo que LoginUseCase):
--     $2a$10$MY.mvuoNpIYRvuQN8ugELu1Pby0YZtGQs0dI34qUr0wl7Eeln5tJ2
--
-- Usuario            Rol             Vínculo
-- test.admin         ADMIN_SISTEMA   personal (sin tipo_referencia)
-- test.rector        RECTOR          personal  (RECTOR)
-- test.dir_academico DIR_ACADEMICO   personal  (DIRECTOR)
-- test.dir_admin     DIR_ADMIN       personal  (DIRECTOR)
-- test.sec_academica SEC_ACADEMICA   personal  (SECRETARIA)
-- test.sec_admin     SEC_ADMIN       personal  (SECRETARIA)
-- test.docente       DOCENTE         docentes  (ficha ficticia)
-- test.estudiante    ESTUDIANTE      estudiantes (ficha ficticia)
--
-- Correos: test.<rol>@incos.test (dominio reservado; no existe).
-- Personas ficticias: CI con prefijo TEST-, sin datos reales.
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

SET @hash = '$2a$10$MY.mvuoNpIYRvuQN8ugELu1Pby0YZtGQs0dI34qUr0wl7Eeln5tJ2';

-- ---------------------------------------------------------------------------
-- Personal institucional (admin, rector, directores, secretarias)
-- ---------------------------------------------------------------------------
INSERT INTO personal (ci, expedicion, nombres, apellido_paterno, apellido_materno, email_personal, activo) VALUES
  ('TEST-ADM-001', NULL, 'Prueba', 'Admin',        'Sistema',    'test.admin@incos.test',        TRUE),
  ('TEST-REC-001', NULL, 'Prueba', 'Rector',       'Ficticio',   'test.rector@incos.test',       TRUE),
  ('TEST-DAC-001', NULL, 'Prueba', 'DirAcademico', 'Ficticio',   'test.dir_academico@incos.test', TRUE),
  ('TEST-DAD-001', NULL, 'Prueba', 'DirAdmin',     'Ficticio',   'test.dir_admin@incos.test',    TRUE),
  ('TEST-SAC-001', NULL, 'Prueba', 'SecAcademica', 'Ficticia',   'test.sec_academica@incos.test', TRUE),
  ('TEST-SAD-001', NULL, 'Prueba', 'SecAdmin',     'Ficticia',   'test.sec_admin@incos.test',    TRUE);

SET @p_admin = (SELECT id FROM personal WHERE ci = 'TEST-ADM-001');
SET @p_rec   = (SELECT id FROM personal WHERE ci = 'TEST-REC-001');
SET @p_dac   = (SELECT id FROM personal WHERE ci = 'TEST-DAC-001');
SET @p_dad   = (SELECT id FROM personal WHERE ci = 'TEST-DAD-001');
SET @p_sac   = (SELECT id FROM personal WHERE ci = 'TEST-SAC-001');
SET @p_sad   = (SELECT id FROM personal WHERE ci = 'TEST-SAD-001');

-- ---------------------------------------------------------------------------
-- Docente y estudiante ficticios
-- ---------------------------------------------------------------------------
INSERT INTO docentes (ci, expedicion, nombres, apellido_paterno, apellido_materno,
                      fecha_nacimiento, genero, celular, email_personal, activo)
VALUES ('TEST-DOC-001', 'SC', 'Prueba', 'Docente', 'Ficticio',
        '1990-01-01', 'OTRO', '70000001', 'test.docente@incos.test', TRUE);
SET @docente_id = LAST_INSERT_ID();

INSERT INTO estudiantes (codigo_estudiante, ci, nombres, apellido_paterno, apellido_materno,
                         fecha_nacimiento, genero, celular, email_personal, activo)
VALUES ('TEST-EST-001', 'TEST-EST-001', 'Prueba', 'Estudiante', 'Ficticio',
        '2000-01-01', 'OTRO', '70000002', 'test.estudiante@incos.test', TRUE);
SET @estudiante_id = LAST_INSERT_ID();

-- ---------------------------------------------------------------------------
-- Usuarios (rol por CÓDIGO, nunca por id)
-- ---------------------------------------------------------------------------
INSERT INTO usuarios (username, password_hash, rol_id, referencia_id, tipo_referencia, estado, activo)
SELECT x.username, @hash, r.id, x.referencia_id, x.tipo_referencia, NULL, TRUE
FROM (
  SELECT 'test.admin'         AS username, 'ADMIN_SISTEMA' AS rol, @p_admin AS referencia_id, NULL         AS tipo_referencia
  UNION ALL SELECT 'test.rector',        'RECTOR',        @p_rec,        'RECTOR'
  UNION ALL SELECT 'test.dir_academico', 'DIR_ACADEMICO', @p_dac,        'DIRECTOR'
  UNION ALL SELECT 'test.dir_admin',     'DIR_ADMIN',     @p_dad,        'DIRECTOR'
  UNION ALL SELECT 'test.sec_academica', 'SEC_ACADEMICA', @p_sac,        'SECRETARIA'
  UNION ALL SELECT 'test.sec_admin',     'SEC_ADMIN',     @p_sad,        'SECRETARIA'
  UNION ALL SELECT 'test.docente',       'DOCENTE',       @docente_id,   'DOCENTE'
  UNION ALL SELECT 'test.estudiante',    'ESTUDIANTE',    @estudiante_id,'ESTUDIANTE'
) x
JOIN roles r ON r.codigo = x.rol;

-- Vínculo inverso ficha -> usuario
UPDATE personal p JOIN usuarios u ON u.referencia_id = p.id AND u.username IN
  ('test.admin','test.rector','test.dir_academico','test.dir_admin','test.sec_academica','test.sec_admin')
  SET p.usuario_id = u.id
  WHERE p.ci LIKE 'TEST-%';
UPDATE docentes     SET usuario_id = (SELECT id FROM usuarios WHERE username = 'test.docente')    WHERE id = @docente_id;
UPDATE estudiantes  SET usuario_id = (SELECT id FROM usuarios WHERE username = 'test.estudiante') WHERE id = @estudiante_id;

SET FOREIGN_KEY_CHECKS = 1;
