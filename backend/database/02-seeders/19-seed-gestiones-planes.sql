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
-- Solo gestión vigente 2026 (gestiones.id = 1). IDs 1, 2, 3 para los tres planes.
-- No se insertan planes para gestion_id = 2 (2025): sin impacto en asignaciones ni estudiantes.
-- Asignaciones docentes (seeds 40-48) referencian gestion_plan_id 1, 2, 3.
-- ============================================

-- ============================================
-- GESTIÓN 2026 (VIGENTE) — gestiones.id = 1
-- ============================================

-- Habilitación: Plan 1 - Sistemas Informáticos (gestion_plan_id = 1, usado en asignaciones SIS)
INSERT INTO gestiones_planes (id, gestion_id, plan_estudio_id, nombre, estado, activo) VALUES
(1, 1, 1, 'Oferta Gestión 2026 - Plan 2023 Sistemas Informáticos', 'VIGENTE', TRUE);

-- Habilitación: Plan 2 - Administración de Empresas (gestion_plan_id = 2, usado en asignaciones ADM)
INSERT INTO gestiones_planes (id, gestion_id, plan_estudio_id, nombre, estado, activo) VALUES
(2, 1, 2, 'Oferta Gestión 2026 - Plan 2023 Administración de Empresas', 'VIGENTE', TRUE);

-- Habilitación: Plan 3 - Contaduría General (gestion_plan_id = 3, usado en asignaciones CON)
INSERT INTO gestiones_planes (id, gestion_id, plan_estudio_id, nombre, estado, activo) VALUES
(3, 1, 3, 'Oferta Gestión 2026 - Plan 2023 Contaduría General', 'VIGENTE', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
