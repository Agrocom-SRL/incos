-- ============================================
-- MIGRACIÓN DE DATOS: estudiantes_becas
-- Origen: instituto_incos.sql
-- Schema: 09-estudiantes-parte2.sql (tabla estudiantes_becas)
-- Dependencias: 22-seed-becas_descuentos.sql (beca_descuento_id 1,3), 16-seed-gestiones.sql (gestion_id 2). 01-migrate-estudiantes.
-- Columnas y 2 filas verificadas contra dump.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO estudiantes_becas (id, estudiante_id, beca_descuento_id, gestion_id, fecha_solicitud, estado, documentos_completos, fecha_inicio_entrega_documentos, fecha_fin_entrega_documentos, observaciones, activo, created_at, updated_at, deleted_at, created_by, updated_by, deleted_by) VALUES
(1, 10, 1, 2, '2026-02-02', 'ACTIVA', 0, NULL, NULL, 'POR RAZON SOCIAL', 1, '2026-02-02 13:42:46', '2026-02-02 13:42:46', NULL, NULL, NULL, NULL),
(2, 14, 3, 2, '2026-02-02', 'ACTIVA', 0, NULL, NULL, 'TIENE UN PROMEDIO MAYOR A 90 PUNTOS ', 1, '2026-02-02 22:34:38', '2026-02-02 22:34:38', NULL, NULL, NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
