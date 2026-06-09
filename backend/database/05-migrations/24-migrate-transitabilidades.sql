-- ============================================
-- MIGRACION DE DATOS: transitabilidades
-- Sistema de Gestion Academica - Instituto INCOS
-- Origen: dump instituto_incos.sql (servidor)
-- Destino: nuevo enfoque de schema
-- Generado automaticamente. Solo filas vivas (activo=1, deleted_at NULL).
-- 3 filas.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO transitabilidades (id, estudiante_id, institucion_origen_id, carrera_origen, anio_conclusion, regimen_estudios, acepta_compromiso, fecha_compromiso, estado, fecha_solicitud, motivo_no_procedente, observaciones, activo, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) VALUES
(1, 332, 4, 'CONTADURIA GENERAL', 2025, 'ANUAL', 0, NULL, 'SOLICITADO', NULL, NULL, NULL, 1, '2026-05-07 00:04:26', '2026-05-07 00:04:26', NULL, NULL, NULL, NULL),
(2, 333, 5, 'CONTADURIA GENERAL', 2025, 'ANUAL', 0, NULL, 'SOLICITADO', NULL, NULL, NULL, 1, '2026-05-07 00:32:48', '2026-05-07 00:32:48', NULL, NULL, NULL, NULL),
(3, 378, 6, 'CONTADURIA GENERAL', 2025, 'ANUAL', 0, NULL, 'SOLICITADO', NULL, NULL, NULL, 1, '2026-05-22 21:07:42', '2026-05-22 21:07:42', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
-- TOTAL: 3 filas
