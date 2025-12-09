-- ============================================
-- ESTRUCTURA ACADÉMICA - PARTE 1
-- Sistema de Gestión Académica - Instituto INCOS
-- 10 Tablas: carreras, gestiones, periodos, materias, plan_estudios,
--            prerrequisitos, cursos, docentes, asignaciones_docentes, turnos_cursos
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLA: carreras
-- ============================================

DROP TABLE IF EXISTS carreras;

CREATE TABLE carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE COMMENT 'CONT, ADM, SIS',
    nombre VARCHAR(150) NOT NULL COMMENT 'Contaduría General, Administración de Empresas, Sistemas Informáticos',
    descripcion TEXT COMMENT 'Descripción de la carrera',
    duracion_semestres INT NOT NULL DEFAULT 4 COMMENT 'Duración en semestres (4 = 2 años)',
    titulo_otorgado VARCHAR(200) COMMENT 'Técnico Superior en...',
    resolucion_ministerial VARCHAR(100) COMMENT 'R.M. 0426/2016',
    fecha_vigencia DATE COMMENT 'Fecha desde que está vigente',
    carga_horaria_total INT COMMENT 'Carga horaria total de la carrera',
    color_hex VARCHAR(7) COMMENT 'Color para UI (#FF5733)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys de auditoría
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_codigo (codigo)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Carreras del instituto (Contaduría, Administración, Sistemas)';

-- ============================================
-- TABLA: gestiones
-- ============================================

DROP TABLE IF EXISTS gestiones;

CREATE TABLE gestiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE COMMENT '2025-1, 2025-2, 2026-1',
    anio INT NOT NULL COMMENT '2025, 2026, 2027',
    periodo ENUM('1', '2') NOT NULL COMMENT 'Primer o segundo semestre',
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio del semestre',
    fecha_fin DATE NOT NULL COMMENT 'Fecha de fin del semestre',
    estado ENUM('PLANIFICACION', 'INSCRIPCION_ABIERTA', 'EN_CURSO', 'FINALIZADA', 'CERRADA') DEFAULT 'PLANIFICACION',
    
    -- Fechas importantes del semestre
    fecha_inicio_inscripciones DATE COMMENT 'Inicio del período de inscripciones',
    fecha_fin_inscripciones DATE COMMENT 'Fin del período de inscripciones',
    fecha_inicio_clases DATE COMMENT 'Inicio de clases',
    fecha_fin_clases DATE COMMENT 'Fin de clases',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys de auditoría
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    UNIQUE KEY unique_anio_periodo (anio, periodo, deleted_at),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_estado (estado),
    INDEX idx_anio (anio)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Gestiones académicas (semestres)';

-- ============================================
-- TABLA: periodos
-- ============================================

DROP TABLE IF EXISTS periodos;

CREATE TABLE periodos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrera_id INT NOT NULL COMMENT 'Carrera a la que pertenece',
    nombre VARCHAR(50) NOT NULL COMMENT '1º Semestre, 2º Semestre, 3º Semestre, 4º Semestre',
    numero INT NOT NULL COMMENT '1, 2, 3, 4',
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
    
    -- Foreign Keys
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    UNIQUE KEY unique_carrera_numero (carrera_id, numero, deleted_at),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_carrera_id (carrera_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Periodos académicos por carrera (1º, 2º, 3º, 4º semestre)';

-- ============================================
-- TABLA: materias
-- ============================================

DROP TABLE IF EXISTS materias;

CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE COMMENT 'CONT-101, ADM-201, SIS-301',
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre de la materia',
    nombre_corto VARCHAR(100) COMMENT 'Nombre abreviado',
    descripcion TEXT COMMENT 'Descripción de la materia',
    
    -- Carga horaria
    carga_horaria_teorica INT NOT NULL DEFAULT 0 COMMENT 'Horas teóricas semanales',
    carga_horaria_practica INT NOT NULL DEFAULT 0 COMMENT 'Horas prácticas semanales',
    carga_horaria_total INT GENERATED ALWAYS AS (carga_horaria_teorica + carga_horaria_practica) STORED,
    creditos DECIMAL(4,2) COMMENT 'Créditos académicos',
    
    -- Clasificación
    tipo ENUM('TEORICA', 'PRACTICA', 'TEORICA_PRACTICA') DEFAULT 'TEORICA_PRACTICA',
    area_conocimiento VARCHAR(100) COMMENT 'Contabilidad, Finanzas, Programación, etc.',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys de auditoría
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_codigo (codigo),
    INDEX idx_tipo (tipo),
    
    -- Constraints
    CHECK (carga_horaria_teorica >= 0),
    CHECK (carga_horaria_practica >= 0)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Materias/asignaturas del instituto';

-- ============================================
-- TABLA: plan_estudios
-- ============================================

DROP TABLE IF EXISTS plan_estudios;

CREATE TABLE plan_estudios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrera_id INT NOT NULL COMMENT 'Carrera',
    periodo_id INT NOT NULL COMMENT 'Periodo (1º, 2º, 3º, 4º semestre)',
    materia_id INT NOT NULL COMMENT 'Materia',
    es_obligatoria BOOLEAN DEFAULT TRUE COMMENT 'Materia obligatoria u optativa',
    orden_visualizacion INT NOT NULL DEFAULT 1 COMMENT 'Orden de visualización en el plan',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT,
    FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE RESTRICT,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    UNIQUE KEY unique_carrera_periodo_materia (carrera_id, periodo_id, materia_id, deleted_at),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_carrera_id (carrera_id),
    INDEX idx_periodo_id (periodo_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Plan de estudios por carrera y periodo';

-- ============================================
-- VERIFICACIÓN PARCIAL
-- ============================================

SELECT 'Estructura académica - Parte 1/2 creada (5 tablas)' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME IN ('carreras', 'gestiones', 'periodos', 'materias', 'plan_estudios')
ORDER BY TABLE_NAME;

-- Continuar con 05-estructura-academica-parte2.sql

-- ============================================
-- FIN DE LA PARTE 1
-- ============================================
