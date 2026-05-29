-- ============================================
-- ESTRUCTURA ACADÉMICA - OFERTA (V2)
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: paralelos_gestion, oferta_cursos
-- ============================================
--
-- Módulo INST → Oferta Académica (Sprint 3 del plan V2).
-- Reemplaza la tabla legacy `cursos`. Una ejecución crea ambas tablas en orden
-- correcto de dependencias, sin riesgo de ejecutar una sin la otra.
--
-- Pre-requisitos (ejecutar antes de este archivo):
--   05-estructura-academica-parte1.sql  → asignaturas_plan, planes_estudios
--   06-estructura-academica-parte2.sql  → paralelos, aulas
--   07-estructura-academica-parte3.sql  → gestiones_planes
--
-- Siguiente archivo: 09-estructura-academica-horarios.sql
-- Requerido por: 13-inscripciones.sql (matriculas_materia.oferta_curso_id)
--
-- RESTRICCIONES DE DISEÑO:
--   - Todas las FKs permiten NULL
--   - Todas las FKs usan ON DELETE SET NULL
--   - Ninguna restricción UNIQUE
--   - Ninguna validación CHECK dentro del schema (validación en aplicación)
--   - Auditoría estándar idéntica en todas las tablas
--   - Índices solo en propiedades clave de búsqueda y FKs
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS oferta_cursos;
DROP TABLE IF EXISTS paralelos_gestion;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================
-- IMPORTANTE: Orden de creación para resolver dependencias:
--   1. paralelos_gestion  (depende de gestiones_planes, paralelos, aulas)
--   2. oferta_cursos      (depende de paralelos_gestion, asignaturas_plan)

-- ============================================
-- TABLA: paralelos_gestion
-- Instancia de un paralelo maestro en una gestión específica
-- ============================================
-- El paralelo maestro (paralelos) es reutilizable cada año. Este registro fija
-- turno efectivo, aula base, cupos y estado para UNA gestión concreta.
-- Padre de oferta_cursos.

CREATE TABLE paralelos_gestion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gestion_plan_id INT NULL COMMENT 'Plan habilitado en la gestión (gestiones_planes.id)',
    paralelo_id INT NULL COMMENT 'Paralelo maestro reutilizable (paralelos.id)',
    aula_id INT NULL COMMENT 'Aula base por defecto. Casi inmutable durante la gestión.',
    turno ENUM('MAÑANA', 'TARDE', 'NOCHE') NOT NULL COMMENT 'Turno efectivo. Si difiere del paralelo maestro, la app reasigna bloques.',

    estado ENUM('BORRADOR', 'OFERTADO', 'PUBLICADO', 'CERRADO') DEFAULT 'BORRADOR'
        COMMENT 'BORRADOR: en armado. OFERTADO: lista para matrícula. PUBLICADO: con horario completo. CERRADO: gestión finalizada.',
    cupo_maximo INT DEFAULT 35 COMMENT 'Cupo máximo del paralelo en esta gestión',
    cupo_minimo INT DEFAULT 10 COMMENT 'Cupo mínimo del paralelo en esta gestión',
    observaciones TEXT COMMENT 'Observaciones de la instancia en gestión',

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

    FOREIGN KEY (gestion_plan_id) REFERENCES gestiones_planes(id) ON DELETE SET NULL,
    FOREIGN KEY (paralelo_id) REFERENCES paralelos(id) ON DELETE SET NULL,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE SET NULL,

    INDEX idx_gestion_plan_id (gestion_plan_id) COMMENT 'Búsqueda por plan habilitado',
    INDEX idx_paralelo_id (paralelo_id) COMMENT 'Búsqueda por paralelo maestro',
    INDEX idx_aula_id (aula_id) COMMENT 'Búsqueda por aula base',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado de oferta',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_gestion_paralelo (gestion_plan_id, paralelo_id, activo, deleted_at)
        COMMENT 'Búsqueda principal: paralelos de una gestión'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Instancia de un paralelo en una gestión específica. Padre de oferta_cursos.';

-- ============================================
-- TABLA: oferta_cursos
-- Materia ofertada en un paralelo-gestión (reemplaza cursos V1)
-- ============================================
-- Cada fila es una asignatura del plan ofertada en un paralelo concreto de la
-- gestión. El color del docente y los cupos viven en docentes / paralelos_gestion,
-- no en esta tabla.

CREATE TABLE oferta_cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paralelo_gestion_id INT NULL COMMENT 'Paralelo en su gestión (paralelos_gestion.id)',
    asignatura_plan_id INT NULL COMMENT 'Asignatura del plan (materia + periodo + horas_semanales)',

    estado ENUM('PROGRAMADA', 'ACTIVA', 'CERRADA', 'CANCELADA') DEFAULT 'PROGRAMADA'
        COMMENT 'Estado de la oferta en la gestión',
    observaciones TEXT COMMENT 'Observaciones de la oferta',

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

    FOREIGN KEY (paralelo_gestion_id) REFERENCES paralelos_gestion(id) ON DELETE SET NULL,
    FOREIGN KEY (asignatura_plan_id) REFERENCES asignaturas_plan(id) ON DELETE SET NULL,

    INDEX idx_paralelo_gestion_id (paralelo_gestion_id) COMMENT 'Búsqueda por paralelo-gestión',
    INDEX idx_asignatura_plan_id (asignatura_plan_id) COMMENT 'Búsqueda por asignatura del plan',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_paralelo_asignatura (paralelo_gestion_id, asignatura_plan_id, activo, deleted_at)
        COMMENT 'Búsqueda principal: oferta de un paralelo'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Reemplaza cursos. Materia ofertada en un paralelo-gestión específico.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
