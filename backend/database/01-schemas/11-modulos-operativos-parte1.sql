-- ============================================
-- MÓDULOS OPERATIVOS - PARTE 1
-- Sistema de Gestión Académica - Instituto INCOS
-- 5 Tablas: pasantias_empresas, pasantias_asignaciones, pasantias_evaluaciones,
--           supervisiones_programadas, fichas_supervision
-- NORMALIZACIÓN: Estructura normalizada según 3FN
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLA: pasantias_empresas
-- ============================================

DROP TABLE IF EXISTS pasantias_empresas;

CREATE TABLE pasantias_empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Datos de la empresa
    nombre_empresa VARCHAR(200) NOT NULL COMMENT 'Nombre comercial',
    razon_social VARCHAR(200) COMMENT 'Razón social legal',
    nit VARCHAR(20) COMMENT 'NIT de la empresa',
    
    -- Contacto
    direccion TEXT,
    telefono VARCHAR(50),
    celular VARCHAR(50),
    email VARCHAR(150),
    sitio_web VARCHAR(200),
    
    -- Clasificación
    sector ENUM('PUBLICO', 'PRIVADO', 'ONG', 'COOPERATIVA', 'OTRO') DEFAULT 'PRIVADO',
    rubro VARCHAR(100) COMMENT 'Contabilidad, Finanzas, Tecnología, Comercio, etc.',
    tamano_empresa ENUM('MICRO', 'PEQUEÑA', 'MEDIANA', 'GRANDE') COMMENT 'Tamaño de la empresa',
    
    -- Contacto institucional
    contacto_nombre VARCHAR(150) COMMENT 'Persona de contacto',
    contacto_cargo VARCHAR(100),
    contacto_telefono VARCHAR(50),
    contacto_email VARCHAR(150),
    
    -- Estado
    activa_convenio BOOLEAN DEFAULT TRUE COMMENT 'Empresa tiene convenio activo',
    fecha_inicio_convenio DATE,
    fecha_fin_convenio DATE,
    
    -- Capacidad
    capacidad_pasantes INT DEFAULT 1 COMMENT 'Capacidad de pasantes simultáneos',
    
    -- Observaciones
    observaciones TEXT,
    
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
    INDEX idx_activa_convenio (activa_convenio),
    INDEX idx_sector (sector),
    INDEX idx_nombre_empresa (nombre_empresa)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de empresas para pasantías laborales (240 horas)';

-- ============================================
-- TABLA: pasantias_asignaciones
-- ============================================

DROP TABLE IF EXISTS pasantias_asignaciones;

CREATE TABLE pasantias_asignaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    estudiante_id INT NOT NULL COMMENT 'Estudiante pasante',
    empresa_id INT NOT NULL COMMENT 'Empresa donde realizará la pasantía',
    carrera_id INT NOT NULL COMMENT 'Carrera del estudiante',
    gestion_id INT NOT NULL COMMENT 'Gestión académica',
    
    -- Detalles del puesto
    area_departamento VARCHAR(150) COMMENT 'Área o departamento de la empresa',
    cargo_puesto VARCHAR(100) COMMENT 'Cargo o puesto asignado',
    descripcion_actividades TEXT COMMENT 'Descripción de actividades a realizar',
    
    -- Fechas
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio de la pasantía',
    fecha_finalizacion DATE COMMENT 'Fecha de finalización',
    duracion_dias INT COMMENT 'Duración en días',
    horas_cumplidas INT DEFAULT 0 COMMENT 'Horas cumplidas (de 240 requeridas)',
    horas_requeridas INT DEFAULT 240 COMMENT 'Horas totales requeridas',
    
    -- Responsable en la empresa
    responsable_empresa VARCHAR(150) COMMENT 'Supervisor en la empresa',
    cargo_responsable VARCHAR(100),
    telefono_responsable VARCHAR(50),
    email_responsable VARCHAR(150),
    
    -- Docente supervisor INCOS
    docente_supervisor_id INT COMMENT 'Docente del INCOS que supervisa',
    
    -- Estado
    estado ENUM('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA', 'SUSPENDIDA') DEFAULT 'PROGRAMADA',
    motivo_cancelacion TEXT,
    fecha_cancelacion DATE,
    
    -- Observaciones
    observaciones TEXT,
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (empresa_id) REFERENCES pasantias_empresas(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_supervisor_id) REFERENCES docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_estudiante_id (estudiante_id),
    INDEX idx_empresa_id (empresa_id),
    INDEX idx_estado (estado),
    INDEX idx_gestion_id (gestion_id),
    INDEX idx_docente_supervisor_id (docente_supervisor_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignaciones de estudiantes a pasantías (240 horas obligatorias)';

-- ============================================
-- TABLA: pasantias_evaluaciones
-- ============================================

DROP TABLE IF EXISTS pasantias_evaluaciones;

CREATE TABLE pasantias_evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relación
    asignacion_id INT NOT NULL COMMENT 'Asignación de pasantía',
    
    -- Datos de evaluación
    fecha_evaluacion DATE NOT NULL COMMENT 'Fecha de la evaluación',
    periodo_evaluacion VARCHAR(100) COMMENT 'Inicio, Intermedio, Final',
    
    -- Descripción del trabajo
    descripcion_trabajo TEXT COMMENT 'Descripción del trabajo realizado',
    principales_actividades TEXT COMMENT 'Principales actividades desarrolladas',
    logros_obtenidos TEXT COMMENT 'Logros y resultados',
    
    -- Evaluación de desempeño (sistema INCOS: ALTO, MEDIO, BAJO)
    nivel_desempeno ENUM('ALTO', 'MEDIO', 'BAJO') NOT NULL COMMENT 'Nivel de desempeño',
    puntualidad ENUM('ALTO', 'MEDIO', 'BAJO') COMMENT 'Evaluación de puntualidad',
    responsabilidad ENUM('ALTO', 'MEDIO', 'BAJO') COMMENT 'Evaluación de responsabilidad',
    trabajo_equipo ENUM('ALTO', 'MEDIO', 'BAJO') COMMENT 'Trabajo en equipo',
    iniciativa ENUM('ALTO', 'MEDIO', 'BAJO') COMMENT 'Iniciativa',
    calidad_trabajo ENUM('ALTO', 'MEDIO', 'BAJO') COMMENT 'Calidad del trabajo',
    
    -- Retroalimentación
    fortalezas TEXT COMMENT 'Fortalezas observadas',
    areas_mejorar TEXT COMMENT 'Áreas de mejora',
    sugerencias TEXT COMMENT 'Sugerencias y recomendaciones',
    
    -- Evaluador
    evaluado_por VARCHAR(150) COMMENT 'Nombre del evaluador',
    cargo_evaluador VARCHAR(100),
    
    -- Firmas digitales
    firma_docente_url VARCHAR(255) COMMENT 'URL de firma del docente supervisor',
    firma_empresa_url VARCHAR(255) COMMENT 'URL de firma del supervisor de empresa',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (asignacion_id) REFERENCES pasantias_asignaciones(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_asignacion_id (asignacion_id),
    INDEX idx_nivel_desempeno (nivel_desempeno),
    INDEX idx_fecha_evaluacion (fecha_evaluacion)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Evaluaciones de desempeño en pasantías (ALTO/MEDIO/BAJO)';

-- Continuar en parte 2...

SELECT 'Módulos operativos - Parte 1 creada (3 tablas: pasantías)' as mensaje;
