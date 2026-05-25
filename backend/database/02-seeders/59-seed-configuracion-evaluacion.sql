-- ============================================
-- SEEDER: configuracion_evaluacion
-- Política institucional (POLITICA_INSTITUCIONAL) por gestión
-- Requiere: 16-seed-gestiones.sql, 58-seed-tipos-evaluacion.sql
--
-- Solo gestión 2025 (id=2): la vigente 2026 queda sin fila para probar
-- copia desde "gestión anterior" en la UI.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- TRUNCATE TABLE configuracion_evaluacion;

INSERT INTO configuracion_evaluacion (id, gestion_id, clave, valor, tipo, vigente, descripcion, activo) VALUES
(1, 2, 'POLITICA_INSTITUCIONAL',
'{"cuotaTeorico":30,"cuotaPractico":70,"pesosBimestres":[25,25,25,25],"notaMinimaAprobacion":61,"politicaAsistenciaDefault":{"politica":"NO_AFECTA","pesoAsistencia":null,"minimoAsistencia":75,"notaReprobada":51}}',
'JSON', TRUE, 'Política institucional de notas — Gestión 2025', TRUE);

SET FOREIGN_KEY_CHECKS = 1;
