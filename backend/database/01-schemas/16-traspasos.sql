-- ============================================
-- MÓDULO DE TRASPASOS
-- Sistema de Gestión Académica - Instituto INCOS
-- Catálogo: instituciones. Tablas: traspasos, traspasos_materias
-- ============================================
--
-- TRASPASO: Estudiante que viene de otro instituto (no INCOS), completó un periodo
-- completo (ej. 1er año) y se inscribe en INCOS al siguiente periodo. Se convalidan
-- las materias del periodo anterior.
--
-- FLUJO:
-- 1. Estudiante se registra y sube certificado de notas (documentos_estudiante, tipo TRASPASO)
-- 2. Se crea solicitud de traspaso (estado SOLICITADO)
-- 3. Revisión académica: ¿completó todo el periodo? → APROBADO / RECHAZADO
-- 4. Si APROBADO: se convalidan materias (traspasos_materias), paga matrícula, se crea inscripción
--    con traspaso_id y tipo_inscripcion = TRASPASO_ENTRADA
--
-- RELACIÓN: inscripciones.traspaso_id → traspasos.id
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tablas si existen (instituciones se crea si no existe en este script)
DROP TABLE IF EXISTS traspasos_materias;
DROP TABLE IF EXISTS traspasos;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: instituciones
-- Catálogo de instituciones educativas (origen de traspasos/transitabilidades)
-- ============================================

CREATE TABLE IF NOT EXISTS instituciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre del instituto',
    sigla VARCHAR(50) NULL COMMENT 'Sigla o código',

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

    -- Índices para optimización
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de instituciones educativas (origen para traspasos y transitabilidades).';

-- ============================================
-- TABLA: traspasos
-- Solicitudes de traspaso desde otro instituto (periodo completado → INCOS)
-- ============================================

CREATE TABLE traspasos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NULL COMMENT 'Estudiante que solicita el traspaso (referencia a estudiantes)',
    institucion_origen_id INT NULL COMMENT 'Institución de origen (referencia a instituciones)',

    -- Periodo completado en origen
    periodo_origen_numero INT NOT NULL COMMENT 'Número de periodo completado: 1, 2 o 3',
    periodo_origen_nombre VARCHAR(100) NULL COMMENT 'Nombre del periodo (ej: Primer Año)',

    -- Asignación en INCOS
    carrera_destino_id INT NULL COMMENT 'Carrera en INCOS (referencia a carreras)',
    plan_estudio_destino_id INT NULL COMMENT 'Plan de estudios en INCOS (referencia a planes_estudios)',
    periodo_destino_id INT NULL COMMENT 'Periodo al que ingresa (referencia a periodos)',

    -- Validación
    estado ENUM('SOLICITADO', 'EN_REVISION', 'APROBADO', 'RECHAZADO') DEFAULT 'SOLICITADO' COMMENT 'Estado de la solicitud de traspaso',
    fecha_solicitud DATE NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de solicitud',
    fecha_resolucion DATE NULL COMMENT 'Fecha en que se aprobó o rechazó',
    resuelto_por INT NULL COMMENT 'Usuario que resolvió (referencia a usuarios)',
    motivo_rechazo TEXT NULL COMMENT 'Motivo de rechazo (si estado = RECHAZADO)',

    -- Documentación (certificado de notas)
    certificado_documento_id INT NULL COMMENT 'Documento certificado de notas (referencia a documentos_estudiante)',
    observaciones TEXT NULL COMMENT 'Observaciones de la revisión',

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
    FOREIGN KEY (institucion_origen_id) REFERENCES instituciones(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_destino_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (plan_estudio_destino_id) REFERENCES planes_estudios(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_destino_id) REFERENCES periodos(id) ON DELETE SET NULL,
    FOREIGN KEY (certificado_documento_id) REFERENCES documentos_estudiante(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_institucion_origen_id (institucion_origen_id) COMMENT 'Búsqueda por institución origen',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_fecha_solicitud (fecha_solicitud) COMMENT 'Búsqueda por fecha de solicitud',
    INDEX idx_carrera_destino_id (carrera_destino_id) COMMENT 'Búsqueda por carrera destino',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Traspasos: estudiante de otro instituto que completó un periodo y se inscribe en INCOS al siguiente.';

-- ============================================
-- TABLA: traspasos_materias
-- Materias convalidadas en traspasos (origen → INCOS)
-- ============================================

CREATE TABLE traspasos_materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    traspaso_id INT NULL COMMENT 'Traspaso (referencia a traspasos)',

    -- Materia del instituto origen
    materia_origen_nombre VARCHAR(200) NULL COMMENT 'Nombre de la materia en institución origen',
    materia_origen_codigo VARCHAR(50) NULL COMMENT 'Código/sigla de la materia en origen',
    nota_origen DECIMAL(5,2) NULL COMMENT 'Nota obtenida en la materia en origen',

    -- Materia equivalente en INCOS
    materia_destino_id INT NULL COMMENT 'Referencia a materias (materia equivalente en INCOS)',
    nota_convalidada DECIMAL(5,2) NULL COMMENT 'Nota convalidada en INCOS (si aplica)',

    observaciones TEXT NULL COMMENT 'Observaciones de la convalidación',

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

    FOREIGN KEY (traspaso_id) REFERENCES traspasos(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_destino_id) REFERENCES materias(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_traspaso_id (traspaso_id) COMMENT 'Búsqueda por traspaso',
    INDEX idx_materia_destino_id (materia_destino_id) COMMENT 'Búsqueda por materia destino',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Materias convalidadas en traspasos (origen → destino INCOS).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
