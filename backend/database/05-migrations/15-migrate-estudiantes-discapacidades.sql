-- ============================================
-- MIGRACION DE DATOS: estudiantes_discapacidades
-- Sistema de Gestion Academica - Instituto INCOS
-- Origen: dump instituto_incos.sql (servidor)
-- Destino: nuevo enfoque de schema
-- Generado automaticamente. Solo filas vivas (activo=1, deleted_at NULL).
-- 22 filas.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO estudiantes_discapacidades (id, estudiante_id, tipo_discapacidad_id, descripcion, grado_discapacidad, causa, activo, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) VALUES
(1, 29, 1, NULL, 'LEVE', NULL, 1, '2026-03-10 18:39:23', '2026-03-10 18:39:23', NULL, NULL, NULL, NULL),
(2, 33, 1, NULL, 'MODERADO', NULL, 1, '2026-03-10 19:54:14', '2026-03-10 19:54:14', NULL, NULL, NULL, NULL),
(8, 70, 3, NULL, 'SEVERO', NULL, 1, '2026-03-25 21:38:40', '2026-03-25 21:38:40', NULL, NULL, NULL, NULL),
(9, 82, 3, NULL, 'SEVERO', NULL, 1, '2026-03-25 23:12:04', '2026-03-25 23:12:04', NULL, NULL, NULL, NULL),
(10, 83, 3, NULL, 'SEVERO', NULL, 1, '2026-03-25 23:19:19', '2026-03-25 23:19:19', NULL, NULL, NULL, NULL),
(11, 86, 3, NULL, 'SEVERO', NULL, 1, '2026-03-25 23:33:25', '2026-03-25 23:33:25', NULL, NULL, NULL, NULL),
(12, 87, 3, NULL, 'SEVERO', NULL, 1, '2026-03-25 23:51:35', '2026-03-25 23:51:35', NULL, NULL, NULL, NULL),
(13, 91, 3, NULL, 'SEVERO', NULL, 1, '2026-03-26 00:24:43', '2026-03-26 00:24:43', NULL, NULL, NULL, NULL),
(14, 93, 3, NULL, 'SEVERO', NULL, 1, '2026-03-26 00:43:48', '2026-03-26 00:43:48', NULL, NULL, NULL, NULL),
(15, 94, 3, NULL, 'SEVERO', NULL, 1, '2026-03-26 01:36:35', '2026-03-26 01:36:35', NULL, NULL, NULL, NULL),
(16, 95, 3, NULL, 'SEVERO', NULL, 1, '2026-03-26 01:44:06', '2026-03-26 01:44:06', NULL, NULL, NULL, NULL),
(17, 97, 3, NULL, 'SEVERO', NULL, 1, '2026-03-26 18:36:52', '2026-03-26 18:36:52', NULL, NULL, NULL, NULL),
(18, 98, 3, NULL, 'SEVERO', NULL, 1, '2026-03-26 19:18:03', '2026-03-26 19:18:03', NULL, NULL, NULL, NULL),
(19, 99, 3, NULL, 'MODERADO', NULL, 1, '2026-03-26 19:32:42', '2026-03-26 19:32:42', NULL, NULL, NULL, NULL),
(20, 101, 3, NULL, 'SEVERO', NULL, 1, '2026-03-26 19:46:16', '2026-03-26 19:46:16', NULL, NULL, NULL, NULL),
(21, 102, 3, NULL, 'PROFUNDO', NULL, 1, '2026-03-26 20:08:44', '2026-03-26 20:08:44', NULL, NULL, NULL, NULL),
(22, 103, 3, NULL, 'PROFUNDO', NULL, 1, '2026-03-26 20:16:30', '2026-03-26 20:16:30', NULL, NULL, NULL, NULL),
(23, 104, 1, NULL, 'SEVERO', NULL, 1, '2026-03-26 20:24:57', '2026-03-26 20:24:57', NULL, NULL, NULL, NULL),
(25, 69, 3, NULL, 'SEVERO', NULL, 1, '2026-03-26 20:35:49', '2026-03-26 20:35:49', NULL, NULL, NULL, NULL),
(26, 124, 1, NULL, NULL, NULL, 1, '2026-03-30 21:26:08', '2026-03-30 21:26:08', NULL, NULL, NULL, NULL),
(27, 162, 4, NULL, 'LEVE', NULL, 1, '2026-04-02 23:01:40', '2026-04-02 23:01:40', NULL, NULL, NULL, NULL),
(28, 210, 5, NULL, 'MODERADO', NULL, 1, '2026-04-06 21:26:36', '2026-04-06 21:26:36', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
-- TOTAL: 22 filas
