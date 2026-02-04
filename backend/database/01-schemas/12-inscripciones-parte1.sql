-- ============================================
-- MÓDULO DE INSCRIPCIONES - PARTE 1
-- Sistema de Gestión Académica - Instituto INCOS
-- 1 Tabla: inscripciones
-- ============================================
-- 
-- IMPORTANTE: Esta tabla registra la inscripción de un estudiante
-- a una gestión académica específica.
-- 
-- FLUJO COMPLETO (PASOS PREVIOS A LA INSCRIPCIÓN):
-- 1. REGISTRO DEL ESTUDIANTE: El estudiante nuevo se registra en el sistema
-- 2. DATOS PERSONALES: Rellena sus datos personales completos
-- 3. DOCUMENTACIÓN: Sube toda su documentación de registro (en documentos_estudiante)
-- 4. PAGO DE MATRÍCULA: Realiza el pago de la cuota anual (en pagos_aranceles)
-- 5. VALIDACIÓN: El sistema valida que documentos y pago estén completos
--
-- INSCRIPCIÓN DE MATERIAS (ESTE MÓDULO):
-- Una vez que el estudiante está registrado, con documentos y pago completos,
-- puede inscribirse a materias de la gestión en curso.
--
-- PROCESO DE INSCRIPCIÓN:
-- 
-- ESTUDIANTES NUEVOS (tipo_inscripcion = NUEVO):
-- - Se inscriben por BLOQUES: todas las materias del PRIMER PERIODO de su carrera
-- - No pueden elegir materias individuales (deben llevar todo el bloque)
-- - La carrera viene de estudiantes_datos_academicos (donde se registró inicialmente)
-- - El periodo viene del plan de estudios vigente de su carrera
--
-- ESTUDIANTES CONTINUIDAD/REINGRESO:
-- - Pueden elegir materias individuales del plan de estudios de su carrera
-- - Cada materia tiene asignaciones_docentes disponibles (curso + docente + horario) en la gestión
-- - El estudiante se inscribe a asignaciones_docentes específicas
-- - El sistema valida:
--    - Que no haya choques de horario entre las asignaciones elegidas
--    - Que no tenga nivelaciones pendientes (bloquea inscripción)
--    - Que cumpla prerrequisitos de las materias
--    - Que haya cupo disponible en el curso
-- 5. Si todo es válido, se registra la inscripción
-- 6. Si hay problemas (choques, nivelaciones, prerrequisitos), NO se registra
--
-- IMPORTANTE: No hay estados como BORRADOR, PENDIENTE, RECHAZADA, ANULADA.
-- Si el estudiante no puede inscribirse (choques, nivelaciones, etc.),
-- simplemente NO se registra la inscripción. Solo se registra si es válida.
--
-- ESTRUCTURA ACADÉMICA:
-- - Cada carrera tiene un plan de estudios dividido en periodos (años académicos)
-- - Cada periodo tiene asignaturas_plan (materias con configuración específica)
-- - Los paralelos agrupan estudiantes por carrera, periodo y turno
-- - Los cursos son la intersección entre paralelos y asignaturas_plan
-- - Los cursos tienen horarios (cursos_horarios) con aulas asignadas
-- - Las asignaciones_docentes activan cursos por gestión (curso + docente + gestion_plan)
-- - El estudiante se inscribe a asignaciones_docentes específicas
--
-- TIPOS DE INSCRIPCIÓN:
-- - NUEVO: Estudiante nuevo (primera vez en el instituto)
-- - REINGRESO: Estudiante que regresa después de un periodo sin inscribirse
-- - CONTINUIDAD: Estudiante que continúa de la gestión anterior
-- - TRASPASO_ENTRADA: Estudiante de otro instituto que completó un periodo; se inscribe al siguiente (traspaso_id → traspasos, ver 12-traspasos.sql)
-- - TRANSITABILIDAD_ENTRADA: Estudiante con Técnico Medio que cursa solo materias complementarias (transitabilidad_id → transitabilidades, ver 12-transitabilidades.sql)
--
-- RELACIÓN CON OTRAS TABLAS:
-- - inscripciones_materias: Asignaciones específicas inscritas (ver parte 2)
-- - calificaciones: Notas de evaluaciones (ver parte 2, tabla separada para normalización)
-- - estudiantes_datos_academicos: Datos académicos del estudiante (carrera, gestion_ingreso) - RELACIÓN PRINCIPAL
--   → estudiantes_datos_academicos.estudiante_id → estudiantes (para obtener datos personales)
--   → estudiantes_datos_academicos.carrera_id → carreras (carrera del estudiante)
--   → estudiantes_datos_academicos.gestion_ingreso_id → gestiones (gestión de ingreso)
-- - gestiones: Gestión académica en la que se inscribe (diferente de gestion_ingreso_id)
-- - gestiones_planes: Plan habilitado en la gestión (garantiza coherencia)
-- - asignaciones_docentes: Cursos disponibles con docente en la gestión
-- - traspasos: Si tipo_inscripcion = TRASPASO_ENTRADA, inscripciones.traspaso_id → traspasos (ver 12-traspasos.sql)
-- - transitabilidades: Si tipo_inscripcion = TRANSITABILIDAD_ENTRADA, inscripciones.transitabilidad_id → transitabilidades (ver 12-transitabilidades.sql)
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS inscripciones;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: inscripciones
-- ============================================
-- Registra la inscripción de un estudiante a una gestión académica.
-- El estudiante ya debe estar registrado, con documentos y pago completos.
--
-- IMPORTANTE: Esta tabla NO tiene estados como BORRADOR, PENDIENTE, RECHAZADA, ANULADA.
-- Si el estudiante no puede inscribirse (choques de horario, nivelaciones pendientes,
-- prerrequisitos no cumplidos), simplemente NO se registra la inscripción.
-- Solo se registra si es válida y puede cursar las materias.
--
-- VALIDACIONES IMPORTANTES:
-- - Un estudiante puede tener múltiples inscripciones en diferentes gestiones
-- - Un estudiante puede tener solo UNA inscripción por gestión
-- - El estudiante debe estar registrado, con documentos y pago completos
-- - La relación principal es con estudiantes_datos_academicos (NO directamente con estudiantes)
--   → estudiantes_datos_academicos contiene: carrera_id, gestion_ingreso_id
--   → De ahí obtenemos la carrera del estudiante y su gestión de ingreso
-- - gestion_id: Gestión en la que se inscribe (diferente de gestion_ingreso_id en estudiantes_datos_academicos)
--   Ejemplo: Estudiante ingresó en 2023 (gestion_ingreso_id=2023) pero se inscribe a materias en 2024 (gestion_id=2024)
-- - REGLA CRÍTICA: Si tiene nivelaciones pendientes, NO puede inscribirse
--   hasta que apruebe todas sus nivelaciones (ver bloqueos_inscripcion en 12-bloqueos-inscripcion.sql)
-- - Los choques de horario se validan antes de registrar (si hay choque, no se registra)
-- - Los prerrequisitos se validan antes de registrar (si no cumple, no se registra)
-- - Los cupos se validan antes de registrar (si no hay cupo, no se registra)
--
-- NOTA: El periodo NO se elige directamente. El periodo viene del plan de estudios
-- de la materia. Cada materia en inscripciones_materias pertenece a un periodo
-- según el plan de estudios de la carrera del estudiante (en estudiantes_datos_academicos).
--
-- RELACIÓN CON ASIGNACIONES_DOCENTES:
-- - Las inscripciones_materias se relacionan con asignaciones_docentes
-- - asignaciones_docentes vincula: curso + gestion_plan + docente
-- - Esto garantiza que el curso esté activo en la gestión y tenga docente asignado
--
-- RELACIÓN CON ESTUDIANTES_DATOS_ACADEMICOS:
-- - La relación principal es con estudiantes_datos_academicos (NO con estudiantes directamente)
-- - estudiantes_datos_academicos contiene: carrera_id, gestion_ingreso_id
-- - gestion_ingreso_id es la gestión de ingreso (primera vez que ingresó)
-- - gestion_id en inscripciones es la gestión en la que se inscribe (puede ser diferente cada año)
-- ============================================

CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_datos_academicos_id INT NULL COMMENT 'Datos académicos del estudiante (referencia a estudiantes_datos_academicos). Contiene la carrera del estudiante y su gestión de ingreso. El estudiante debe estar registrado con documentos y pago completos.',
    gestion_id INT NULL COMMENT 'Gestión académica (año lectivo) en la que se inscribe (referencia a gestiones). Diferente de gestion_ingreso_id en estudiantes_datos_academicos.',
    
    -- Tipo de inscripción
    tipo_inscripcion ENUM('NUEVO', 'REINGRESO', 'CONTINUIDAD', 'TRASPASO_ENTRADA', 'TRANSITABILIDAD_ENTRADA') DEFAULT 'CONTINUIDAD'
        COMMENT 'Tipo de inscripción: NUEVO (bloques periodo 1), REINGRESO, CONTINUIDAD (materias individuales), TRASPASO_ENTRADA (de otro instituto, traspaso_id), TRANSITABILIDAD_ENTRADA (Técnico Medio, transitabilidad_id)',
    traspaso_id INT NULL COMMENT 'Si tipo_inscripcion=TRASPASO_ENTRADA, referencia a traspasos. FK se añade en 12-traspasos.sql',
    transitabilidad_id INT NULL COMMENT 'Si tipo_inscripcion=TRANSITABILIDAD_ENTRADA, referencia a transitabilidades. FK se añade en 12-transitabilidades.sql',

    -- Fecha de inscripción
    fecha_inscripcion DATE NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha en que se realizó la inscripción',

    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones generales sobre la inscripción',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (estudiante_datos_academicos_id) REFERENCES estudiantes_datos_academicos(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_estudiante_datos_academicos_id (estudiante_datos_academicos_id) COMMENT 'Búsqueda por datos académicos del estudiante',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_tipo_inscripcion (tipo_inscripcion) COMMENT 'Filtrado por tipo de inscripción',
    INDEX idx_fecha_inscripcion (fecha_inscripcion) COMMENT 'Búsqueda por fecha',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_datos_gestion (estudiante_datos_academicos_id, gestion_id, activo, deleted_at) COMMENT 'Búsqueda de inscripciones por estudiante y gestión',
    INDEX idx_gestion_activo (gestion_id, activo, deleted_at) COMMENT 'Búsqueda de inscripciones por gestión',
    INDEX idx_tipo_activo (tipo_inscripcion, activo, deleted_at) COMMENT 'Búsqueda por tipo de inscripción',
    INDEX idx_traspaso_id (traspaso_id) COMMENT 'Búsqueda por traspaso',
    INDEX idx_transitabilidad_id (transitabilidad_id) COMMENT 'Búsqueda por transitabilidad'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscripciones de estudiantes a una gestión académica. traspaso_id y transitabilidad_id vinculan con traspasos (12-traspasos.sql) y transitabilidades (12-transitabilidades.sql).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
