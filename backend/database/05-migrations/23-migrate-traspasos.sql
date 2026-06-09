-- ============================================
-- MIGRACION DE DATOS: traspasos
-- Sistema de Gestion Academica - Instituto INCOS
-- Origen: dump instituto_incos.sql (servidor)
-- Destino: nuevo enfoque de schema
-- Generado automaticamente. Solo filas vivas (activo=1, deleted_at NULL).
-- 3 filas.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO traspasos (id, estudiante_id, codigo_rude, institucion_origen_id, carrera_origen, anio_cursado, regimen_origen, estado, fecha_solicitud, motivo_no_procedente, observaciones, activo, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) VALUES
(1, 311, NULL, 1, 'CONTADURIA GENERAL', 'PRIMERO', 'ANUAL', 'SOLICITADO', NULL, NULL, NULL, 1, '2026-04-30 20:20:20', '2026-04-30 20:20:20', NULL, NULL, NULL, NULL),
(2, 318, NULL, 2, 'CONTADURIA GENERAL', 'PRIMERO', 'ANUAL', 'SOLICITADO', NULL, NULL, NULL, 1, '2026-04-30 21:38:26', '2026-04-30 21:38:26', NULL, NULL, NULL, NULL),
(3, 323, NULL, 3, 'CONTADURIA GENERAL', 'PRIMERO', 'ANUAL', 'SOLICITADO', NULL, NULL, NULL, 1, '2026-05-06 21:12:22', '2026-05-06 21:12:22', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
-- TOTAL: 3 filas
