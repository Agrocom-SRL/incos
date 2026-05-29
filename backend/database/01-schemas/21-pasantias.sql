-- ============================================
-- MÓDULO DE PASANTÍAS
-- Sistema de Gestión Académica - Instituto INCOS
-- 3 Tablas: pasantias_empresas, pasantias_asignaciones, pasantias_evaluaciones
-- NORMALIZACIÓN: Estructura normalizada según 3FN
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS pasantias_evaluaciones;
DROP TABLE IF EXISTS pasantias_asignaciones;
DROP TABLE IF EXISTS pasantias_empresas;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: pasantias_empresas
-- Catálogo de empresas para pasantías laborales (240 horas obligatorias)
-- ============================================

CREATE TABLE pasantias_empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Datos de la empresa
    nombre_empresa VARCHAR(200) NOT NULL COMMENT 'Nombre comercial',
    razon_social VARCHAR(200) COMMENT 'Razón social legal',
    nit VARCHAR(20) COMMENT 'NIT de la empresa',
    
    -- Contacto
    direccion TEXT COMMENT 'Dirección física de la empresa',
    telefono VARCHAR(50) COMMENT 'Teléfono fijo',
    celular VARCHAR(50) COMMENT 'Celular de contacto',
    email VARCHAR(150) COMMENT 'Correo electrónico',
    sitio_web VARCHAR(200) COMMENT 'Sitio web de la empresa',
    
    -- Clasificación
    sector ENUM('PUBLICO', 'PRIVADO', 'ONG', 'COOPERATIVA', 'OTRO') DEFAULT 'PRIVADO' COMMENT 'Sector de la empresa',
    rubro VARCHAR(100) COMMENT 'Rubro o actividad (Contabilidad, Finanzas, Tecnología, Comercio, etc.)',
    tamano_empresa ENUM('MICRO', 'PEQUEÑA', 'MEDIANA', 'GRANDE') COMMENT 'Tamaño de la empresa',
    
    -- Contacto institucional
    contacto_nombre VARCHAR(150) COMMENT 'Persona de contacto',
    contacto_cargo VARCHAR(100) COMMENT 'Cargo del contacto',
    contacto_telefono VARCHAR(50) COMMENT 'Teléfono del contacto',
    contacto_email VARCHAR(150) COMMENT 'Email del contacto',
    
    -- Estado
    activa_convenio BOOLEAN DEFAULT TRUE COMMENT 'Empresa tiene convenio activo',
    fecha_inicio_convenio DATE COMMENT 'Fecha de inicio del convenio',
    fecha_fin_convenio DATE COMMENT 'Fecha de fin del convenio',
    
    -- Capacidad
    capacidad_pasantes INT DEFAULT 1 COMMENT 'Capacidad de pasantes simultáneos',
    
    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones generales sobre la empresa',
    
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
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_activa_convenio (activa_convenio) COMMENT 'Filtrado por convenio activo',
    INDEX idx_sector (sector) COMMENT 'Filtrado por sector',
    INDEX idx_nombre_empresa (nombre_empresa) COMMENT 'Búsqueda por nombre de empresa'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de empresas para pasantías laborales (240 horas)';

-- ============================================
-- TABLA: pasantias_asignaciones
-- Asignaciones de estudiantes a pasantías (240 horas obligatorias)
-- ============================================

CREATE TABLE pasantias_asignaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    estudiante_id INT NULL COMMENT 'Estudiante pasante (referencia a estudiantes)',
    empresa_id INT NULL COMMENT 'Empresa donde realizará la pasantía (referencia a pasantias_empresas)',
    carrera_id INT NULL COMMENT 'Carrera del estudiante (referencia a carreras)',
    gestion_id INT NULL COMMENT 'Gestión académica (referencia a gestiones)',
    
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
    estado ENUM('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA', 'SUSPENDIDA') DEFAULT 'PROGRAMADA' COMMENT 'Estado de la asignación de pasantía',
    motivo_cancelacion TEXT COMMENT 'Motivo de cancelación (si estado = CANCELADA)',
    fecha_cancelacion DATE COMMENT 'Fecha de cancelación (si aplica)',
    
    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones sobre la asignación',
    
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
    FOREIGN KEY (empresa_id) REFERENCES pasantias_empresas(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_supervisor_id) REFERENCES docentes(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_empresa_id (empresa_id) COMMENT 'Búsqueda por empresa',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_docente_supervisor_id (docente_supervisor_id) COMMENT 'Búsqueda por docente supervisor'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignaciones de estudiantes a pasantías (240 horas obligatorias)';

-- ============================================
-- TABLA: pasantias_evaluaciones
-- Evaluaciones de desempeño en pasantías (sistema ALTO/MEDIO/BAJO)
-- ============================================

CREATE TABLE pasantias_evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relación
    asignacion_id INT NULL COMMENT 'Asignación de pasantía (referencia a pasantias_asignaciones)',
    
    -- Datos de evaluación
    fecha_evaluacion DATE NOT NULL COMMENT 'Fecha de la evaluación',
    periodo_evaluacion VARCHAR(100) COMMENT 'Periodo de evaluación (Inicio, Intermedio, Final)',
    
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
    cargo_evaluador VARCHAR(100) COMMENT 'Cargo del evaluador',
    
    -- Firmas digitales
    firma_docente_url VARCHAR(255) COMMENT 'URL de firma del docente supervisor',
    firma_empresa_url VARCHAR(255) COMMENT 'URL de firma del supervisor de empresa',
    
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
    
    FOREIGN KEY (asignacion_id) REFERENCES pasantias_asignaciones(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_asignacion_id (asignacion_id) COMMENT 'Búsqueda por asignación',
    INDEX idx_nivel_desempeno (nivel_desempeno) COMMENT 'Filtrado por nivel de desempeño',
    INDEX idx_fecha_evaluacion (fecha_evaluacion) COMMENT 'Búsqueda por fecha de evaluación'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Evaluaciones de desempeño en pasantías (ALTO/MEDIO/BAJO)';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

SELECT 'Módulo de pasantías creado (3 tablas: pasantias_empresas, pasantias_asignaciones, pasantias_evaluaciones)' as mensaje;
