-- ============================================
-- ESTRUCTURA ACADÉMICA - HORARIOS
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: asignaciones_docentes, asignacion_horarios
-- ============================================
--
-- Módulo INST → Asignación docente + bloques horarios.
-- asignacion_horarios: bloques cuelgan del docente asignado, no del curso aislado.
-- Una ejecución crea ambas tablas en orden correcto.
--
-- Pre-requisitos (ejecutar antes de este archivo):
--   06-estructura-academica-parte2.sql  → docentes, horarios, aulas
--   07-estructura-academica-parte3.sql  → gestiones_planes
--   08-estructura-academica-oferta.sql → oferta_cursos
--
-- Seeders: primero asignaciones_docentes (31–39), después asignacion_horarios (40–48)
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

DROP TABLE IF EXISTS asignacion_horarios;
DROP TABLE IF EXISTS asignaciones_docentes;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================
-- IMPORTANTE: Orden de creación para resolver dependencias:
--   1. asignaciones_docentes  (depende de gestiones_planes, oferta_cursos, docentes)
--   2. asignacion_horarios    (depende de asignaciones_docentes, horarios, aulas)

-- ============================================
-- TABLA: asignaciones_docentes
-- Asignación de docentes a oferta de curso por plan habilitado
-- ============================================
-- Vincula QUÉ oferta se dicta EN QUÉ plan habilitado CON QUÉ docente.
-- La política de notas (cuotas, pesos, asistencia) vive solo en
-- configuracion_evaluacion (13-evaluaciones.sql). Esta tabla no parametriza notas.

CREATE TABLE asignaciones_docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    gestion_plan_id INT NULL COMMENT 'Plan habilitado en la gestión (gestiones_planes.id)',
    oferta_curso_id INT NULL COMMENT 'Oferta de curso a la que se asigna el docente',
    docente_id INT NULL COMMENT 'Docente asignado (NULL = pendiente de asignación)',

    -- Carga horaria
    carga_horaria INT NULL COMMENT 'Horas de docencia por semana (hereda de asignaturas_plan.horas_semanales si NULL)',

    -- Estado de la asignación
    fecha_asignacion DATE NULL COMMENT 'Fecha en que se asignó el docente',
    motivo TEXT COMMENT 'Motivo de cancelación o rechazo (solo si vigente = FALSE)',
    vigente BOOLEAN DEFAULT TRUE COMMENT 'Si la asignación está vigente (FALSE = cancelada o histórica)',

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
    FOREIGN KEY (oferta_curso_id) REFERENCES oferta_cursos(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,

    INDEX idx_gestion_plan_id (gestion_plan_id) COMMENT 'Búsqueda por plan habilitado',
    INDEX idx_oferta_curso_id (oferta_curso_id) COMMENT 'Búsqueda por oferta de curso',
    INDEX idx_docente_id (docente_id) COMMENT 'Búsqueda por docente',
    INDEX idx_vigente (vigente) COMMENT 'Filtrado por vigencia',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_gestion_plan_oferta (gestion_plan_id, oferta_curso_id, deleted_at) COMMENT 'Búsqueda por plan y oferta',
    INDEX idx_gestion_plan_docente (gestion_plan_id, docente_id, vigente, deleted_at) COMMENT 'Carga horaria del docente por gestión',
    INDEX idx_oferta_vigente (oferta_curso_id, vigente, deleted_at) COMMENT 'Asignaciones vigentes por oferta'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignación de docentes a oferta por plan habilitado. El docente puede ser NULL (pendiente).';

-- ============================================
-- TABLA: asignacion_horarios
-- Bloques horarios de una asignación docente
-- ============================================
-- Cada bloque indica en qué horario y aula dicta el docente esa oferta.
-- aula_id NULL = usa el aula base del paralelo_gestion padre.
-- horario_id 56-60 (SÁBADO, turno NULL en catálogo): extensión opcional para cubrir
-- carga_horaria cuando L-V del turno del paralelo no alcanza; TARDE y NOCHE comparten
-- los mismos slots de sábado. Validación de turno aplica solo a L-V (horarios.turno).

CREATE TABLE asignacion_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asignacion_docente_id INT NULL COMMENT 'Asignación docente (= docente + oferta_curso)',
    horario_id INT NULL COMMENT 'Bloque del calendario semanal (horarios.id)',
    aula_id INT NULL COMMENT 'Aula del bloque. NULL = usa aula base del paralelo_gestion.',
    orden_secuencia INT NOT NULL DEFAULT 1 COMMENT 'Orden cronológico durante la semana',

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

    FOREIGN KEY (asignacion_docente_id) REFERENCES asignaciones_docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE SET NULL,

    INDEX idx_asignacion_docente_id (asignacion_docente_id) COMMENT 'Búsqueda por asignación docente',
    INDEX idx_horario_id (horario_id) COMMENT 'Búsqueda por bloque horario',
    INDEX idx_aula_id (aula_id) COMMENT 'Búsqueda por aula',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_horario_aula (horario_id, aula_id, activo, deleted_at)
        COMMENT 'Detección conflicto aula (mismo horario + misma aula)',
    INDEX idx_asignacion_orden (asignacion_docente_id, orden_secuencia, activo, deleted_at)
        COMMENT 'Orden de bloques por asignación'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bloques horarios que cuelgan de la asignación docente.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
