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
-- IDs fijos basados en el orden de las carreras (1-3)
-- ============================================
-- Todos los planes están bajo la Resolución Ministerial No. 0210/2023
-- Todos tienen: 3600 hrs total, 30 hrs/semana, 120 hrs/mes, 1200 hrs/año, 3 años de duración
-- Orden: Plan 1 (SIS-INF), Plan 2 (ADM-EMP), Plan 3 (CON-GEN)

-- Plan de Estudios - Sistemas Informáticos (carrera_id = 1)
INSERT INTO planes_estudios (
    id,
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
    1,
    1,
    'Plan de Estudios 2025',
    'No.0210/2023',
    3,
    3600,
    30,
    120,
    1200,
    TRUE
);

-- Plan de Estudios - Administración de Empresas (carrera_id = 2)
INSERT INTO planes_estudios (
    id,
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
    2,
    2,
    'Plan de Estudios 2025',
    'No.0210/2023',
    3,
    3600,
    30,
    120,
    1200,
    TRUE
);

-- Plan de Estudios - Contaduría General (carrera_id = 3)
INSERT INTO planes_estudios (
    id,
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
    3,
    3,
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
