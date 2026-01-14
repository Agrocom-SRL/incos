-- ============================================
-- MÓDULO DE INSCRIPCIONES - PARTE 2
-- Sistema de Gestión Académica - Instituto INCOS
-- 3 Tablas: inscripciones_materias, calificaciones, historial_nivelaciones
-- ============================================
--
-- NORMALIZACIÓN DE DATOS:
--
-- PROBLEMA: La tabla original mezclaba demasiadas responsabilidades:
-- - La relación estudiante → asignación docente
-- - Las calificaciones (notas de parciales, práctico, recuperatorio)
-- - La asistencia
-- - El estado
--
-- SOLUCIÓN: Separar en tablas especializadas:
--
-- 1. inscripciones_materias: Solo la relación estudiante → asignación docente
--    - Contiene: inscripcion_id, asignacion_docente_id, estado
--    - Contiene: resumen (nota_final, nota_definitiva - calculados desde calificaciones)
--    - NO contiene: asistencia (debe estar en tabla separada de asistencia/clases)
--    - NO contiene: numero_intento (la inscripción no se reutiliza)
--    - NO contiene: gestion_vencida/gestion_lleva (no corresponde a detalle de inscripción)
--    - NO contiene: control de notas cerradas (corresponde a calificaciones)
--
-- 2. calificaciones: Todas las notas de evaluaciones
--    - Contiene: inscripcion_materia_id, tipo_evaluacion, nota, fecha, intento
--    - Tipos: 1ER_PARCIAL, 2DO_PARCIAL, 3ER_PARCIAL, 4TO_PARCIAL, PRACTICO, RECUPERATORIO
--    - Permite múltiples evaluaciones del mismo tipo (ej: múltiples recuperatorios)
--
-- 3. historial_nivelaciones: Exámenes de nivelación (separado porque es proceso especial)
--
-- VENTAJAS DE ESTA ESTRUCTURA:
-- - Normalización: Cada tabla tiene una responsabilidad clara
-- - Flexibilidad: Puede haber múltiples evaluaciones del mismo tipo
-- - Escalabilidad: Fácil agregar nuevos tipos de evaluación
-- - Consultas: Más simples para reportes específicos
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
-- Registra la inscripción de un estudiante a una asignación docente específica.
-- Esta es la TABLA PRINCIPAL que vincula estudiante con asignación docente.
--
-- ¿QUÉ CONTIENE?
-- - La relación básica: estudiante (vía inscripcion_id) → asignacion_docente_id
-- - Estado: estado (INSCRITO, CURSANDO, APROBADO, REPROBADO, etc.)
-- - Resumen académico: nota_final, nota_definitiva (calculados desde calificaciones)
--
-- ¿QUÉ NO CONTIENE?
-- - Las notas individuales de cada parcial (están en calificaciones)
-- - Las fechas de cada evaluación (están en calificaciones)
-- - Los detalles de recuperatorios (están en calificaciones)
-- - Asistencia (debe estar en tabla separada de asistencia/clases)
-- - numero_intento (la inscripción no se reutiliza, cada intento es una nueva inscripción)
-- - gestion_vencida/gestion_lleva (no corresponde a detalle de inscripción)
-- - Control de notas cerradas (corresponde a calificaciones o gestión)
--
-- NOTA: nota_final y nota_definitiva se calculan mediante VISTA o TRIGGER
-- desde la tabla calificaciones.
-- ============================================

CREATE TABLE inscripciones_materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_id INT NULL COMMENT 'Inscripción del estudiante (referencia a inscripciones)',
    asignacion_docente_id INT NULL COMMENT 'Asignación docente específica (curso + docente + gestion_plan) a la que se inscribe. Garantiza que el curso esté activo en la gestión y tenga docente asignado.',
    
    -- Resumen académico (calculado desde calificaciones)
    -- Estos campos se actualizan mediante TRIGGER o VISTA desde la tabla calificaciones
    nota_final DECIMAL(5,2) NULL COMMENT 'Nota final (promedio de parciales y práctico, calculado desde calificaciones)',
    nota_definitiva DECIMAL(5,2) NULL COMMENT 'Nota definitiva (considera recuperatorio si aprobó >=60, calculado desde calificaciones)',
    
    -- Estado de la materia
    -- DIFERENCIA CON tipo_inscripcion (en inscripciones):
    -- - tipo_inscripcion: Tipo de inscripción del estudiante (NUEVO, REINGRESO, CONTINUIDAD)
    -- - estado: Estado de esta materia específica (INSCRITO, CURSANDO, APROBADO, REPROBADO, etc.)
    -- Un estudiante puede tener tipo_inscripcion=CONTINUIDAD pero una materia con estado=REPROBADO
    estado ENUM(
        'INSCRITO', 
        'CURSANDO', 
        'APROBADO', 
        'REPROBADO', 
        'ABANDONO', 
        'RETIRADO'
    ) DEFAULT 'INSCRITO' COMMENT 'Estado de la materia individual (se actualiza automáticamente según nota_definitiva). Diferente de tipo_inscripcion que está en la tabla inscripciones.',
    
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
    
    -- Foreign keys
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,
    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
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
COMMENT='Inscripción de estudiante a una asignación docente específica. Contiene solo la relación básica (inscripcion_id → asignacion_docente_id), estado y resumen académico (nota_final, nota_definitiva calculados desde calificaciones). Las calificaciones detalladas están en la tabla calificaciones. La asistencia debe estar en una tabla separada de asistencia/clases.';

-- ============================================
-- TABLA: calificaciones
-- ============================================
-- Registra todas las calificaciones (notas) de un estudiante en una materia.
-- Cada evaluación (parcial, práctico, recuperatorio) es un registro separado.
--
-- ¿QUÉ CONTIENE?
-- - inscripcion_materia_id: A qué materia pertenece esta calificación
-- - tipo_evaluacion: Qué tipo de evaluación es (1ER_PARCIAL, 2DO_PARCIAL, etc.)
-- - nota: La nota obtenida (0-100)
-- - fecha: Fecha de la evaluación
-- - intento: Número de intento (para recuperatorios: 1, 2, 3)
-- - Control de notas: notas_cerradas, fecha_cierre_notas, cerradas_por
-- - observaciones: Observaciones sobre esta evaluación específica
--
-- ¿POR QUÉ TABLA SEPARADA?
-- - Permite múltiples evaluaciones del mismo tipo (ej: 3 recuperatorios)
-- - Facilita agregar nuevos tipos de evaluación sin modificar la estructura
-- - Normalización: Separar datos de evaluaciones de la inscripción
-- - Consultas más simples: Fácil filtrar por tipo de evaluación
--
-- EJEMPLO DE USO:
-- - Estudiante tiene: 1ER_PARCIAL (nota=75), 2DO_PARCIAL (nota=80), RECUPERATORIO intento 1 (nota=55), RECUPERATORIO intento 2 (nota=65)
-- - Se calcula nota_final = promedio de parciales = (75+80)/2 = 77.5
-- - Se calcula nota_definitiva = 60 (porque aprobó recuperatorio >=60)
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
    nota DECIMAL(5,2) NULL COMMENT 'Nota obtenida (0-100)',
    fecha DATE NULL COMMENT 'Fecha de la evaluación',
    
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
    
    -- Foreign keys
    FOREIGN KEY (inscripcion_materia_id) REFERENCES inscripciones_materias(id) ON DELETE SET NULL,
    FOREIGN KEY (cerradas_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_inscripcion_materia_id (inscripcion_materia_id) COMMENT 'Búsqueda por inscripción materia',
    INDEX idx_tipo_evaluacion (tipo_evaluacion) COMMENT 'Filtrado por tipo de evaluación',
    INDEX idx_nota (nota) COMMENT 'Búsqueda por nota',
    INDEX idx_fecha (fecha) COMMENT 'Búsqueda por fecha',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_inscripcion_tipo (inscripcion_materia_id, tipo_evaluacion, activo, deleted_at) COMMENT 'Búsqueda por inscripción y tipo de evaluación',
    INDEX idx_inscripcion_intento (inscripcion_materia_id, tipo_evaluacion, intento, activo, deleted_at) COMMENT 'Búsqueda de intentos por tipo',
    INDEX idx_notas_cerradas (notas_cerradas, activo, deleted_at) COMMENT 'Búsqueda de notas cerradas'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Calificaciones (notas) de evaluaciones. Cada evaluación (parcial, práctico, recuperatorio) es un registro separado. Permite múltiples evaluaciones del mismo tipo (ej: múltiples recuperatorios).';

-- ============================================
-- TABLA: historial_nivelaciones
-- ============================================
-- Registra el historial de nivelaciones de materias reprobadas.
-- Una nivelación es un examen especial para aprobar una materia reprobada.
--
-- ¿QUÉ ES ESTA TABLA?
-- Cuando un estudiante reprueba una materia 2+ veces, debe hacer una "nivelación"
-- (examen especial) para poder continuar. Esta tabla registra esos exámenes.
--
-- ¿POR QUÉ EXISTE ESTA TABLA?
-- Porque las nivelaciones son procesos separados de las materias normales.
-- Tienen su propia gestión, fecha, docente evaluador, etc.
--
-- REGLAS DE NIVELACIÓN:
-- - Máximo 3 intentos por materia
-- - Se programa en una gestión específica
-- - Nota mínima para aprobar: 60
-- - Si aprueba, se actualiza el estado de la materia original
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
    
    -- Foreign keys
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (inscripcion_materia_id) REFERENCES inscripciones_materias(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_nivelacion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_evaluador_id) REFERENCES docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
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
-- NOTA: Los triggers para calcular nota_final y nota_definitiva desde calificaciones
-- se encuentran en: 12-inscripciones-logica.sql
-- ============================================
