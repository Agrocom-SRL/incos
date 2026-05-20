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
'{"v":2,"cuotaTeorico":30,"cuotaPractico":70,"pesosBimestres":[25,25,25,25],"evaluacionesFinalesReglas":[{"id":"regla-ej-1","tipoEvaluacionCodigo":"EXAMEN_FINAL_ANUAL","tipoEvaluacionNombre":"Examen final anual","ponderacion":30,"alcance":"PERIODO","carreraId":null,"carreraNombre":null,"periodoId":1,"periodoNombre":"Primer Año"},{"id":"regla-ej-2","tipoEvaluacionCodigo":"FERIA_ANUAL","tipoEvaluacionNombre":"Feria anual","ponderacion":40,"alcance":"PERIODO","carreraId":null,"carreraNombre":null,"periodoId":2,"periodoNombre":"Segundo Año"},{"id":"regla-ej-3","tipoEvaluacionCodigo":"PROYECTO_FINAL_ANUAL","tipoEvaluacionNombre":"Proyecto final","ponderacion":50,"alcance":"PERIODO","carreraId":null,"carreraNombre":null,"periodoId":3,"periodoNombre":"Tercer Año"}],"notaMinimaAprobacion":61,"politicaAsistenciaDefault":{"politica":"NO_AFECTA","pesoAsistencia":null,"minimoAsistencia":75,"notaReprobada":51}}',
'JSON', TRUE, 'Política institucional de notas — Gestión 2025', TRUE);

SET FOREIGN_KEY_CHECKS = 1;
