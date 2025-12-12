-- ============================================
-- MÓDULO DE INSCRIPCIONES - PARTE 2
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: inscripciones_materias, historial_nivelaciones
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
-- Sistema de calificaciones flexible (máximo 4 parciales, no siempre completos)
-- ============================================

CREATE TABLE inscripciones_materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_id INT NOT NULL COMMENT 'Inscripción del estudiante',
    materia_id INT NOT NULL COMMENT 'Materia inscrita',
    curso_id INT NOT NULL COMMENT 'Curso/grupo específico',
    docente_id INT COMMENT 'Docente asignado',
    
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
    
    CHECK (nota_1er_parcial IS NULL OR (nota_1er_parcial >= 0 AND nota_1er_parcial <= 100)),
    CHECK (nota_2do_parcial IS NULL OR (nota_2do_parcial >= 0 AND nota_2do_parcial <= 100)),
    CHECK (nota_3er_parcial IS NULL OR (nota_3er_parcial >= 0 AND nota_3er_parcial <= 100)),
    CHECK (nota_4to_parcial IS NULL OR (nota_4to_parcial >= 0 AND nota_4to_parcial <= 100)),
    CHECK (nota_practico IS NULL OR (nota_practico >= 0 AND nota_practico <= 100)),
    CHECK (nota_recuperatorio IS NULL OR (nota_recuperatorio >= 0 AND nota_recuperatorio <= 100)),
    CHECK (intento_recuperatorio >= 0 AND intento_recuperatorio <= 3),
    CHECK (asistencia_porcentaje >= 0 AND asistencia_porcentaje <= 100)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inscripciones a materias con sistema de calificaciones flexible';

-- ============================================
-- TABLA: historial_nivelaciones
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
-- TRIGGERS
-- ============================================

DELIMITER $$

-- Trigger para actualizar estado automáticamente según nota definitiva
DROP TRIGGER IF EXISTS trg_inscripcion_materia_actualizar_estado$$

CREATE TRIGGER trg_inscripcion_materia_actualizar_estado
BEFORE UPDATE ON inscripciones_materias
FOR EACH ROW
BEGIN
    IF NEW.notas_cerradas = FALSE THEN
        IF NEW.nota_definitiva IS NOT NULL THEN
            IF NEW.nota_definitiva >= 60 THEN
                SET NEW.estado = 'APROBADO';
            ELSE
                SET NEW.estado = 'REPROBADO';
            END IF;
        END IF;
    END IF;
END$$

-- Trigger para actualizar porcentaje de asistencia
DROP TRIGGER IF EXISTS trg_actualizar_asistencia_porcentaje$$

CREATE TRIGGER trg_actualizar_asistencia_porcentaje
BEFORE UPDATE ON inscripciones_materias
FOR EACH ROW
BEGIN
    IF NEW.total_clases > 0 THEN
        SET NEW.asistencia_porcentaje = (NEW.asistencias / NEW.total_clases) * 100;
    END IF;
END$$

-- Trigger para actualizar aprobado en nivelaciones
DROP TRIGGER IF EXISTS trg_nivelacion_actualizar_aprobado$$

CREATE TRIGGER trg_nivelacion_actualizar_aprobado
BEFORE UPDATE ON historial_nivelaciones
FOR EACH ROW
BEGIN
    IF NEW.nota_nivelacion IS NOT NULL THEN
        IF NEW.nota_nivelacion >= 60 THEN
            SET NEW.aprobado = TRUE;
            SET NEW.estado = 'APROBADA';
        ELSE
            SET NEW.aprobado = FALSE;
            SET NEW.estado = 'REPROBADA';
        END IF;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;
