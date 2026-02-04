-- ============================================
-- MÓDULO DE TRANSITABILIDADES
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: transitabilidades, transitabilidades_materias
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS transitabilidades_materias;
DROP TABLE IF EXISTS transitabilidades;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: transitabilidades
-- Solicitudes de transitabilidad (Técnico Medio → Técnico Superior)
-- ============================================

CREATE TABLE transitabilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NULL COMMENT 'Estudiante que solicita transitabilidad (referencia a estudiantes)',
    institucion_origen_id INT NULL COMMENT 'Institución donde obtuvo Técnico Medio (referencia a instituciones)',

    -- Título previo (Técnico Medio)
    titulo_previo VARCHAR(200) NOT NULL COMMENT 'Ej: Técnico Medio en Contabilidad',
    anio_egreso INT NULL COMMENT 'Año de egreso',
    numero_titulo VARCHAR(100) NULL COMMENT 'Número de registro del título',

    -- Destino en INCOS (Técnico Superior)
    carrera_destino_id INT NULL COMMENT 'Carrera Técnico Superior en INCOS (referencia a carreras)',
    plan_estudio_destino_id INT NULL COMMENT 'Plan de estudios en INCOS (referencia a planes_estudios)',

    -- Materias que debe cursar (lista o descripción)
    materias_complementarias TEXT NULL COMMENT 'Lista o descripción de materias que debe completar',

    -- Validación
    estado ENUM('SOLICITADO', 'EN_REVISION', 'APROBADO', 'RECHAZADO') DEFAULT 'SOLICITADO' COMMENT 'Estado de la solicitud de transitabilidad',
    fecha_solicitud DATE NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de solicitud',
    fecha_resolucion DATE NULL COMMENT 'Fecha en que se aprobó o rechazó',
    resuelto_por INT NULL COMMENT 'Usuario que resolvió (referencia a usuarios)',
    motivo_rechazo TEXT NULL COMMENT 'Motivo de rechazo (si estado = RECHAZADO)',

    -- Documentación
    titulo_documento_id INT NULL COMMENT 'Documento título de Técnico Medio (referencia a documentos_estudiante)',
    certificado_documento_id INT NULL COMMENT 'Certificado u otro documento (referencia a documentos_estudiante)',
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
    FOREIGN KEY (titulo_documento_id) REFERENCES documentos_estudiante(id) ON DELETE SET NULL,
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
COMMENT='Transitabilidad: estudiante con Técnico Medio que cursa solo materias complementarias para Técnico Superior.';

-- ============================================
-- TABLA: transitabilidades_materias
-- Materias convalidadas o pendientes por transitabilidad
-- ============================================

CREATE TABLE transitabilidades_materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transitabilidad_id INT NULL COMMENT 'Transitabilidad (referencia a transitabilidades)',

    -- Materia del Técnico Medio
    materia_origen_nombre VARCHAR(200) NULL COMMENT 'Nombre de la materia en institución origen',
    materia_origen_codigo VARCHAR(50) NULL COMMENT 'Código/sigla de la materia en origen',
    nota_origen DECIMAL(5,2) NULL COMMENT 'Nota obtenida en la materia en origen',

    -- Materia equivalente en INCOS (puede ser NULL si no tiene equivalencia)
    materia_destino_id INT NULL COMMENT 'Referencia a materias (materia equivalente en INCOS)',
    nota_convalidada DECIMAL(5,2) NULL COMMENT 'Nota convalidada en INCOS (si aplica)',

    convalidada BOOLEAN DEFAULT FALSE COMMENT 'Si esta materia se convalida o debe cursarla',
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

    FOREIGN KEY (transitabilidad_id) REFERENCES transitabilidades(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_destino_id) REFERENCES materias(id) ON DELETE SET NULL,

    -- Índices para optimización
    INDEX idx_transitabilidad_id (transitabilidad_id) COMMENT 'Búsqueda por transitabilidad',
    INDEX idx_materia_destino_id (materia_destino_id) COMMENT 'Búsqueda por materia destino',
    INDEX idx_convalidada (convalidada) COMMENT 'Filtrado por materias convalidadas',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Materias convalidadas o pendientes de cursar en transitabilidad (Técnico Medio → Técnico Superior).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
