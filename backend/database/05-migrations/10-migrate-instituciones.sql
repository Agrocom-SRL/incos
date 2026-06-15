-- ============================================
-- MIGRACION DE DATOS: instituciones
-- Sistema de Gestion Academica - Instituto INCOS
-- Origen: dump instituto_incos.sql (servidor)
-- Destino: nuevo enfoque de schema
-- Generado automaticamente. Solo filas vivas (activo=1, deleted_at NULL).
-- 6 filas.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO instituciones (id, nombre, tipo, dependencia, codigo_sie, departamento_id, distrito_educativo, activo, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) VALUES
(1, 'INSTITUTO TECNOLOGICO INCOS BENI', 'ITT', 'FISCAL', NULL, 8, 'TRINIDAD', 1, '2026-04-30 20:20:20', '2026-04-30 20:20:20', NULL, NULL, NULL, NULL),
(2, 'INSTITUTO TECNOLOGICO SUPERIOR VILLA MONTES', 'ITT', 'FISCAL', NULL, 7, NULL, 1, '2026-04-30 21:38:26', '2026-04-30 21:38:26', NULL, NULL, NULL, NULL),
(3, 'INSTITUTO COMERCIAL INCOS EL ALTO', 'ITT', 'FISCAL', NULL, 2, NULL, 1, '2026-05-06 21:12:22', '2026-05-06 21:12:22', NULL, NULL, NULL, NULL),
(4, 'MARIA GORETTI I -SANTA CRUZ', 'UETHP', 'FISCAL', NULL, 1, NULL, 1, '2026-05-07 00:04:26', '2026-05-07 00:04:26', NULL, NULL, NULL, NULL),
(5, 'AMERICA C- SANTA CRUZ', 'UETHP', 'FISCAL', NULL, 1, NULL, 1, '2026-05-07 00:32:48', '2026-05-07 00:32:48', NULL, NULL, NULL, NULL),
(6, 'MARIA TERESA PULIDO - SANTA CRUZ', 'UETHP', 'FISCAL', NULL, 1, NULL, 1, '2026-05-22 21:07:42', '2026-05-22 21:07:42', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
-- TOTAL: 6 filas
