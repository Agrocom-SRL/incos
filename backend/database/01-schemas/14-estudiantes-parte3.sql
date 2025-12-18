-- ============================================
-- ESTUDIANTES - PARTE 3
-- Sistema de Gestión Académica - Instituto INCOS
-- 1 Tabla: estados_especiales_estudiante
-- NORMALIZACIÓN: Estructura normalizada según 3FN
-- ============================================
--
-- NOTA: Esta tabla fue extraída de instituto_schema_ajustes_v2.sql
-- y normalizada según los estándares del proyecto.
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tabla si existe
DROP TABLE IF EXISTS estados_especiales_estudiante;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: estados_especiales_estudiante
-- ============================================
-- Registra estados especiales de estudiantes como:
-- - REPITENTE: Estudiante que repite un año/gestión
-- - TRANSITABILIDAD: Estudiante en proceso de transferencia/traspaso
-- - HOMOLOGACION: Estudiante con materias homologadas
-- - REINCORPORACION: Estudiante que se reincorpora después de ausencia
-- - COMPROMISO_PAGO: Estudiante con compromiso de pago pendiente
-- - CASO_ESPECIAL: Casos especiales que requieren seguimiento
-- - SUSPENSION_TEMPORAL: Estudiante suspendido temporalmente
-- ============================================

CREATE TABLE estados_especiales_estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    estudiante_id INT NULL COMMENT 'Estudiante (NULL permite flexibilidad en migraciones)',
    gestion_id INT NULL COMMENT 'Gestión en la que aplica el estado (NULL permite flexibilidad en migraciones)',
    
    -- Estado especial
    tipo_estado ENUM(
        'REPITENTE',
        'TRANSITABILIDAD',
        'HOMOLOGACION',
        'REINCORPORACION',
        'COMPROMISO_PAGO',
        'CASO_ESPECIAL',
        'SUSPENSION_TEMPORAL',
        'OTRO'
    ) NOT NULL COMMENT 'Tipo de estado especial del estudiante',
    
    -- Detalles
    descripcion TEXT COMMENT 'Descripción detallada del estado especial',
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio del estado',
    fecha_fin DATE COMMENT 'Fecha de fin del estado (NULL si está vigente)',
    documento_respaldo VARCHAR(255) COMMENT 'Ruta al documento de respaldo',
    
    -- Control
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    resuelto BOOLEAN DEFAULT FALSE COMMENT 'Indica si el estado especial ya fue resuelto',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_tipo_estado (tipo_estado) COMMENT 'Búsqueda por tipo de estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_resuelto (resuelto) COMMENT 'Filtrado por estado resuelto',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_activo (estudiante_id, activo, deleted_at) COMMENT 'Búsqueda de estados activos por estudiante',
    INDEX idx_gestion_activo (gestion_id, activo, deleted_at) COMMENT 'Búsqueda de estados activos por gestión',
    INDEX idx_fechas (fecha_inicio, fecha_fin) COMMENT 'Búsqueda por rango de fechas',
    
    CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Estados especiales de estudiantes (repitente, transitabilidad, homologación, reincorporación, compromiso de pago, casos especiales, suspensión temporal). Permite registrar y hacer seguimiento de situaciones especiales que requieren atención.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Estudiantes - Parte 3 creada (1 tabla: estados_especiales_estudiante)' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME = 'estados_especiales_estudiante';
