-- ============================================
-- ESTRUCTURA ACADÉMICA - PARTE 2
-- Sistema de Gestión Académica - Instituto INCOS
-- 4 Tablas: docentes, paralelos, aulas, horarios
-- (Oferta e horarios: ver 08-estructura-academica-oferta.sql y 09-estructura-academica-horarios.sql)
-- ============================================
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

-- Eliminar tablas (recreación idempotente del schema)
DROP TABLE IF EXISTS horarios;
DROP TABLE IF EXISTS aulas;
DROP TABLE IF EXISTS paralelos;
DROP TABLE IF EXISTS docentes;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: docentes
-- ============================================

CREATE TABLE docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL COMMENT 'Relación con usuario del sistema',
    
    -- Datos personales básicos
    ci VARCHAR(25) NOT NULL COMMENT 'Cédula de identidad',
    expedicion VARCHAR(5) NOT NULL COMMENT 'Expedición del CI',
    nombres VARCHAR(150) NOT NULL COMMENT 'Nombres completos',
    apellido_paterno VARCHAR(100) NOT NULL COMMENT 'Apellido paterno',
    apellido_materno VARCHAR(100) COMMENT 'Apellido materno',
    fecha_nacimiento DATE NOT NULL COMMENT 'Fecha de nacimiento',
    genero ENUM('MASCULINO', 'FEMENINO', 'OTRO') NOT NULL COMMENT 'Género',
    estado_civil_id INT NULL COMMENT 'Estado civil',
    nacionalidad VARCHAR(50) DEFAULT 'Boliviana' COMMENT 'Nacionalidad',
    
    -- Contacto
    telefono VARCHAR(20) COMMENT 'Teléfono fijo',
    celular VARCHAR(20) NOT NULL COMMENT 'Teléfono celular',
    email_personal VARCHAR(150) COMMENT 'Correo de contacto del docente (también puede usarse para login si coincide con la ficha vinculada al usuario)',
    direccion TEXT COMMENT 'Dirección completa',
    municipio_residencia_id INT NULL COMMENT 'Municipio de residencia',
    zona VARCHAR(100) COMMENT 'Zona/barrio',
    
    -- Datos académicos/profesionales
    titulo_profesional VARCHAR(200) COMMENT 'Título profesional',
    especialidad VARCHAR(200) COMMENT 'Especialidad',
    nivel_academico ENUM('TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO') DEFAULT 'LICENCIATURA' COMMENT 'Nivel académico',
    institucion_egreso VARCHAR(200) COMMENT 'Institución de egreso',
    anio_egreso INT COMMENT 'Año de egreso',
    anios_experiencia INT DEFAULT 0 COMMENT 'Años de experiencia docente',
    
    -- Datos laborales
    fecha_contratacion DATE COMMENT 'Fecha de contratación',
    fecha_retiro DATE COMMENT 'Fecha de retiro',
    tipo_contrato ENUM('PLANTA', 'CONTRATO', 'HORARIO', 'CONSULTOR') DEFAULT 'CONTRATO' COMMENT 'Tipo de contrato',
    estado_laboral ENUM('ACTIVO', 'LICENCIA', 'RETIRADO', 'SUSPENDIDO') DEFAULT 'ACTIVO' COMMENT 'Estado laboral',
    observaciones TEXT COMMENT 'Observaciones adicionales',

    -- Identidad visual y límites de carga (horarios / asignación docente)
    color_hex VARCHAR(7) NULL COMMENT 'Color exclusivo del docente para visualización en horarios.',
    max_horas_semana INT NULL DEFAULT 20 COMMENT 'Carga máxima semanal según contrato. Default 20 (data real 2026).',
    max_horas_mes INT NULL DEFAULT 80 COMMENT 'Carga máxima mensual según contrato. Default 80.',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (estado_civil_id) REFERENCES estados_civiles(id) ON DELETE SET NULL,
    FOREIGN KEY (municipio_residencia_id) REFERENCES municipios(id) ON DELETE SET NULL,
    
    INDEX idx_ci_expedicion (ci, expedicion) COMMENT 'Búsqueda por CI y expedición',
    INDEX idx_usuario_id (usuario_id) COMMENT 'Búsqueda por usuario',
    INDEX idx_email_personal (email_personal) COMMENT 'Búsqueda por email personal',
    INDEX idx_estado_laboral (estado_laboral) COMMENT 'Filtrado por estado laboral',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_apellidos (apellido_paterno, apellido_materno) COMMENT 'Búsqueda por apellidos',
    INDEX idx_estado_activo (estado_laboral, activo, deleted_at) COMMENT 'Búsqueda por estado laboral y activo',
    INDEX idx_tipo_contrato (tipo_contrato, estado_laboral, activo) COMMENT 'Búsqueda por tipo de contrato y estado',
    INDEX idx_municipio (municipio_residencia_id) COMMENT 'Búsqueda por municipio'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Docentes del instituto';

-- ============================================
-- TABLA: paralelos
-- Grupos multi-materia por carrera y periodo
-- ============================================
-- Los paralelos son estructuras conceptuales estables que agrupan estudiantes
-- por año académico, turno y letra. Vinculados a un periodo específico del plan
-- de estudios, lo que permite control formal y validación de coherencia.

CREATE TABLE paralelos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrera_id INT NULL COMMENT 'Carrera a la que pertenece este paralelo (redundancia útil para performance)',
    periodo_id INT NULL COMMENT 'Periodo (año académico) del plan de estudios: Primer Año, Segundo Año, Tercer Año',
    
    -- Identificación
    nombre VARCHAR(50) NOT NULL COMMENT 'Nombre del paralelo (ej: PRIMERO A, SEGUNDO B, TERCERO A)',
    turno ENUM('MAÑANA', 'TARDE', 'NOCHE') NOT NULL COMMENT 'Turno plantilla del paralelo maestro. Operación por gestión: paralelos_gestion.turno.',
    descripcion TEXT COMMENT 'Descripción informativa del paralelo',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el paralelo está activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica (soft delete)',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE SET NULL,
    
    INDEX idx_carrera_id (carrera_id) COMMENT 'Búsqueda por carrera',
    INDEX idx_periodo_id (periodo_id) COMMENT 'Búsqueda por periodo (año académico)',
    INDEX idx_turno (turno) COMMENT 'Búsqueda por turno',
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_carrera_periodo_turno (carrera_id, periodo_id, turno, deleted_at) COMMENT 'Búsqueda combinada por carrera, periodo y turno'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Paralelos (maestro conceptual reutilizable). Estructura estable de grupos multi-materia vinculados a un periodo del plan de estudios.';

-- ============================================
-- TABLA: aulas
-- Espacios físicos del instituto
-- ============================================

CREATE TABLE aulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL COMMENT 'Código del aula (ej: Lab-1, Lab-2, Aula-8)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo del aula',
    categoria ENUM('LABORATORIO', 'AULA', 'TALLER', 'AUDITORIO') DEFAULT 'AULA' 
        COMMENT 'Categoría del espacio según su diseño y construcción',
    
    -- Capacidad
    capacidad INT NOT NULL DEFAULT 35 COMMENT 'Capacidad máxima de estudiantes',
    observaciones TEXT COMMENT 'Observaciones: ubicación, equipamiento, restricciones, etc.',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el aula está activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica (soft delete)',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código',
    INDEX idx_categoria (categoria) COMMENT 'Búsqueda por categoría',
    INDEX idx_capacidad (capacidad) COMMENT 'Búsqueda por capacidad',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Aulas, laboratorios y espacios físicos del instituto. Información básica para asignación de horarios';

-- ============================================
-- TABLA: horarios
-- Bloques horarios: clases, eventos y feriados
-- ============================================
-- Bloques horarios conceptuales que soportan:
-- - CLASES: Bloques estándar de 45 minutos organizados por turno
-- - EVENTOS: Horarios personalizados para actividades institucionales
-- - FERIADOS: Marcadores de día completo sin horario específico
-- - CAPACITACION: Horarios especiales para cursos de capacitación

CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) COMMENT 'Nombre descriptivo (ej: BLOQUE 1 - NOCHE, Inauguración 2025, Feriado Nacional)',
    
    -- Definición del bloque
    dia ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') NULL
        COMMENT 'Día de la semana (NULL = cualquier día o no aplica)',
    hora_inicio TIME NULL COMMENT 'Hora de inicio del bloque (NULL = todo el día o no aplica)',
    hora_fin TIME NULL COMMENT 'Hora de fin del bloque (NULL = todo el día o no aplica)',
    
    -- Organización por turno (solo para CLASES)
    turno ENUM('MAÑANA', 'TARDE', 'NOCHE') NULL COMMENT 'Turno al que pertenece este bloque (NULL si no aplica)',
    numero_bloque INT NULL COMMENT 'Número del bloque dentro del turno (1, 2, 3, 4, 5) (NULL si no aplica)',
    
    -- Tipo de horario
    tipo_horario ENUM('CLASES', 'EVENTOS', 'FERIADOS', 'CAPACITACION') DEFAULT 'CLASES'
        COMMENT 'CLASES: bloques de 45 min | EVENTOS: horarios personalizados | FERIADOS: día completo | CAPACITACION: horarios especiales',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si el horario está activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica (soft delete)',
    created_by INT NULL COMMENT 'Usuario que creó',
    updated_by INT NULL COMMENT 'Usuario que modificó',
    deleted_by INT NULL COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    INDEX idx_dia (dia) COMMENT 'Búsqueda por día',
    INDEX idx_turno (turno) COMMENT 'Búsqueda por turno',
    INDEX idx_numero_bloque (numero_bloque) COMMENT 'Búsqueda por número de bloque',
    INDEX idx_tipo_horario (tipo_horario) COMMENT 'Búsqueda por tipo de horario',
    INDEX idx_turno_numero (turno, numero_bloque) COMMENT 'Búsqueda por turno y número',
    INDEX idx_dia_hora (dia, hora_inicio, hora_fin) COMMENT 'Búsqueda por día y horario',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bloques horarios conceptuales. Soporta clases (45 min), eventos (personalizados), feriados (día completo) y capacitaciones';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
