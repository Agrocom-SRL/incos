-- ============================================
-- ESTRUCTURA ACADÉMICA - PARTE 1
-- Sistema de Gestión Académica - Instituto INCOS
-- 6 Tablas: carreras, materias, planes_estudios, periodos, asignaturas_plan, prerrequisitos
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS prerrequisitos;
DROP TABLE IF EXISTS asignaturas_plan;
DROP TABLE IF EXISTS periodos;
DROP TABLE IF EXISTS planes_estudios;
DROP TABLE IF EXISTS materias;
DROP TABLE IF EXISTS carreras;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: carreras
-- Catálogo de carreras del instituto
-- ============================================

CREATE TABLE carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL COMMENT 'Código de la carrera (ej: SIS-INF, ADM-EMP, CON-GEN)',
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre completo de la carrera',
    
    -- Información académica
    descripcion TEXT COMMENT 'Descripción del perfil profesional de la carrera',
    area_formacion VARCHAR(150) COMMENT 'Área de formación (ej: COMERCIAL Y SERVICIOS, TECNOLOGÍA, SALUD)',
    titulo_otorgado VARCHAR(250) COMMENT 'Título profesional que otorga (ej: Técnico Superior en Sistemas Informáticos)',
    
    -- Recursos visuales para UI
    color_hex VARCHAR(7) COMMENT 'Color identificador en formato hexadecimal (ej: #FF5733) para dashboards y tarjetas',
    imagen_ruta VARCHAR(500) COMMENT 'Ruta relativa de la imagen (ej: /uploads/carreras/1_SIS-INF.webp) o URL completa si es externa',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si la carrera está activa y aceptando inscripciones',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica (soft delete)',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    -- Índices para optimización
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda rápida por código de carrera',
    INDEX idx_activo (activo) COMMENT 'Filtrado de carreras activas',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de registros no eliminados (soft delete)',
    INDEX idx_codigo_activo (codigo, activo, deleted_at) COMMENT 'Búsqueda combinada por código y estado',
    INDEX idx_area_formacion (area_formacion) COMMENT 'Agrupación y filtrado por área de formación'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo maestro de carreras del instituto. Define únicamente las carreras ofertadas. Toda información específica de planes (duración, cargas horarias, resoluciones) está en planes_estudios.';

-- ============================================
-- TABLA: materias
-- Catálogo de materias/asignaturas
-- ============================================

CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sigla VARCHAR(20) NOT NULL COMMENT 'Sigla de la materia (ej: CON-101, PRG-202, INT-102)',
    nombre VARCHAR(250) NOT NULL COMMENT 'Nombre completo de la materia',
    
    -- Información académica
    objetivos TEXT COMMENT 'Objetivos de aprendizaje de la materia',
    clasificacion VARCHAR(150) COMMENT 'Clasificación de la materia (ej: CONTABILIDAD, PROGRAMACIÓN, IDIOMAS, FORMACIÓN GENERAL)',
    
    -- Tipo de materia
    tipo ENUM('TEORICA', 'PRACTICA', 'TEORICA_PRACTICA') DEFAULT 'TEORICA_PRACTICA' COMMENT 'Naturaleza pedagógica: TEORICA (aula), PRACTICA (lab/taller/campo), TEORICA_PRACTICA (mixta)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si la materia está activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica (soft delete)',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    -- Índices para optimización
    INDEX idx_sigla (sigla) COMMENT 'Búsqueda rápida por sigla',
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda y ordenamiento por nombre',
    INDEX idx_tipo (tipo) COMMENT 'Filtrado por tipo de materia',
    INDEX idx_clasificacion (clasificacion) COMMENT 'Agrupación por clasificación',
    INDEX idx_activo (activo) COMMENT 'Filtrado de materias activas',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de registros no eliminados',
    INDEX idx_sigla_activo (sigla, activo, deleted_at) COMMENT 'Búsqueda combinada por sigla y estado',
    INDEX idx_nombre_activo (nombre, activo, deleted_at) COMMENT 'Búsqueda combinada por nombre y estado'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo maestro de materias/asignaturas. Tabla conceptual reutilizable. Las configuraciones específicas por plan (horas, créditos, modalidad) se definen en asignaturas_plan.';

-- ============================================
-- TABLA: planes_estudios
-- Planes de estudio por carrera según RM
-- ============================================

CREATE TABLE planes_estudios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrera_id INT NULL COMMENT 'Carrera a la que pertenece este plan de estudios',
    nombre_plan VARCHAR(150) NOT NULL COMMENT 'Nombre del plan de estudios (ej: Plan de Estudios 2024)',
    
    -- Información regulatoria
    resolucion_ministerial VARCHAR(100) COMMENT 'Número de resolución ministerial que aprueba este plan (ej: No.0210/2023)',
    documento_ruta VARCHAR(500) COMMENT 'Ruta del documento oficial de la RM (ej: /uploads/resoluciones/RM-0210-2023.pdf)',
    
    -- Características académicas del plan según documento oficial
    duracion_anios INT NOT NULL COMMENT 'Duración en años del plan (ej: 3, 4)',
    carga_horaria_total INT NOT NULL COMMENT 'Carga horaria total del plan (ej: 3600 hrs)',
    horas_semana INT NOT NULL COMMENT 'Horas semanales (ej: 30 hrs)',
    horas_mes INT NOT NULL COMMENT 'Horas mensuales - indica semanas por mes (ej: 120 hrs)',
    horas_anio INT NOT NULL COMMENT 'Horas anuales - indica meses académicos (ej: 1200 hrs = 10 meses)',
    
    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones sobre cambios o características del plan',
    
    -- Control de vigencia
    vigente BOOLEAN DEFAULT FALSE COMMENT 'Indica si es el plan actualmente vigente para nuevas inscripciones',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el plan está activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica (soft delete)',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_carrera_id (carrera_id) COMMENT 'Búsqueda de planes por carrera',
    INDEX idx_resolucion (resolucion_ministerial) COMMENT 'Búsqueda por número de RM',
    INDEX idx_vigente (vigente, activo, deleted_at) COMMENT 'Filtrado de planes vigentes',
    INDEX idx_activo (activo) COMMENT 'Filtrado de planes activos',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de registros no eliminados',
    INDEX idx_carrera_vigente (carrera_id, vigente, activo, deleted_at) COMMENT 'Búsqueda de plan vigente por carrera'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Planes de estudio por carrera. Cada plan define duración, cargas horarias y está respaldado por una resolución ministerial. Solo uno debe estar vigente por carrera.';

-- ============================================
-- TABLA: periodos
-- Periodos (años académicos) de cada plan
-- ============================================
-- IMPORTANTE: Los "periodos" son AÑOS ACADÉMICOS de cada PLAN DE ESTUDIOS (1º Año, 2º Año, 3º Año)
-- NO son periodos académicos temporales de la gestión (eso es periodos_academicos en parte 3)
-- 
-- Ejemplo:
--   - Plan de Estudios 2024 de "Contaduría" tiene 4 periodos: 1º Año, 2º Año, 3º Año, 4º Año
--   - Estos periodos definen qué materias se ven en cada año del plan de estudios
--   - Un estudiante en "1º Año" cursa las materias del periodo 1 de su plan
--
-- Para periodos académicos temporales de gestión (planificación, bimestres, clausura, etc.)
-- ver tabla: periodos_academicos en 05-estructura-academica-parte3.sql

CREATE TABLE periodos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_estudio_id INT NULL COMMENT 'Plan de estudios al que pertenece este periodo',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del periodo (ej: Primer Año, Segundo Año, Tercer Año)',
    numero INT NOT NULL COMMENT 'Número ordinal del periodo (1, 2, 3, 4...)',
    
    -- Organización y visualización
    orden_visualizacion INT NOT NULL DEFAULT 1 COMMENT 'Orden de presentación en interfaces (normalmente igual a numero)',
    descripcion TEXT COMMENT 'Descripción del periodo y sus objetivos académicos',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el periodo está activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica (soft delete)',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (plan_estudio_id) REFERENCES planes_estudios(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_plan_estudio_id (plan_estudio_id) COMMENT 'Búsqueda de periodos por plan de estudios',
    INDEX idx_numero (numero) COMMENT 'Búsqueda por número ordinal',
    INDEX idx_activo (activo) COMMENT 'Filtrado de periodos activos',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de registros no eliminados',
    INDEX idx_plan_numero (plan_estudio_id, numero, activo, deleted_at) COMMENT 'Búsqueda por plan y número',
    INDEX idx_plan_orden (plan_estudio_id, orden_visualizacion) COMMENT 'Ordenamiento de periodos por plan'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Periodos (años académicos) de cada plan de estudios: 1º Año, 2º Año, 3º Año, etc. Cada plan puede tener diferente cantidad de periodos según su duración.';

-- ============================================
-- TABLA: asignaturas_plan
-- Asignación de materias a periodos en cada plan
-- ============================================

CREATE TABLE asignaturas_plan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_estudio_id INT NULL COMMENT 'Plan de estudios (redundancia controlada para performance en queries)',
    periodo_id INT NULL COMMENT 'Periodo (año académico) donde se cursa la materia',
    materia_id INT NULL COMMENT 'Materia asignada a este periodo',
    
    -- Configuración específica en este plan
    horas_semanales INT NOT NULL COMMENT 'Horas semanales totales según el plan (del documento oficial)',
    creditos DECIMAL(5,2) COMMENT 'Créditos académicos de la materia en este plan',
    
    -- Modalidad de la materia
    modalidad ENUM('TRONCAL', 'ELECTIVA', 'REGULAR') NOT NULL DEFAULT 'REGULAR' 
        COMMENT 'TRONCAL: materia fundamental de la carrera, ELECTIVA: a elección del estudiante, REGULAR: materia estándar del plan',
    orden_visualizacion INT NOT NULL DEFAULT 1 COMMENT 'Orden de presentación dentro del periodo',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si la asignación está activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica (soft delete)',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (plan_estudio_id) REFERENCES planes_estudios(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_plan_estudio_id (plan_estudio_id) COMMENT 'Búsqueda por plan (redundancia para performance)',
    INDEX idx_periodo_id (periodo_id) COMMENT 'Búsqueda por periodo',
    INDEX idx_materia_id (materia_id) COMMENT 'Búsqueda por materia',
    INDEX idx_modalidad (modalidad) COMMENT 'Filtrado por modalidad',
    INDEX idx_activo (activo) COMMENT 'Filtrado de asignaciones activas',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de registros no eliminados',
    INDEX idx_plan_periodo (plan_estudio_id, periodo_id, activo, deleted_at) COMMENT 'Búsqueda por plan y periodo',
    INDEX idx_periodo_orden (periodo_id, orden_visualizacion) COMMENT 'Ordenamiento de materias en periodo'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignación de materias a periodos. Define QUÉ materias se cursan en QUÉ periodo con sus configuraciones específicas. plan_estudio_id es redundancia controlada para queries optimizados.';

-- ============================================
-- TABLA: prerrequisitos
-- Prerrequisitos entre asignaturas
-- ============================================
-- Prerrequisitos de asignaturas: define qué materias deben aprobarse antes de inscribirse a otra
-- Relacionado con el plan de estudios, por eso está en parte 1
-- IMPORTANTE: Los prerrequisitos se definen a nivel de asignaturas_plan, no de materias
-- Esto permite que la misma materia tenga diferentes prerrequisitos en diferentes planes

CREATE TABLE prerrequisitos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_estudio_id INT NULL COMMENT 'Plan de estudios (redundancia controlada para performance en queries)',
    asignatura_id INT NULL COMMENT 'Asignatura que requiere el prerrequisito (la que quieres cursar)',
    prerrequisito_id INT NULL COMMENT 'Asignatura que debe aprobarse antes (el prerrequisito)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el prerrequisito está activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica (soft delete)',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (plan_estudio_id) REFERENCES planes_estudios(id) ON DELETE SET NULL,
    FOREIGN KEY (asignatura_id) REFERENCES asignaturas_plan(id) ON DELETE SET NULL,
    FOREIGN KEY (prerrequisito_id) REFERENCES asignaturas_plan(id) ON DELETE SET NULL,
    
    -- Índices para optimización
    INDEX idx_plan_estudio_id (plan_estudio_id) COMMENT 'Búsqueda por plan (redundancia para performance)',
    INDEX idx_asignatura_id (asignatura_id) COMMENT 'Búsqueda de prerrequisitos de una asignatura',
    INDEX idx_prerrequisito_id (prerrequisito_id) COMMENT 'Búsqueda de asignaturas que requieren este prerrequisito',
    INDEX idx_activo (activo) COMMENT 'Filtrado de prerrequisitos activos',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de registros no eliminados',
    INDEX idx_plan_activo (plan_estudio_id, activo, deleted_at) COMMENT 'Búsqueda de prerrequisitos por plan',
    INDEX idx_asignatura_prerrequisito (asignatura_id, prerrequisito_id, activo, deleted_at) COMMENT 'Búsqueda de relación específica'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Prerrequisitos entre asignaturas. Define qué materias deben aprobarse antes de inscribirse a otra. Relación N:M - una materia puede tener múltiples prerrequisitos y ser prerrequisito de múltiples materias. plan_estudio_id es redundancia controlada para queries optimizados.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
