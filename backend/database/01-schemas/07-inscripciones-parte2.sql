-- ============================================
-- MÓDULO DE INSCRIPCIONES - PARTE 2
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: inscripciones_materias, historial_nivelaciones
-- ============================================
--
-- Esta parte contiene las tablas relacionadas con:
-- 1. inscripciones_materias: Materias específicas inscritas por un estudiante
--    - Sistema de calificaciones flexible (máximo 4 parciales + práctico)
--    - Control de asistencia
--    - Estados de la materia (aprobado, reprobado, nivelación, etc.)
-- 2. historial_nivelaciones: Historial de nivelaciones de materias reprobadas
--    - Máximo 3 intentos por materia
--    - Seguimiento de aprobación/reprobación
--
-- RELACIÓN CON OTRAS TABLAS:
-- - inscripciones: Inscripción principal a la que pertenecen estas materias
-- - materias: Materia inscrita
-- - cursos: Curso/grupo específico al que se inscribe
-- - docentes: Docente asignado al curso
-- - gestiones: Gestión en la que se aprobó/reprobó (para materias vencidas)
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS historial_nivelaciones;
DROP TABLE IF EXISTS inscripciones_materias;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: inscripciones_materias
-- ============================================
-- Registra la inscripción de un estudiante a una materia específica
-- dentro de una inscripción principal.
--
-- SISTEMA DE CALIFICACIONES:
-- - Máximo 4 parciales + 1 práctico (flexible, no todos deben existir)
-- - Nota final = promedio de los componentes evaluados
-- - Recuperatorio/Habilitación: máximo 3 intentos, nota mínima 60 para aprobar
-- - Nota definitiva: considera recuperatorio si aplica
--
-- CONTROL DE ASISTENCIA:
-- - Se registran asistencias, faltas y total de clases
-- - Porcentaje de asistencia se calcula automáticamente
--
-- ESTADOS DE LA MATERIA:
-- - INSCRITO: Inscrito pero aún no inicia clases
-- - CURSANDO: Actualmente cursando la materia
-- - APROBADO: Aprobó la materia (nota definitiva >= 60)
-- - REPROBADO: Reprobó la materia (nota definitiva < 60)
-- - ABANDONO: Abandonó la materia
-- - RETIRADO: Se retiró de la materia
-- - VENCIDA_GESTION_ANTERIOR: Aprobó en gestión anterior
-- - NIVELACION_1RA_INSTANCIA: En nivelación primera instancia
-- - NIVELACION_2DA_INSTANCIA: En nivelación segunda instancia
-- - PRUEBA_EXCEPCIONAL: Prueba excepcional
-- - HOMOLOGACION: Materia homologada
-- - REINCOPRPORACION: Reincorporación
-- - CHOQUE_HORARIO: Choque de horario
-- - PRE_REQUISITO: No cumple prerrequisitos
-- - LLEVA_PROXIMA_GESTION: Llevará en próxima gestión
-- - NO_LLEVA_VOLUNTAD: No lleva por voluntad propia
-- - NO_PRESENTO: No se presentó a evaluaciones
--
-- VALIDACIONES:
-- - El curso_id debe corresponder a la materia_id
-- - El docente_id debe estar asignado al curso en la gestión
-- - Las notas deben estar entre 0 y 100
-- - El porcentaje de asistencia debe estar entre 0 y 100
-- ============================================

CREATE TABLE inscripciones_materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_id INT NOT NULL COMMENT 'Inscripción del estudiante',
    materia_id INT NOT NULL COMMENT 'Materia inscrita',
    curso_id INT NOT NULL COMMENT 'Curso/grupo específico',
    docente_id INT COMMENT 'Docente asignado',
    
    -- Control de intentos (crucial para sistema de nivelaciones)
    -- IMPORTANTE: Este campo rastrea cuántas veces el estudiante ha intentado cursar esta materia.
    -- Se incrementa automáticamente cuando se inscribe nuevamente después de reprobar.
    -- Si tiene 2+ intentos con estado REPROBADO, se crea automáticamente una nivelación.
    numero_intento INT DEFAULT 1 COMMENT 'Número de intento de cursar esta materia (1, 2, 3, ...). Se incrementa automáticamente cada vez que se inscribe nuevamente después de reprobar. Crucial para el sistema de nivelaciones.',
    
    -- Asistencia
    asistencias INT DEFAULT 0 COMMENT 'Número de asistencias',
    faltas INT DEFAULT 0 COMMENT 'Número de faltas',
    total_clases INT DEFAULT 0 COMMENT 'Total de clases impartidas',
    asistencia_porcentaje DECIMAL(5,2) DEFAULT 0 COMMENT 'Porcentaje de asistencia',
    
    -- Sistema de calificaciones (máximo 4 parciales, flexibles)
    nota_1er_parcial DECIMAL(5,2) COMMENT 'Nota del 1er Parcial (0-100)',
    fecha_1er_parcial DATE COMMENT 'Fecha del 1er Parcial',
    nota_2do_parcial DECIMAL(5,2) COMMENT 'Nota del 2do Parcial (0-100)',
    fecha_2do_parcial DATE COMMENT 'Fecha del 2do Parcial',
    nota_3er_parcial DECIMAL(5,2) COMMENT 'Nota del 3er Parcial (0-100)',
    fecha_3er_parcial DATE COMMENT 'Fecha del 3er Parcial',
    nota_4to_parcial DECIMAL(5,2) COMMENT 'Nota del 4to Parcial (0-100)',
    fecha_4to_parcial DATE COMMENT 'Fecha del 4to Parcial',
    nota_practico DECIMAL(5,2) COMMENT 'Nota del Práctico (0-100)',
    fecha_practico DATE COMMENT 'Fecha del Práctico',
    
    -- Cálculo de suma total (solo suma los parciales/práctico que existen)
    suma_total DECIMAL(5,2) GENERATED ALWAYS AS (
        COALESCE(nota_1er_parcial, 0) + 
        COALESCE(nota_2do_parcial, 0) + 
        COALESCE(nota_3er_parcial, 0) + 
        COALESCE(nota_4to_parcial, 0) + 
        COALESCE(nota_practico, 0)
    ) STORED COMMENT 'Suma total de todos los parciales y práctico',
    
    -- Contador de componentes evaluados
    componentes_evaluados INT GENERATED ALWAYS AS (
        (CASE WHEN nota_1er_parcial IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN nota_2do_parcial IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN nota_3er_parcial IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN nota_4to_parcial IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN nota_practico IS NOT NULL THEN 1 ELSE 0 END)
    ) STORED COMMENT 'Número de componentes evaluados',
    
    -- Nota final (promedio de componentes disponibles, mínimo 1)
    nota_final DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN componentes_evaluados > 0 THEN suma_total / componentes_evaluados
            ELSE NULL
        END
    ) STORED COMMENT 'Nota final (promedio de componentes evaluados)',
    
    -- Recuperatorio/Habilitación
    nota_recuperatorio DECIMAL(5,2) COMMENT 'Nota del Recuperatorio/Habilitación (0-100)',
    fecha_recuperatorio DATE COMMENT 'Fecha del Recuperatorio',
    intento_recuperatorio INT DEFAULT 0 COMMENT 'Número de intento (1, 2, o 3)',
    tipo_recuperatorio ENUM('RECUPERATORIO', 'HABILITACION', 'PRUEBA_EXCEPCIONAL') COMMENT 'Tipo de recuperación',
    
    -- Nota definitiva (considerando recuperatorio)
    nota_definitiva DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN nota_recuperatorio IS NOT NULL AND nota_recuperatorio >= 60 THEN 60.00
            ELSE nota_final
        END
    ) STORED COMMENT 'Nota definitiva (considera recuperatorio)',
    
    -- Estado de la materia (ampliado según documentos Excel)
    estado ENUM(
        'INSCRITO', 
        'CURSANDO', 
        'APROBADO', 
        'REPROBADO', 
        'ABANDONO', 
        'RETIRADO',
        'VENCIDA_GESTION_ANTERIOR',
        'NIVELACION_1RA_INSTANCIA',
        'NIVELACION_2DA_INSTANCIA',
        'PRUEBA_EXCEPCIONAL',
        'HOMOLOGACION',
        'REINCOPRPORACION',
        'CHOQUE_HORARIO',
        'PRE_REQUISITO',
        'LLEVA_PROXIMA_GESTION',
        'NO_LLEVA_VOLUNTAD',
        'NO_PRESENTO'
    ) DEFAULT 'INSCRITO' COMMENT 'Estado de la materia',
    
    -- Información adicional de estado
    gestion_vencida INT COMMENT 'Gestión en la que se aprobó (si estado = VENCIDA_GESTION_ANTERIOR)',
    gestion_lleva INT COMMENT 'Gestión en la que llevará (si estado = LLEVA_PROXIMA_GESTION)',
    
    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones generales',
    observaciones_docente TEXT COMMENT 'Observaciones del docente',
    
    -- Control de registro de notas
    notas_cerradas BOOLEAN DEFAULT FALSE COMMENT 'Notas cerradas (no se pueden modificar)',
    fecha_cierre_notas DATE COMMENT 'Fecha de cierre de notas',
    cerradas_por INT COMMENT 'Usuario que cerró las notas',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_vencida) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_lleva) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (cerradas_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_inscripcion_id (inscripcion_id) COMMENT 'Búsqueda por inscripción',
    INDEX idx_materia_id (materia_id) COMMENT 'Búsqueda por materia',
    INDEX idx_curso_id (curso_id) COMMENT 'Búsqueda por curso',
    INDEX idx_docente_id (docente_id) COMMENT 'Búsqueda por docente',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_nota_final (nota_final) COMMENT 'Búsqueda por nota final',
    INDEX idx_gestion_vencida (gestion_vencida) COMMENT 'Búsqueda por gestión vencida',
    INDEX idx_gestion_lleva (gestion_lleva) COMMENT 'Búsqueda por gestión a llevar',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_materia_intento (inscripcion_id, materia_id, numero_intento) COMMENT 'Búsqueda por estudiante, materia e intento (para conteo de aplazos)',
    INDEX idx_materia_estado_intento (materia_id, estado, numero_intento, activo, deleted_at) COMMENT 'Búsqueda de aplazos por materia',
    
    CHECK (nota_1er_parcial IS NULL OR (nota_1er_parcial >= 0 AND nota_1er_parcial <= 100)),
    CHECK (nota_2do_parcial IS NULL OR (nota_2do_parcial >= 0 AND nota_2do_parcial <= 100)),
    CHECK (nota_3er_parcial IS NULL OR (nota_3er_parcial >= 0 AND nota_3er_parcial <= 100)),
    CHECK (nota_4to_parcial IS NULL OR (nota_4to_parcial >= 0 AND nota_4to_parcial <= 100)),
    CHECK (nota_practico IS NULL OR (nota_practico >= 0 AND nota_practico <= 100)),
    CHECK (nota_recuperatorio IS NULL OR (nota_recuperatorio >= 0 AND nota_recuperatorio <= 100)),
    CHECK (intento_recuperatorio >= 0 AND intento_recuperatorio <= 3),
    CHECK (asistencia_porcentaje >= 0 AND asistencia_porcentaje <= 100),
    CHECK (numero_intento >= 1) COMMENT 'El número de intento debe ser al menos 1'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscripciones a materias con sistema de calificaciones flexible';

-- ============================================
-- TABLA: historial_nivelaciones
-- ============================================
-- Registra el historial de nivelaciones de materias reprobadas.
-- Una nivelación es un examen especial para aprobar una materia reprobada.
--
-- REGLAS DE NIVELACIÓN:
-- - Máximo 3 intentos por materia
-- - Se programa en una gestión específica
-- - Nota mínima para aprobar: 60
-- - Si aprueba, se actualiza el estado de la materia original
--
-- FLUJO:
-- 1. Estudiante reprueba una materia (inscripciones_materias con estado REPROBADO)
-- 2. Se crea un registro en historial_nivelaciones con estado PROGRAMADA
-- 3. Se programa el examen (fecha_examen)
-- 4. Se realiza el examen (estado EN_CURSO)
-- 5. Se registra la nota (nota_nivelacion)
-- 6. Si nota >= 60: estado APROBADA, aprobado = TRUE
-- 7. Si nota < 60: estado REPROBADA, aprobado = FALSE
-- 8. Si es el 3er intento y reprueba, no puede nivelar más
--
-- RELACIÓN:
-- - inscripcion_materia_id: Materia reprobada original
-- - materia_id: Materia a nivelar (puede ser la misma o diferente si es equivalencia)
-- - gestion_nivelacion_id: Gestión en la que se realizará la nivelación
-- ============================================

CREATE TABLE historial_nivelaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante en nivelación',
    inscripcion_materia_id INT NOT NULL COMMENT 'Materia reprobada original',
    materia_id INT NOT NULL COMMENT 'Materia a nivelar',
    gestion_nivelacion_id INT NOT NULL COMMENT 'Gestión en la que se nivelará',
    numero_intento INT NOT NULL DEFAULT 1 COMMENT 'Número de intento (1, 2, o 3)',
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio de nivelación',
    fecha_examen DATE COMMENT 'Fecha del examen de nivelación',
    nota_nivelacion DECIMAL(5,2) COMMENT 'Nota del examen de nivelación (0-100)',
    estado ENUM('PROGRAMADA', 'EN_CURSO', 'APROBADA', 'REPROBADA', 'CANCELADA') DEFAULT 'PROGRAMADA' COMMENT 'Estado de la nivelación',
    aprobado BOOLEAN COMMENT 'TRUE si aprobó (nota >= 60), FALSE si reprobó',
    docente_evaluador_id INT COMMENT 'Docente que evaluó',
    observaciones TEXT COMMENT 'Observaciones',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (inscripcion_materia_id) REFERENCES inscripciones_materias(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_nivelacion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_evaluador_id) REFERENCES docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_materia_id (materia_id) COMMENT 'Búsqueda por materia',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_gestion_nivelacion_id (gestion_nivelacion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_numero_intento (numero_intento) COMMENT 'Búsqueda por intento',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    
    CHECK (numero_intento >= 1 AND numero_intento <= 3),
    CHECK (nota_nivelacion IS NULL OR (nota_nivelacion >= 0 AND nota_nivelacion <= 100))
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de nivelaciones (máximo 3 intentos por materia)';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- NOTA: Los triggers, stored procedures y vistas se encuentran en:
-- 07-inscripciones-logica.sql
-- ============================================
