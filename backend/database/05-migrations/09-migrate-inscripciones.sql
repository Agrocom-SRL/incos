-- ============================================
-- MIGRACIÓN DE DATOS: inscripciones
-- Origen: instituto_incos.sql
-- Schema: 12-inscripciones-parte1.sql (tabla inscripciones)
-- Ajuste: traspaso_id, transitabilidad_id (NULL; dump no los tiene)
-- Dependencias: 02-migrate-estudiantes-datos-academicos, 16-seed-gestiones (gestion_id 2). 09 debe ejecutarse después de 02.
-- Columnas y 24 filas verificadas contra dump.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO inscripciones (id, estudiante_datos_academicos_id, gestion_id, tipo_inscripcion, traspaso_id, transitabilidad_id, fecha_inscripcion, observaciones, activo, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) VALUES
(1, 1, 2, 'NUEVO', NULL, NULL, '2026-01-30', NULL, 1, '2026-01-30 14:56:32', '2026-01-30 14:56:32', NULL, NULL, NULL, NULL),
(2, 2, 2, 'NUEVO', NULL, NULL, '2026-01-30', NULL, 1, '2026-01-30 15:38:32', '2026-01-30 15:38:32', NULL, NULL, NULL, NULL),
(3, 3, 2, 'NUEVO', NULL, NULL, '2026-01-30', NULL, 1, '2026-01-30 15:59:35', '2026-01-30 15:59:35', NULL, NULL, NULL, NULL),
(4, 4, 2, 'NUEVO', NULL, NULL, '2026-01-30', NULL, 1, '2026-01-30 18:23:25', '2026-01-30 18:23:25', NULL, NULL, NULL, NULL),
(5, 5, 2, 'NUEVO', NULL, NULL, '2026-01-30', NULL, 1, '2026-01-30 18:39:00', '2026-01-30 18:39:00', NULL, NULL, NULL, NULL),
(6, 6, 2, 'NUEVO', NULL, NULL, '2026-01-30', NULL, 1, '2026-01-30 19:25:40', '2026-01-30 19:25:40', NULL, NULL, NULL, NULL),
(7, 7, 2, 'NUEVO', NULL, NULL, '2026-01-30', NULL, 1, '2026-01-30 21:45:37', '2026-01-30 21:45:37', NULL, NULL, NULL, NULL),
(8, 8, 2, 'NUEVO', NULL, NULL, '2026-01-30', NULL, 1, '2026-01-30 21:51:47', '2026-01-30 21:51:47', NULL, NULL, NULL, NULL),
(9, 9, 2, 'NUEVO', NULL, NULL, '2026-02-02', NULL, 1, '2026-02-02 13:44:19', '2026-02-02 13:44:19', NULL, NULL, NULL, NULL),
(10, 10, 2, 'NUEVO', NULL, NULL, '2026-02-02', NULL, 1, '2026-02-02 14:58:48', '2026-02-02 14:58:48', NULL, NULL, NULL, NULL),
(11, 11, 2, 'NUEVO', NULL, NULL, '2026-02-02', NULL, 1, '2026-02-02 21:38:11', '2026-02-02 21:38:11', NULL, NULL, NULL, NULL),
(12, 12, 2, 'NUEVO', NULL, NULL, '2026-02-02', NULL, 1, '2026-02-02 21:51:28', '2026-02-02 21:51:28', NULL, NULL, NULL, NULL),
(13, 13, 2, 'NUEVO', NULL, NULL, '2026-02-02', NULL, 1, '2026-02-02 22:35:10', '2026-02-02 22:35:10', NULL, NULL, NULL, NULL),
(14, 14, 2, 'NUEVO', NULL, NULL, '2026-02-03', NULL, 1, '2026-02-03 18:25:05', '2026-02-03 18:25:05', NULL, NULL, NULL, NULL),
(15, 15, 2, 'NUEVO', NULL, NULL, '2026-02-03', NULL, 1, '2026-02-03 18:42:57', '2026-02-03 18:42:57', NULL, NULL, NULL, NULL),
(16, 16, 2, 'NUEVO', NULL, NULL, '2026-02-03', NULL, 1, '2026-02-03 19:33:55', '2026-02-03 19:33:55', NULL, NULL, NULL, NULL),
(17, 17, 2, 'NUEVO', NULL, NULL, '2026-02-03', NULL, 1, '2026-02-03 22:43:56', '2026-02-03 22:43:56', NULL, NULL, NULL, NULL),
(18, 18, 2, 'NUEVO', NULL, NULL, '2026-02-03', NULL, 1, '2026-02-03 22:58:28', '2026-02-03 22:58:28', NULL, NULL, NULL, NULL),
(19, 19, 2, 'NUEVO', NULL, NULL, '2026-02-04', NULL, 1, '2026-02-04 21:19:49', '2026-02-04 21:19:49', NULL, NULL, NULL, NULL),
(20, 20, 2, 'NUEVO', NULL, NULL, '2026-02-05', NULL, 1, '2026-02-05 17:42:21', '2026-02-05 17:42:21', NULL, NULL, NULL, NULL),
(21, 21, 2, 'NUEVO', NULL, NULL, '2026-02-05', NULL, 1, '2026-02-05 22:48:46', '2026-02-05 22:48:46', NULL, NULL, NULL, NULL),
(22, 22, 2, 'NUEVO', NULL, NULL, '2026-02-06', NULL, 1, '2026-02-06 17:22:41', '2026-02-06 17:22:41', NULL, NULL, NULL, NULL),
(23, 23, 2, 'NUEVO', NULL, NULL, '2026-02-06', NULL, 1, '2026-02-06 22:40:26', '2026-02-06 22:40:26', NULL, NULL, NULL, NULL),
(24, 24, 2, 'NUEVO', NULL, NULL, '2026-02-07', NULL, 1, '2026-02-07 21:56:47', '2026-02-07 21:56:47', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
