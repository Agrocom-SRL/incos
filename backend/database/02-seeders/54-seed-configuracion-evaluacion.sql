-- ============================================
-- SEEDER: configuracion_evaluacion
-- Política institucional (POLITICA_INSTITUCIONAL) por gestión
-- Requiere: 16-seed-gestiones.sql, 53-seed-tipos-evaluacion.sql
--
-- Sincronizado con dump local 2026-06:
--   id=1 → gestión 2025 (id=2), NO vigente (histórica).
--   id=2 → gestión 2026 (id=1), VIGENTE (política activa actual).
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- TRUNCATE TABLE configuracion_evaluacion;

INSERT INTO configuracion_evaluacion (id, gestion_id, clave, valor, tipo, vigente, descripcion, activo) VALUES
(1, 2, 'POLITICA_INSTITUCIONAL',
'{"cuotaTeorico":30,"cuotaPractico":70,"pesosBimestres":[25,25,25,25],"notaMinimaAprobacion":61,"politicaAsistenciaDefault":{"politica":"NO_AFECTA","pesoAsistencia":null,"minimoAsistencia":75,"notaReprobada":51}}',
'JSON', FALSE, 'Política institucional de notas — Gestión 2025', TRUE),
(2, 1, 'POLITICA_INSTITUCIONAL',
'{"cuotaTeorico":30,"cuotaPractico":70,"pesosBimestres":[25,25,25,25],"notaMinimaAprobacion":61,"politicaAsistenciaDefault":{"politica":"NO_AFECTA","pesoAsistencia":null,"minimoAsistencia":null,"notaReprobada":null}}',
'JSON', TRUE, 'Política institucional de evaluación y notas', TRUE);

SET FOREIGN_KEY_CHECKS = 1;
