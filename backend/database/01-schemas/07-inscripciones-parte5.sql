-- ============================================
-- MÓDULO DE INSCRIPCIONES - PARTE 5
-- Sistema de Gestión Académica - Instituto INCOS
-- 1 Tabla: bloqueos_inscripcion
-- ============================================
--
-- Esta parte contiene la tabla de bloqueos de inscripción.
-- Los bloqueos impiden a un estudiante inscribirse por diversas razones.
--
-- REGLAS DE NEGOCIO CRÍTICAS:
-- 1. Un estudiante con 2+ aplazos (REPROBADO) en una materia NO puede inscribirse en NINGUNA materia
--    hasta que apruebe todas sus nivelaciones pendientes
-- 2. Se crea automáticamente un bloqueo cuando hay nivelaciones pendientes (ver 07-inscripciones-logica.sql)
-- 3. El bloqueo impide inscribirse en CUALQUIER materia, no solo nuevas
-- 4. El bloqueo se resuelve automáticamente cuando se aprueban TODAS las nivelaciones
--
-- RELACIÓN CON OTRAS TABLAS:
-- - estudiantes: Estudiante bloqueado
-- - gestiones: Gestión en la que está bloqueado
-- - historial_nivelaciones: Nivelaciones que causan el bloqueo
-- - inscripciones: Inscripciones bloqueadas
--
-- NOTA: La lógica de negocio (triggers, stored procedures, vistas) se encuentra en:
-- 07-inscripciones-logica.sql
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS bloqueos_inscripcion;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: bloqueos_inscripcion
-- ============================================
-- Registra los bloqueos que impiden a un estudiante inscribirse.
-- Los bloqueos pueden ser por nivelaciones pendientes, documentos incompletos,
-- mora en pagos, o razones administrativas.
--
-- MOTIVOS DE BLOQUEO:
-- - NIVELACIONES_PENDIENTES: Tiene nivelaciones pendientes (automático cuando hay 2+ aplazos)
--   ⚠️ CRÍTICO: Este bloqueo impide inscribirse en TODAS las materias, no solo nuevas
-- - DOCUMENTOS_INCOMPLETOS: Faltan documentos requeridos
-- - MORA_PAGOS: Tiene pagos pendientes o en mora
-- - ADMINISTRATIVO: Bloqueo manual por razones administrativas
-- - PRERREQUISITOS: No cumple prerrequisitos de materias
-- - CHOQUE_HORARIO: Tiene choques de horario en materias inscritas
--
-- ESTADOS:
-- - ACTIVO: Bloqueo vigente, impide inscripción
-- - RESUELTO: Bloqueo resuelto, ya no impide inscripción
-- - ANULADO: Bloqueo anulado manualmente
--
-- FLUJO:
-- 1. Se crea un bloqueo (automático o manual)
-- 2. El estudiante no puede inscribirse mientras el bloqueo esté ACTIVO
-- 3. Se resuelve el bloqueo cuando se cumple el requisito
-- 4. El estudiante puede inscribirse nuevamente
-- ============================================

CREATE TABLE bloqueos_inscripcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante bloqueado (referencia a estudiantes)',
    gestion_id INT NOT NULL COMMENT 'Gestión en la que está bloqueado (referencia a gestiones)',
    motivo_bloqueo ENUM(
        'NIVELACIONES_PENDIENTES',
        'DOCUMENTOS_INCOMPLETOS',
        'MORA_PAGOS',
        'ADMINISTRATIVO',
        'PRERREQUISITOS',
        'CHOQUE_HORARIO',
        'OTRO'
    ) NOT NULL COMMENT 'Motivo del bloqueo',
    descripcion TEXT NOT NULL COMMENT 'Descripción detallada del motivo del bloqueo',
    estado_bloqueo ENUM('ACTIVO', 'RESUELTO', 'ANULADO') DEFAULT 'ACTIVO' COMMENT 'Estado del bloqueo',
    fecha_bloqueo TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha en que se creó el bloqueo',
    fecha_resolucion TIMESTAMP NULL COMMENT 'Fecha en que se resolvió el bloqueo',
    resuelto_por INT COMMENT 'Usuario que resolvió el bloqueo (referencia a usuarios)',
    motivo_anulacion TEXT COMMENT 'Motivo de anulación (si estado_bloqueo = ANULADO)',
    
    -- Relación con nivelación (si el bloqueo es por nivelaciones pendientes)
    nivelacion_id INT COMMENT 'Nivelación que causó el bloqueo (si motivo = NIVELACIONES_PENDIENTES, referencia a historial_nivelaciones)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (nivelacion_id) REFERENCES historial_nivelaciones(id) ON DELETE SET NULL,
    FOREIGN KEY (resuelto_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_motivo_bloqueo (motivo_bloqueo) COMMENT 'Filtrado por motivo',
    INDEX idx_estado_bloqueo (estado_bloqueo) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_activo (estudiante_id, estado_bloqueo, activo, deleted_at) COMMENT 'Búsqueda de bloqueos activos por estudiante',
    INDEX idx_gestion_estado (gestion_id, estado_bloqueo, activo, deleted_at) COMMENT 'Búsqueda de bloqueos por gestión y estado',
    INDEX idx_nivelacion_id (nivelacion_id) COMMENT 'Búsqueda por nivelación relacionada'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bloqueos de inscripción que impiden a un estudiante inscribirse. Se crean automáticamente por nivelaciones pendientes o manualmente por otras razones.';

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
