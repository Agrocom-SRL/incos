-- ============================================
-- SEEDER: asignaciones_docentes
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignaciones docentes para cursos del paralelo PRIMERO B (Sistemas Informáticos - Noche)
-- Gestión 2025
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaciones_docentes;

-- ============================================
-- OBTENER IDs NECESARIOS
-- ============================================

-- Obtener ID de la gestión 2025
SET @gestion_2025_id = (SELECT id FROM gestiones WHERE codigo = '2025-REG' LIMIT 1);

-- Obtener ID de la carrera Sistemas Informáticos
SET @carrera_sis_id = (SELECT id FROM carreras WHERE codigo = 'SIS-INF' LIMIT 1);

-- Obtener ID del plan de estudio vigente de Sistemas Informáticos
SET @plan_sis_id = (SELECT id FROM planes_estudios WHERE carrera_id = @carrera_sis_id AND vigente = TRUE LIMIT 1);

-- Obtener ID del plan habilitado (gestion_plan) para Sistemas Informáticos en la gestión 2025
SET @gestion_plan_sis_id = (
    SELECT id FROM gestiones_planes 
    WHERE gestion_id = @gestion_2025_id 
    AND plan_estudio_id = @plan_sis_id 
    AND activo = TRUE 
    LIMIT 1
);

-- Obtener IDs de los cursos del paralelo PRIMERO B (NOCHE) - Sistemas Informáticos
SET @curso_1b_mpi101 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-MPI101' LIMIT 1);
SET @curso_1b_prg102 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-PRG102' LIMIT 1);
SET @curso_1b_int103 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-INT103' LIMIT 1);
SET @curso_1b_hdc104 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-HDC104' LIMIT 1);
SET @curso_1b_tso105 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-TSO105' LIMIT 1);
SET @curso_1b_otm106 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-OTM106' LIMIT 1);
SET @curso_1b_dpw107 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-DPW107' LIMIT 1);

-- ============================================
-- INSERTAR ASIGNACIONES DOCENTES
-- ============================================
-- Asignar cada curso del paralelo PRIMERO B al plan habilitado de la gestión 2025
-- NOTA: docente_id es NULL (pendiente de asignación)
-- vigente: TRUE (asignación vigente)
-- activo: TRUE (registro activo)
-- carga_horaria: NULL (hereda de asignaturas_plan si es necesario)

-- Asignación: Matemática para la Informática (MPI101)
INSERT INTO asignaciones_docentes (
    gestion_plan_id,
    curso_id,
    docente_id,
    carga_horaria,
    vigente,
    activo
) VALUES (
    @gestion_plan_sis_id,
    @curso_1b_mpi101,
    NULL,
    NULL,
    TRUE,
    TRUE
);

-- Asignación: Programación I (PRG102)
INSERT INTO asignaciones_docentes (
    gestion_plan_id,
    curso_id,
    docente_id,
    carga_horaria,
    vigente,
    activo
) VALUES (
    @gestion_plan_sis_id,
    @curso_1b_prg102,
    NULL,
    NULL,
    TRUE,
    TRUE
);

-- Asignación: Inglés Técnico (INT103)
INSERT INTO asignaciones_docentes (
    gestion_plan_id,
    curso_id,
    docente_id,
    carga_horaria,
    vigente,
    activo
) VALUES (
    @gestion_plan_sis_id,
    @curso_1b_int103,
    NULL,
    NULL,
    TRUE,
    TRUE
);

-- Asignación: Hardware de Computadoras (HDC104)
INSERT INTO asignaciones_docentes (
    gestion_plan_id,
    curso_id,
    docente_id,
    carga_horaria,
    vigente,
    activo
) VALUES (
    @gestion_plan_sis_id,
    @curso_1b_hdc104,
    NULL,
    NULL,
    TRUE,
    TRUE
);

-- Asignación: Taller de Sistemas Operativos (TSO105)
INSERT INTO asignaciones_docentes (
    gestion_plan_id,
    curso_id,
    docente_id,
    carga_horaria,
    vigente,
    activo
) VALUES (
    @gestion_plan_sis_id,
    @curso_1b_tso105,
    NULL,
    NULL,
    TRUE,
    TRUE
);

-- Asignación: Ofimática y Tecnología Multimedia (OTM106)
INSERT INTO asignaciones_docentes (
    gestion_plan_id,
    curso_id,
    docente_id,
    carga_horaria,
    vigente,
    activo
) VALUES (
    @gestion_plan_sis_id,
    @curso_1b_otm106,
    NULL,
    NULL,
    TRUE,
    TRUE
);

-- Asignación: Diseño y Programación Web I (DPW107)
INSERT INTO asignaciones_docentes (
    gestion_plan_id,
    curso_id,
    docente_id,
    carga_horaria,
    vigente,
    activo
) VALUES (
    @gestion_plan_sis_id,
    @curso_1b_dpw107,
    NULL,
    NULL,
    TRUE,
    TRUE
);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICACIÓN (opcional, para debugging)
-- ============================================
-- SELECT 
--     ad.id,
--     g.codigo AS gestion_codigo,
--     gp.nombre AS gestion_plan_nombre,
--     c.codigo AS curso_codigo,
--     c.nombre AS curso_nombre,
--     d.nombres AS docente_nombres,
--     d.apellido_paterno AS docente_apellido,
--     ad.vigente,
--     ad.activo,
--     ad.carga_horaria
-- FROM asignaciones_docentes ad
-- INNER JOIN gestiones_planes gp ON ad.gestion_plan_id = gp.id
-- INNER JOIN gestiones g ON gp.gestion_id = g.id
-- INNER JOIN cursos c ON ad.curso_id = c.id
-- LEFT JOIN docentes d ON ad.docente_id = d.id
-- WHERE g.codigo = '2025-REG'
--   AND c.codigo LIKE 'SIS-1B-NOCHE-%'
-- ORDER BY c.codigo;

-- ============================================
-- FIN DEL SEEDER
-- ============================================
