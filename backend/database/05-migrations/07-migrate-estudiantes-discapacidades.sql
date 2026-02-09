-- ============================================
-- MIGRACIÓN DE DATOS: estudiantes_discapacidades
-- Origen: instituto_incos.sql
-- Schema: 10-estudiantes-relaciones.sql (tabla estudiantes_discapacidades)
-- Dependencias: 07-seed-tipos-discapacidad.sql (tipo_discapacidad_id 1=Visual, 3=Auditiva). 01-migrate-estudiantes.
-- Columnas y 4 filas verificadas contra dump.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO estudiantes_discapacidades (id, estudiante_id, tipo_discapacidad_id, descripcion, grado_discapacidad, causa, activo, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) VALUES
(1, 7, 1, NULL, 'MODERADO', NULL, 0, '2026-01-30 19:24:20', '2026-01-30 19:26:49', '2026-01-30 19:26:49', NULL, NULL, NULL),
(2, 7, 1, NULL, NULL, NULL, 1, '2026-01-30 19:26:49', '2026-01-30 19:26:49', NULL, NULL, NULL, NULL),
(3, 15, 3, NULL, 'SEVERO', NULL, 1, '2026-02-03 18:19:08', '2026-02-03 18:19:08', NULL, NULL, NULL, NULL),
(4, 21, 1, NULL, 'SEVERO', NULL, 1, '2026-02-05 17:40:08', '2026-02-05 17:40:08', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
