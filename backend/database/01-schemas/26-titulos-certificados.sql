-- ============================================
-- MÓDULO DE TÍTULOS Y CERTIFICADOS
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: titulos, certificados
-- PENDIENTE DE DOCUMENTACIÓN REAL: no se encontró ningún formulario oficial
-- de emisión de título, registro nacional o certificado en la documentación
-- revisada (/Users/miguel/Documents/incos/). Este schema sigue siendo una
-- PROPUESTA sin base documental — no inventar más estructura; ajustar recién
-- cuando exista el formato real del instituto.
-- Ajustes de integridad YA APLICADOS (necesarios para que la cadena de
-- schemas ejecute en orden numérico):
--   1) pasantia_id (FK a pasantias, 24-pasantias.sql): la práctica laboral
--      (R.M. 487/2023) es un requisito de titulación paralelo a la modalidad
--      de graduación — el título depende de ambos cumplimientos.
--   2) folio_estudiante_id (FK a folio_estudiantes, 25-libros-registro.sql):
--      reemplaza al antiguo folio_id → folios_estudiantes (tabla eliminada
--      en el refactor de libros); apunta a la fila del estudiante en el
--      folio del centralizador.
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS certificados;
DROP TABLE IF EXISTS titulos;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: titulos
-- ============================================

CREATE TABLE titulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    estudiante_id INT NULL COMMENT 'Estudiante que recibe el título (referencia a estudiantes)',
    carrera_id INT NULL COMMENT 'Carrera del título (referencia a carreras)',
    folio_estudiante_id INT NULL COMMENT 'Fila del estudiante en el folio del centralizador (referencia a folio_estudiantes, 25-libros-registro.sql)',
    proyecto_grado_id INT NULL COMMENT 'Proyecto de grado aprobado (referencia a proyectos_grado, si aplica)',
    pasantia_id INT NULL COMMENT 'Práctica laboral cumplida o convalidada (referencia a pasantias, 24-pasantias.sql). Requisito paralelo a la modalidad de graduación según R.M. 487/2023',
    gestion_egreso_id INT NULL COMMENT 'Gestión en que egresó (referencia a gestiones)',
    
    -- Datos del título
    tipo_titulo ENUM('TECNICO_MEDIO', 'TECNICO_SUPERIOR') NOT NULL COMMENT 'Tipo de título emitido',
    numero_titulo VARCHAR(100) NULL COMMENT 'Número de registro del título (asignado por el instituto)',
    numero_registro_nacional VARCHAR(100) NULL COMMENT 'Número de registro nacional (si aplica)',
    
    -- Estado del título
    estado ENUM('EN_TRAMITE', 'EMITIDO', 'ENTREGADO', 'DUPLICADO', 'ANULADO') DEFAULT 'EN_TRAMITE' 
        COMMENT 'Estado del título',
    
    -- Fechas importantes
    fecha_egreso DATE NULL COMMENT 'Fecha de egreso del estudiante',
    fecha_emision DATE NULL COMMENT 'Fecha de emisión del título',
    fecha_entrega DATE NULL COMMENT 'Fecha de entrega del título al estudiante',
    
    -- Autoridades que firman
    director_id INT NULL COMMENT 'Director que firma el título (referencia a usuarios)',
    secretario_id INT NULL COMMENT 'Secretario que firma el título (referencia a usuarios)',
    
    -- Documentos
    documento_titulo_id INT NULL COMMENT 'Documento digital del título (referencia a documentos_estudiante)',
    
    -- Observaciones
    observaciones TEXT NULL COMMENT 'Observaciones adicionales',
    motivo_anulacion TEXT NULL COMMENT 'Motivo de anulación (si estado = ANULADO)',
    
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
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (folio_estudiante_id) REFERENCES folio_estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (proyecto_grado_id) REFERENCES proyectos_grado(id) ON DELETE SET NULL,
    FOREIGN KEY (pasantia_id) REFERENCES pasantias(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_egreso_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (documento_titulo_id) REFERENCES documentos_estudiante(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_carrera_id (carrera_id) COMMENT 'Búsqueda por carrera',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_numero_titulo (numero_titulo) COMMENT 'Búsqueda por número de título',
    INDEX idx_fecha_emision (fecha_emision) COMMENT 'Búsqueda por fecha de emisión',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_carrera (estudiante_id, carrera_id, activo, deleted_at) COMMENT 'Búsqueda de títulos por estudiante y carrera',
    INDEX idx_gestion_egreso (gestion_egreso_id, activo, deleted_at) COMMENT 'Búsqueda de títulos por gestión de egreso'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Títulos emitidos a estudiantes. Registra la emisión, firma y entrega de títulos de Técnico Medio y Técnico Superior.';

-- ============================================
-- TABLA: certificados
-- ============================================

CREATE TABLE certificados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    estudiante_id INT NULL COMMENT 'Estudiante que recibe el certificado (referencia a estudiantes)',
    carrera_id INT NULL COMMENT 'Carrera del certificado (referencia a carreras, si aplica)',
    gestion_id INT NULL COMMENT 'Gestión del certificado (referencia a gestiones, si aplica)',
    
    -- Datos del certificado
    tipo_certificado ENUM(
        'CALIFICACIONES',
        'PASANTIA',
        'EGRESO',
        'TITULO_TRAMITE',
        'MATERIAS_APROBADAS',
        'OTRO'
    ) NOT NULL COMMENT 'Tipo de certificado',
    numero_certificado VARCHAR(100) NULL COMMENT 'Número de registro del certificado',
    descripcion TEXT NULL COMMENT 'Descripción del certificado',
    
    -- Estado del certificado
    estado ENUM('SOLICITADO', 'GENERADO', 'FIRMADO', 'ENTREGADO', 'ANULADO') DEFAULT 'SOLICITADO' 
        COMMENT 'Estado del certificado',
    
    -- Fechas importantes
    fecha_solicitud DATE NULL COMMENT 'Fecha de solicitud del certificado',
    fecha_generacion DATE NULL COMMENT 'Fecha de generación del certificado',
    fecha_firma DATE NULL COMMENT 'Fecha de firma del certificado',
    fecha_entrega DATE NULL COMMENT 'Fecha de entrega del certificado',
    
    -- Autoridades que firman
    firmado_por INT NULL COMMENT 'Usuario que firma el certificado (referencia a usuarios)',
    
    -- Documentos
    documento_certificado_id INT NULL COMMENT 'Documento digital del certificado (referencia a documentos_estudiante)',
    
    -- Observaciones
    observaciones TEXT NULL COMMENT 'Observaciones adicionales',
    motivo_anulacion TEXT NULL COMMENT 'Motivo de anulación (si estado = ANULADO)',
    
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
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (documento_certificado_id) REFERENCES documentos_estudiante(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_tipo_certificado (tipo_certificado) COMMENT 'Filtrado por tipo de certificado',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_numero_certificado (numero_certificado) COMMENT 'Búsqueda por número de certificado',
    INDEX idx_fecha_solicitud (fecha_solicitud) COMMENT 'Búsqueda por fecha de solicitud',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_tipo (estudiante_id, tipo_certificado, activo, deleted_at) COMMENT 'Búsqueda de certificados por estudiante y tipo',
    INDEX idx_gestion_tipo (gestion_id, tipo_certificado, activo, deleted_at) COMMENT 'Búsqueda de certificados por gestión y tipo'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Certificados académicos emitidos a estudiantes. Diferentes tipos de certificados para diferentes propósitos (calificaciones, pasantía, egreso, etc.).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
