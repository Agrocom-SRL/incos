-- ============================================
-- MÓDULO DE INSCRIPCIONES - PARTE 2
-- Sistema de Gestión Académica - Instituto INCOS
-- 3 Tablas: inscripciones_materias, calificaciones, historial_nivelaciones
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS historial_nivelaciones;
DROP TABLE IF EXISTS calificaciones;
DROP TABLE IF EXISTS inscripciones_materias;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: inscripciones_materias
-- ============================================

CREATE TABLE inscripciones_materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_id INT NULL COMMENT 'Inscripción del estudiante (referencia a inscripciones)',
    asignacion_docente_id INT NULL COMMENT 'Asignación docente específica (curso + docente + gestion_plan) a la que se inscribe. Garantiza que el curso esté activo en la gestión y tenga docente asignado.',
    
    -- Resumen académico (calculado desde calificaciones)
    nota_final DECIMAL(5,2) NULL COMMENT 'Nota final calculada (0-100)',
    nota_definitiva DECIMAL(5,2) NULL COMMENT 'Nota definitiva (0-100)',
    
    -- Estado de la materia
    estado ENUM(
        'INSCRITO', 
        'CURSANDO', 
        'APROBADO', 
        'REPROBADO', 
        'ABANDONO', 
        'RETIRADO'
    ) DEFAULT 'INSCRITO' COMMENT 'Estado de la materia individual',
    
    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones generales',
    observaciones_docente TEXT COMMENT 'Observaciones del docente',
    
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
    
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,
    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_inscripcion_id (inscripcion_id) COMMENT 'Búsqueda por inscripción',
    INDEX idx_asignacion_docente_id (asignacion_docente_id) COMMENT 'Búsqueda por asignación docente',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_nota_final (nota_final) COMMENT 'Búsqueda por nota final',
    INDEX idx_nota_definitiva (nota_definitiva) COMMENT 'Búsqueda por nota definitiva',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_inscripcion_asignacion (inscripcion_id, asignacion_docente_id, activo, deleted_at) COMMENT 'Búsqueda por inscripción y asignación docente',
    INDEX idx_estado_activo (estado, activo, deleted_at) COMMENT 'Búsqueda por estado'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscripción de estudiante a una asignación docente específica';

-- ============================================
-- TABLA: calificaciones
-- ============================================

CREATE TABLE calificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_materia_id INT NULL COMMENT 'Inscripción materia a la que pertenece esta calificación (referencia a inscripciones_materias)',
    
    -- Tipo de evaluación
    tipo_evaluacion ENUM(
        '1ER_PARCIAL',
        '2DO_PARCIAL',
        '3ER_PARCIAL',
        '4TO_PARCIAL',
        'PRACTICO',
        'RECUPERATORIO',
        'HABILITACION',
        'PRUEBA_EXCEPCIONAL'
    ) NULL COMMENT 'Tipo de evaluación',
    
    -- Calificación
    nota DECIMAL(5,2) NULL COMMENT 'Nota obtenida (0-100). Nota mínima para aprobar: 61. Validación: 0-100',
    fecha DATE NULL COMMENT 'Fecha de la evaluación',
    
    -- Bimestre (según Registro Académico de Notas: 4 bimestres por gestión)
    bimestre INT NULL COMMENT 'Número de bimestre (1, 2, 3, 4) para evaluaciones periódicas. NULL para evaluaciones especiales (recuperatorio, habilitación, etc.)',
    
    -- Control de intentos (para recuperatorios/habilitaciones)
    intento INT DEFAULT 1 COMMENT 'Número de intento (1, 2, 3 para recuperatorios/habilitaciones, 1 para parciales)',
    
    -- Control de registro de notas
    notas_cerradas BOOLEAN DEFAULT FALSE COMMENT 'Notas cerradas (no se pueden modificar)',
    fecha_cierre_notas DATE NULL COMMENT 'Fecha de cierre de notas',
    cerradas_por INT NULL COMMENT 'Usuario que cerró las notas (referencia a usuarios)',
    
    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones sobre esta evaluación específica',
    
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
    
    FOREIGN KEY (inscripcion_materia_id) REFERENCES inscripciones_materias(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_inscripcion_materia_id (inscripcion_materia_id) COMMENT 'Búsqueda por inscripción materia',
    INDEX idx_tipo_evaluacion (tipo_evaluacion) COMMENT 'Filtrado por tipo de evaluación',
    INDEX idx_nota (nota) COMMENT 'Búsqueda por nota',
    INDEX idx_fecha (fecha) COMMENT 'Búsqueda por fecha',
    INDEX idx_bimestre (bimestre) COMMENT 'Búsqueda por bimestre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_inscripcion_tipo (inscripcion_materia_id, tipo_evaluacion, activo, deleted_at) COMMENT 'Búsqueda por inscripción y tipo de evaluación',
    INDEX idx_inscripcion_bimestre (inscripcion_materia_id, bimestre, tipo_evaluacion, activo, deleted_at) COMMENT 'Búsqueda de evaluaciones por inscripción, bimestre y tipo',
    INDEX idx_inscripcion_intento (inscripcion_materia_id, tipo_evaluacion, intento, activo, deleted_at) COMMENT 'Búsqueda de intentos por tipo',
    INDEX idx_notas_cerradas (notas_cerradas, activo, deleted_at) COMMENT 'Búsqueda de notas cerradas'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Calificaciones (notas) de evaluaciones. Cada evaluación (parcial, práctico, recuperatorio) es un registro separado. Permite múltiples evaluaciones del mismo tipo (ej: múltiples recuperatorios). Escala: 0-100 puntos. Nota mínima para aprobar: 61. Sistema de 4 bimestres según Registro Académico de Notas.';

-- ============================================
-- TABLA: historial_nivelaciones
-- ============================================

CREATE TABLE historial_nivelaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NULL COMMENT 'Estudiante en nivelación (referencia a estudiantes)',
    inscripcion_materia_id INT NULL COMMENT 'Materia reprobada original (referencia a inscripciones_materias)',
    materia_id INT NULL COMMENT 'Materia a nivelar (referencia a materias, puede ser la misma o diferente si es equivalencia)',
    gestion_nivelacion_id INT NULL COMMENT 'Gestión en la que se nivelará (referencia a gestiones)',
    numero_intento INT NULL DEFAULT 1 COMMENT 'Número de intento (1, 2, o 3)',
    fecha_inicio DATE NULL COMMENT 'Fecha de inicio de nivelación',
    fecha_examen DATE NULL COMMENT 'Fecha del examen de nivelación',
    nota_nivelacion DECIMAL(5,2) NULL COMMENT 'Nota del examen de nivelación (0-100)',
    estado ENUM('PROGRAMADA', 'EN_CURSO', 'APROBADA', 'REPROBADA', 'CANCELADA') DEFAULT 'PROGRAMADA' COMMENT 'Estado de la nivelación',
    aprobado BOOLEAN NULL COMMENT 'TRUE si aprobó (nota >= 60), FALSE si reprobó',
    docente_evaluador_id INT NULL COMMENT 'Docente que evaluó (referencia a docentes)',
    observaciones TEXT COMMENT 'Observaciones',
    
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
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (inscripcion_materia_id) REFERENCES inscripciones_materias(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_nivelacion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_evaluador_id) REFERENCES docentes(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_inscripcion_materia_id (inscripcion_materia_id) COMMENT 'Búsqueda por materia reprobada original',
    INDEX idx_materia_id (materia_id) COMMENT 'Búsqueda por materia a nivelar',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_gestion_nivelacion_id (gestion_nivelacion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_numero_intento (numero_intento) COMMENT 'Búsqueda por intento',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Búsqueda de nivelaciones por estudiante y estado',
    INDEX idx_materia_intento (materia_id, numero_intento, activo, deleted_at) COMMENT 'Búsqueda de intentos por materia'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de nivelaciones (máximo 3 intentos por materia). Registra los exámenes de nivelación para materias reprobadas.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
