-- ============================================
-- SEEDER: configuracion_aportes
-- Sistema de Gestión Académica - Instituto INCOS
-- Configuración del monto del aporte académico por gestión
-- ============================================
-- Gestión 2026 (VIGENTE): gestiones.id = 1
-- Monto base: Bs. 400.00 (por año)
-- Fecha inicio: 2026-01-19 (coincide con fecha_inicio de la gestión 2026)
-- Fecha fin: NULL (sin límite)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE configuracion_aportes;

-- ============================================
-- INSERTAR CONFIGURACIÓN DE APORTES
-- ID fijo: 1 (Gestión 2026)
-- ============================================

-- Configuración de Aporte 2026
-- Gestión: 2026 (gestiones.id = 1, vigente)
-- Monto base: Bs. 400.00
-- Estado: Activo (aporte_activo = TRUE)
-- Vigencia: Desde 2026-01-19 (sin fecha de fin)
INSERT INTO configuracion_aportes (id, gestion_id, monto_base, aporte_activo, fecha_inicio, fecha_fin, activo) VALUES
(1, 1, 400.00, TRUE, '2026-01-19', NULL, TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE CONFIGURACIÓN
-- ============================================
-- Configuración (id=1):
--   - Gestión: 2026 (gestion_id=1)
--   - Monto base: Bs. 400.00
--   - Estado: Activo
--   - Vigencia: Desde 2026-01-19 (sin límite)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
