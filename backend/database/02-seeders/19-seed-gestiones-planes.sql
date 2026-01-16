-- ============================================
-- SEEDER: gestiones_planes
-- Sistema de Gestión Académica - Instituto INCOS
-- Habilitación de planes de estudio para las Gestiones 2025 y 2026
-- ============================================
-- Orden: Plan 1 (SIS-INF), Plan 2 (ADM-EMP), Plan 3 (CON-GEN)
-- Gestión 2025: CERRADO
-- Gestión 2026: VIGENTE

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE gestiones_planes;

-- ============================================
-- INSERTAR HABILITACIONES DE PLANES
-- IDs fijos: 1-3 (Gestión 2025), 4-6 (Gestión 2026)
-- ============================================

-- ============================================
-- GESTIÓN 2025 (CERRADA)
-- ============================================

-- Habilitación: Plan 1 - Sistemas Informáticos (gestión_id = 1, plan_estudio_id = 1)
INSERT INTO gestiones_planes (id, gestion_id, plan_estudio_id, nombre, estado, activo) VALUES
(1, 1, 1, 'Oferta Gestión 2025 - Plan 2025 Sistemas Informáticos', 'CERRADO', TRUE);

-- Habilitación: Plan 2 - Administración de Empresas (gestión_id = 1, plan_estudio_id = 2)
INSERT INTO gestiones_planes (id, gestion_id, plan_estudio_id, nombre, estado, activo) VALUES
(2, 1, 2, 'Oferta Gestión 2025 - Plan 2025 Administración de Empresas', 'CERRADO', TRUE);

-- Habilitación: Plan 3 - Contaduría General (gestión_id = 1, plan_estudio_id = 3)
INSERT INTO gestiones_planes (id, gestion_id, plan_estudio_id, nombre, estado, activo) VALUES
(3, 1, 3, 'Oferta Gestión 2025 - Plan 2025 Contaduría General', 'CERRADO', TRUE);

-- ============================================
-- GESTIÓN 2026 (VIGENTE)
-- ============================================

-- Habilitación: Plan 1 - Sistemas Informáticos (gestión_id = 2, plan_estudio_id = 1)
INSERT INTO gestiones_planes (id, gestion_id, plan_estudio_id, nombre, estado, activo) VALUES
(4, 2, 1, 'Oferta Gestión 2026 - Plan 2025 Sistemas Informáticos', 'VIGENTE', TRUE);

-- Habilitación: Plan 2 - Administración de Empresas (gestión_id = 2, plan_estudio_id = 2)
INSERT INTO gestiones_planes (id, gestion_id, plan_estudio_id, nombre, estado, activo) VALUES
(5, 2, 2, 'Oferta Gestión 2026 - Plan 2025 Administración de Empresas', 'VIGENTE', TRUE);

-- Habilitación: Plan 3 - Contaduría General (gestión_id = 2, plan_estudio_id = 3)
INSERT INTO gestiones_planes (id, gestion_id, plan_estudio_id, nombre, estado, activo) VALUES
(6, 2, 3, 'Oferta Gestión 2026 - Plan 2025 Contaduría General', 'VIGENTE', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
