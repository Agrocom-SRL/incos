-- ============================================
-- ESTRUCTURA ACADÉMICA - PARTE 1
-- Sistema de Gestión Académica - Instituto INCOS
-- 5 Tablas: carreras, periodos, materias, plan_estudios, prerrequisitos
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS prerrequisitos;
DROP TABLE IF EXISTS plan_estudios;
DROP TABLE IF EXISTS materias;
DROP TABLE IF EXISTS periodos;
DROP TABLE IF EXISTS carreras;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: carreras
-- ============================================

CREATE TABLE carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL COMMENT 'Código de la carrera',
    nombre VARCHAR(150) NOT NULL COMMENT 'Nombre de la carrera',
    descripcion TEXT COMMENT 'Descripción de la carrera',
    duracion_anios INT NOT NULL DEFAULT 4 COMMENT 'Duración en años académicos',
    titulo_otorgado VARCHAR(200) COMMENT 'Título otorgado',
    resolucion_ministerial VARCHAR(100) COMMENT 'Resolución ministerial',
    fecha_vigencia DATE COMMENT 'Fecha desde que está vigente',
    carga_horaria_total INT COMMENT 'Carga horaria total de la carrera',
    color_hex VARCHAR(7) COMMENT 'Color para UI',
    
    -- Imagen de la carrera (para dashboard/tarjetas)
    imagen_nombre VARCHAR(255) COMMENT 'Nombre del archivo de imagen',
    imagen_ruta VARCHAR(500) COMMENT 'Ruta del archivo de imagen en el servidor',
    imagen_url VARCHAR(500) COMMENT 'URL completa de la imagen (puede ser externa o del servidor)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Carreras del instituto';

-- ============================================
-- TABLA: periodos
-- ============================================
-- IMPORTANTE: Los "periodos" son SEMESTRES/AÑOS de la CARRERA (1º, 2º, 3º, 4º)
-- NO son periodos académicos temporales de la gestión (eso es periodos_academicos en parte 3)
-- 
-- Ejemplo:
--   - Carrera "Contaduría" tiene 4 periodos: 1º Semestre, 2º Semestre, 3º Semestre, 4º Semestre
--   - Estos periodos definen qué materias se ven en cada semestre del plan de estudios
--   - Un estudiante en "1º Semestre" cursa las materias del periodo 1 de su carrera
--
-- Para periodos académicos temporales de gestión (planificación, bimestres, clausura, etc.)
-- ver tabla: periodos_academicos en 05-estructura-academica-parte3.sql

CREATE TABLE periodos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrera_id INT NULL COMMENT 'Carrera a la que pertenece (NULL permite flexibilidad en migraciones)',
    nombre VARCHAR(50) NOT NULL COMMENT 'Nombre del periodo (ej: 1º Semestre, 2º Semestre)',
    numero INT NOT NULL COMMENT 'Número del periodo (1, 2, 3, 4...)',
    orden_visualizacion INT NOT NULL DEFAULT 1 COMMENT 'Orden de visualización',
    descripcion TEXT COMMENT 'Descripción del periodo',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_carrera_id (carrera_id) COMMENT 'Búsqueda por carrera',
    INDEX idx_numero (numero) COMMENT 'Búsqueda por número',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_carrera_numero (carrera_id, numero, activo, deleted_at) COMMENT 'Búsqueda por carrera y número de periodo',
    INDEX idx_carrera_activo (carrera_id, activo, deleted_at) COMMENT 'Búsqueda de periodos activos por carrera'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Periodos académicos de la carrera (semestres/años: 1º, 2º, 3º, 4º). Define el plan de estudios. NO confundir con etapas temporales de gestión.';

-- ============================================
-- TABLA: materias
-- ============================================

CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL COMMENT 'Código de la materia',
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre de la materia',
    nombre_corto VARCHAR(100) COMMENT 'Nombre abreviado',
    descripcion TEXT COMMENT 'Descripción de la materia',
    carga_horaria_teorica INT NOT NULL DEFAULT 0 COMMENT 'Horas teóricas totales (no semanales)',
    carga_horaria_practica INT NOT NULL DEFAULT 0 COMMENT 'Horas prácticas totales (no semanales)',
    carga_horaria_total INT GENERATED ALWAYS AS (carga_horaria_teorica + carga_horaria_practica) STORED COMMENT 'Carga horaria total (suma de teórica + práctica)',
    creditos DECIMAL(4,2) COMMENT 'Créditos académicos',
    tipo ENUM('TEORICA', 'PRACTICA', 'TEORICA_PRACTICA') DEFAULT 'TEORICA_PRACTICA' COMMENT 'Tipo de materia según su naturaleza',
    area_conocimiento VARCHAR(100) COMMENT 'Área de conocimiento (ej: Contabilidad, Administración, Informática). Puede ser específica por carrera',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código',
    INDEX idx_tipo (tipo) COMMENT 'Filtrado por tipo',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_area_conocimiento (area_conocimiento) COMMENT 'Búsqueda por área de conocimiento',
    INDEX idx_codigo_activo (codigo, activo, deleted_at) COMMENT 'Búsqueda por código y estado',
    
    CHECK (carga_horaria_teorica >= 0),
    CHECK (carga_horaria_practica >= 0)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Materias/asignaturas del instituto';

-- ============================================
-- TABLA: plan_estudios
-- ============================================

CREATE TABLE plan_estudios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrera_id INT NULL COMMENT 'Carrera (NULL permite flexibilidad en migraciones)',
    periodo_id INT NULL COMMENT 'Periodo (NULL permite flexibilidad en migraciones)',
    materia_id INT NULL COMMENT 'Materia (NULL permite flexibilidad en migraciones)',
    orden_visualizacion INT NOT NULL DEFAULT 1 COMMENT 'Orden de visualización en el plan',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_carrera_id (carrera_id) COMMENT 'Búsqueda por carrera',
    INDEX idx_periodo_id (periodo_id) COMMENT 'Búsqueda por periodo',
    INDEX idx_materia_id (materia_id) COMMENT 'Búsqueda por materia',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_carrera_periodo (carrera_id, periodo_id, activo, deleted_at) COMMENT 'Búsqueda por carrera y periodo',
    INDEX idx_carrera_materia (carrera_id, materia_id, activo, deleted_at) COMMENT 'Búsqueda por carrera y materia',
    INDEX idx_periodo_materia (periodo_id, materia_id, activo, deleted_at) COMMENT 'Búsqueda por periodo y materia',
    INDEX idx_carrera_periodo_materia (carrera_id, periodo_id, materia_id, activo, deleted_at) COMMENT 'Búsqueda completa por carrera, periodo y materia'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Plan de estudios: relación entre carrera × periodo × materia. Define qué materias se cursan en cada periodo de cada carrera. carrera_id es redundancia controlada para acceso rápido.';

-- ============================================
-- TABLA: prerrequisitos
-- ============================================
-- Prerrequisitos de materias: define qué materias deben aprobarse antes de inscribirse a otra
-- Relacionado con el plan de estudios, por eso está en parte 1
-- IMPORTANTE: Si es prerrequisito, es obligatorio por definición. Las materias del periodo N
-- tienen prerrequisitos de materias del periodo N-1 (o anteriores) que figuran en plan_estudios

CREATE TABLE prerrequisitos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT NULL COMMENT 'Materia que tiene el prerrequisito (ej: materia del periodo 2) (NULL permite flexibilidad en migraciones)',
    materia_prerrequisito_id INT NULL COMMENT 'Materia que debe aprobarse antes (ej: materia del periodo 1) (NULL permite flexibilidad en migraciones)',
    descripcion TEXT COMMENT 'Descripción adicional del prerrequisito',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_prerrequisito_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_materia_id (materia_id) COMMENT 'Búsqueda por materia',
    INDEX idx_materia_prerrequisito_id (materia_prerrequisito_id) COMMENT 'Búsqueda por materia prerrequisito',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_materia_activo (materia_id, activo, deleted_at) COMMENT 'Búsqueda de prerrequisitos activos por materia',
    INDEX idx_prerrequisito_activo (materia_prerrequisito_id, activo, deleted_at) COMMENT 'Búsqueda de materias que requieren este prerrequisito'
    
    -- NOTA: La validación de que materia_id != materia_prerrequisito_id debe hacerse a nivel de aplicación
    -- MySQL no permite CHECK constraints en columnas con foreign keys ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Prerrequisitos de materias: define qué materias deben aprobarse antes de inscribirse a otra. Si es prerrequisito, es obligatorio por definición.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
