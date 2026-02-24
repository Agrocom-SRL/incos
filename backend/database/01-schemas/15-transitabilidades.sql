-- ============================================
-- MÓDULO DE TRANSITABILIDADES
-- Sistema de Gestión Académica - Instituto INCOS
-- Tablas: instituciones, transitabilidades
-- ============================================
--
-- TRANSITABILIDAD: Estudiante con título de Técnico Medio (UETHP o CEA) que postula
-- a continuar estudios en un Instituto Técnico y Tecnológico (ITT).
-- El formulario recoge datos del postulante, su formación académica previa
-- (institución de origen, carrera, código SIE-UE, departamento, distrito educativo)
-- y el justificativo de postulación (ITT destino, carrera, dependencia, régimen).
-- La Dirección Académica concluye si la solicitud es Procedente o No Procedente.
--
-- FLUJO:
-- 1. El postulante llena el formulario y presenta documentación académica original
-- 2. La Dirección Académica revisa y concluye Procedente / No Procedente
-- 3. Si Procedente: se registra el estudiante con tipo_admision = TRANSITABILIDAD
--
-- RELACIÓN CON ESTUDIANTES:
-- Los datos personales (CI, nombres, fecha nacimiento, domicilio, teléfono,
-- correo, código RUDE/RUDEAL) ya se almacenan en la tabla estudiantes.
-- Esta tabla solo almacena lo específico del proceso de transitabilidad.
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS transitabilidades;
DROP TABLE IF EXISTS instituciones;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- ============================================

-- ============================================
-- TABLA: instituciones
-- Catálogo de instituciones educativas de origen (UETHP, CEA, ITT, etc.)
-- Usada tanto en transitabilidades como en traspasos.
-- Se crea aquí para que este script pueda ejecutarse antes que 16-traspasos.sql.
-- ============================================

CREATE TABLE instituciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Datos de identificación
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre completo de la institución',
    sigla VARCHAR(50) NULL COMMENT 'Sigla o código de la institución',
    tipo ENUM('UETHP', 'CEA', 'ITT', 'UNIVERSIDAD', 'OTRO') NOT NULL DEFAULT 'OTRO' COMMENT 'Tipo de institución: UETHP (Unidad Educativa Técnica Humanística Plena), CEA (Centro de Educación Alternativa), ITT (Instituto Técnico y Tecnológico), UNIVERSIDAD, OTRO',
    dependencia ENUM('FISCAL', 'CONVENIO', 'PRIVADO') NULL COMMENT 'Dependencia institucional: FISCAL, CONVENIO o PRIVADO',

    -- Datos geográficos y de registro educativo
    codigo_sie VARCHAR(20) NULL COMMENT 'Código SIE-UE del sistema de información educativa',
    departamento_id INT NULL COMMENT 'Departamento donde se ubica la institución (referencia a departamentos)',
    distrito_educativo VARCHAR(100) NULL COMMENT 'Distrito educativo al que pertenece',

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

    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL,

    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_tipo (tipo) COMMENT 'Filtrado por tipo de institución',
    INDEX idx_dependencia (dependencia) COMMENT 'Filtrado por dependencia',
    INDEX idx_departamento_id (departamento_id) COMMENT 'Búsqueda por departamento',
    INDEX idx_codigo_sie (codigo_sie) COMMENT 'Búsqueda por código SIE',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de instituciones educativas de origen para transitabilidades y traspasos (UETHP, CEA, ITT, etc.).';

-- ============================================
-- TABLA: transitabilidades
-- Solicitudes de transitabilidad: Técnico Medio (UETHP/CEA) → ITT
-- ============================================

CREATE TABLE transitabilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relación con el estudiante (datos personales ya en tabla estudiantes)
    estudiante_id INT NULL COMMENT 'Estudiante postulante (referencia a estudiantes). Sus datos personales, CI, domicilio, teléfono, correo y código RUDE/RUDEAL están en la tabla estudiantes.',

    -- ------------------------------------------------
    -- SECCIÓN 2: FORMACIÓN ACADÉMICA (institución de origen)
    -- ------------------------------------------------
    institucion_origen_id INT NULL COMMENT 'Institución de origen donde obtuvo el Técnico Medio (referencia a instituciones). Incluye nombre, tipo UETHP/CEA, código SIE-UE, departamento y distrito educativo.',
    carrera_origen VARCHAR(200) NOT NULL COMMENT 'Nombre de la carrera cursada en la institución de origen (ej: Técnico Medio en Contabilidad)',
    anio_conclusion INT NULL COMMENT 'Año de conclusión de estudios en la institución de origen',

    -- ------------------------------------------------
    -- SECCIÓN 3: JUSTIFICATIVO DE POSTULACIÓN (instituto destino)
    -- ------------------------------------------------
    -- El instituto destino es siempre INCOS, pero se registran los datos
    -- de la carrera y condiciones a las que postula
    carrera_destino_id INT NULL COMMENT 'Carrera del ITT (INCOS) a la que postula (referencia a carreras)',
    plan_estudio_destino_id INT NULL COMMENT 'Plan de estudios de la carrera destino en INCOS (referencia a planes_estudios)',
    regimen_estudios ENUM('SEMESTRAL', 'ANUAL') NULL COMMENT 'Régimen de estudios de la carrera destino: SEMESTRAL o ANUAL',

    -- Compromiso del postulante
    acepta_compromiso BOOLEAN DEFAULT FALSE COMMENT 'El postulante acepta cumplir las normativas vigentes del ITT (corresponde al punto 3 del formulario)',
    fecha_compromiso DATE NULL COMMENT 'Fecha en que el postulante firmó el compromiso',

    -- ------------------------------------------------
    -- SECCIÓN 5: RESOLUCIÓN DE LA DIRECCIÓN ACADÉMICA
    -- ------------------------------------------------
    estado ENUM('SOLICITADO', 'EN_REVISION', 'PROCEDENTE', 'NO_PROCEDENTE') DEFAULT 'SOLICITADO' COMMENT 'Estado de la solicitud: SOLICITADO (recibido), EN_REVISION (en análisis), PROCEDENTE (aprobado), NO_PROCEDENTE (rechazado). Corresponde a la conclusión del punto 5 del formulario.',
    fecha_solicitud DATE NULL COMMENT 'Fecha en que el postulante presentó la solicitud (punto 4 del formulario)',
    fecha_resolucion DATE NULL COMMENT 'Fecha en que la Dirección Académica emitió la resolución (punto 5 del formulario)',
    resuelto_por INT NULL COMMENT 'Usuario (director académico o rector) que resolvió la solicitud (referencia a usuarios)',
    motivo_no_procedente TEXT NULL COMMENT 'Motivo por el que la solicitud fue declarada No Procedente',
    observaciones TEXT NULL COMMENT 'Observaciones adicionales de la revisión académica',

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
    FOREIGN KEY (institucion_origen_id) REFERENCES instituciones(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_destino_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (plan_estudio_destino_id) REFERENCES planes_estudios(id) ON DELETE SET NULL,

    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_institucion_origen_id (institucion_origen_id) COMMENT 'Búsqueda por institución de origen',
    INDEX idx_carrera_destino_id (carrera_destino_id) COMMENT 'Búsqueda por carrera destino',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado de la solicitud',
    INDEX idx_fecha_solicitud (fecha_solicitud) COMMENT 'Búsqueda por fecha de solicitud',
    INDEX idx_fecha_resolucion (fecha_resolucion) COMMENT 'Búsqueda por fecha de resolución',
    INDEX idx_regimen_estudios (regimen_estudios) COMMENT 'Filtrado por régimen de estudios',
    INDEX idx_acepta_compromiso (acepta_compromiso) COMMENT 'Filtrado por aceptación de compromiso',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Búsqueda por estudiante y estado',
    INDEX idx_carrera_estado (carrera_destino_id, estado, activo, deleted_at) COMMENT 'Búsqueda por carrera destino y estado'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Solicitudes de transitabilidad: postulantes con Técnico Medio (UETHP/CEA) que solicitan ingresar a un ITT. Cubre los 5 puntos del Formulario Anexo 2 de Transitabilidad. Los datos personales del postulante están en la tabla estudiantes (incluyendo código RUDE/RUDEAL).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
