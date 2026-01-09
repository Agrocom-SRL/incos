-- ============================================
-- SEEDER: planes_estudios
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Planes de estudio por carrera según RM No. 0210/2023
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE planes_estudios;

-- ============================================
-- INSERTAR PLANES DE ESTUDIO
-- ============================================
-- Todos los planes están bajo la Resolución Ministerial No. 0210/2023
-- Todos tienen: 3600 hrs total, 30 hrs/semana, 120 hrs/mes, 1200 hrs/año, 3 años de duración

-- Obtener IDs de las carreras
SET @carrera_sis_id = (SELECT id FROM carreras WHERE codigo = 'SIS-INF' LIMIT 1);
SET @carrera_adm_id = (SELECT id FROM carreras WHERE codigo = 'ADM-EMP' LIMIT 1);
SET @carrera_con_id = (SELECT id FROM carreras WHERE codigo = 'CON-GEN' LIMIT 1);

-- Plan de Estudios - Sistemas Informáticos
INSERT INTO planes_estudios (
    carrera_id,
    nombre_plan,
    resolucion_ministerial,
    duracion_anios,
    carga_horaria_total,
    horas_semana,
    horas_mes,
    horas_anio,
    vigente
) VALUES (
    @carrera_sis_id,
    'Plan de Estudios 2025',
    'No.0210/2023',
    3,
    3600,
    30,
    120,
    1200,
    TRUE
);

-- Plan de Estudios - Administración de Empresas
INSERT INTO planes_estudios (
    carrera_id,
    nombre_plan,
    resolucion_ministerial,
    duracion_anios,
    carga_horaria_total,
    horas_semana,
    horas_mes,
    horas_anio,
    vigente
) VALUES (
    @carrera_adm_id,
    'Plan de Estudios 2025',
    'No.0210/2023',
    3,
    3600,
    30,
    120,
    1200,
    TRUE
);

-- Plan de Estudios - Contaduría General
INSERT INTO planes_estudios (
    carrera_id,
    nombre_plan,
    resolucion_ministerial,
    duracion_anios,
    carga_horaria_total,
    horas_semana,
    horas_mes,
    horas_anio,
    vigente
) VALUES (
    @carrera_con_id,
    'Plan de Estudios 2025',
    'No.0210/2023',
    3,
    3600,
    30,
    120,
    1200,
    TRUE
);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
