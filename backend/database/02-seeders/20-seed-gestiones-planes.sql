-- ============================================
-- SEEDER: gestiones_planes
-- Sistema de Gestión Académica - Instituto INCOS
-- Habilitación de planes de estudio para la Gestión 2025
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE gestiones_planes;

-- ============================================
-- OBTENER IDs NECESARIOS
-- ============================================

-- Obtener ID de la gestión 2025
SET @gestion_2025_id = (SELECT id FROM gestiones WHERE codigo = '2025-REG' LIMIT 1);

-- Obtener IDs de las carreras
SET @carrera_sis_id = (SELECT id FROM carreras WHERE codigo = 'SIS-INF' LIMIT 1);
SET @carrera_adm_id = (SELECT id FROM carreras WHERE codigo = 'ADM-EMP' LIMIT 1);
SET @carrera_con_id = (SELECT id FROM carreras WHERE codigo = 'CON-GEN' LIMIT 1);

-- Obtener IDs de los planes de estudio (plan vigente de cada carrera)
SET @plan_sis_id = (SELECT id FROM planes_estudios WHERE carrera_id = @carrera_sis_id AND vigente = TRUE LIMIT 1);
SET @plan_adm_id = (SELECT id FROM planes_estudios WHERE carrera_id = @carrera_adm_id AND vigente = TRUE LIMIT 1);
SET @plan_con_id = (SELECT id FROM planes_estudios WHERE carrera_id = @carrera_con_id AND vigente = TRUE LIMIT 1);

-- ============================================
-- INSERTAR HABILITACIONES DE PLANES
-- ============================================
-- Habilitar los planes de estudio vigentes para la gestión 2025
-- Estado: VIGENTE (plan activo y habilitado para la gestión)
-- Activo: TRUE (habilitación activa)

-- Habilitación: Plan de Sistemas Informáticos
INSERT INTO gestiones_planes (
    gestion_id,
    plan_estudio_id,
    nombre,
    estado,
    activo
) VALUES (
    @gestion_2025_id,
    @plan_sis_id,
    'Oferta Gestión 2025 - Plan 2025 Sistemas Informáticos',
    'VIGENTE',
    TRUE
);

-- Habilitación: Plan de Administración de Empresas
INSERT INTO gestiones_planes (
    gestion_id,
    plan_estudio_id,
    nombre,
    estado,
    activo
) VALUES (
    @gestion_2025_id,
    @plan_adm_id,
    'Oferta Gestión 2025 - Plan 2025 Administración de Empresas',
    'VIGENTE',
    TRUE
);

-- Habilitación: Plan de Contaduría General
INSERT INTO gestiones_planes (
    gestion_id,
    plan_estudio_id,
    nombre,
    estado,
    activo
) VALUES (
    @gestion_2025_id,
    @plan_con_id,
    'Oferta Gestión 2025 - Plan 2025 Contaduría General',
    'VIGENTE',
    TRUE
);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICACIÓN (opcional, para debugging)
-- ============================================
-- SELECT 
--     gp.id,
--     g.codigo AS gestion_codigo,
--     g.nombre AS gestion_nombre,
--     pe.nombre_plan,
--     c.codigo AS carrera_codigo,
--     c.nombre AS carrera_nombre,
--     gp.estado,
--     gp.activo
-- FROM gestiones_planes gp
-- INNER JOIN gestiones g ON gp.gestion_id = g.id
-- INNER JOIN planes_estudios pe ON gp.plan_estudio_id = pe.id
-- INNER JOIN carreras c ON pe.carrera_id = c.id
-- WHERE g.codigo = '2025-REG'
-- ORDER BY c.codigo;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
