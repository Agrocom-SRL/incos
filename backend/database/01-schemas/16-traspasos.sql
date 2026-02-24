-- ============================================
-- MÓDULO DE TRASPASOS
-- Sistema de Gestión Académica - Instituto INCOS
-- Tabla: traspasos
-- (instituciones se crea en 15-transitabilidades.sql)
-- ============================================
--
-- TRASPASO: Estudiante que cursó uno o dos años en otro ITT y solicita
-- continuar sus estudios en INCOS. El formulario recoge datos del postulante,
-- la institución donde estudió (carrera, año cursado, departamento, distrito,
-- régimen y dependencia) y los documentos presentados.
-- La Dirección Académica concluye Procedente o No Procedente.
--
-- DOCUMENTOS DEL TRASPASO (gestionados en estudiantes_documentos_entrega):
--   1. Autorización de Traspaso de la Subdirección de Educación Superior
--   2. Certificado de Calificaciones / Centralizador / Histórico Académico
--   3. Fotocopia de Carnet de Identidad Vigente         ← acta de compromiso si falta
--   4. Fotocopia de Certificado de Nacimiento           ← acta de compromiso si falta
--   5. Fotocopia de Diploma de Bachiller                ← acta de compromiso si falta
--
-- ACTA DE COMPROMISO: Se genera solo cuando el postulante no presenta
-- alguno de los últimos 3 documentos (Carnet, Certificado de Nacimiento,
-- Diploma de Bachiller). Se registra con tiene_acta_compromiso = TRUE.
--
-- FLUJO:
-- 1. El postulante llena el formulario y presenta los documentos disponibles
-- 2. Si faltan doc. 3, 4 o 5 → se genera acta de compromiso
-- 3. La Dirección Académica revisa y concluye Procedente / No Procedente
-- 4. Si Procedente: se registra el estudiante con tipo_admision = TRASPASO
--
-- RELACIÓN CON ESTUDIANTES:
-- Los datos personales (CI, nombres, fecha nacimiento, domicilio, teléfono,
-- correo, código RUDE/RUDEAL) ya se almacenan en la tabla estudiantes.
-- La entrega de documentos se gestiona en estudiantes_documentos_entrega.
-- Esta tabla solo almacena lo específico del proceso de traspaso.
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS traspasos;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- ============================================

-- ============================================
-- TABLA: traspasos
-- Solicitudes de traspaso desde otro ITT hacia INCOS
-- ============================================

CREATE TABLE traspasos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relación con el estudiante (datos personales ya en tabla estudiantes)
    estudiante_id INT NULL COMMENT 'Estudiante postulante (referencia a estudiantes). Sus datos personales, CI, domicilio, teléfono, correo y código RUDE/RUDEAL están en la tabla estudiantes.',

    -- ------------------------------------------------
    -- SECCIÓN 2: FORMACIÓN ACADÉMICA (institución de origen)
    -- ------------------------------------------------
    institucion_origen_id INT NULL COMMENT 'ITT de origen donde el estudiante cursó estudios previos (referencia a instituciones). Incluye nombre, departamento, distrito educativo y dependencia.',
    carrera_origen VARCHAR(200) NOT NULL COMMENT 'Nombre de la carrera cursada en el ITT de origen',
    anio_cursado ENUM('PRIMERO', 'SEGUNDO') NOT NULL COMMENT 'Año que completó en el ITT de origen: PRIMERO (primer año) o SEGUNDO (segundo año). Corresponde a las opciones del punto 2.1 del formulario.',
    regimen_origen ENUM('SEMESTRAL', 'ANUAL') NULL COMMENT 'Régimen de estudios en el ITT de origen: SEMESTRAL o ANUAL',

    -- ------------------------------------------------
    -- DOCUMENTOS PRESENTADOS
    -- El estado individual de cada documento se gestiona en
    -- estudiantes_documentos_entrega. Aquí solo se registra
    -- si se generó acta de compromiso por documentos faltantes.
    -- ------------------------------------------------
    tiene_acta_compromiso BOOLEAN DEFAULT FALSE COMMENT 'TRUE si se generó acta de compromiso por no presentar alguno de los últimos 3 documentos requeridos (Carnet, Certificado de Nacimiento o Diploma de Bachiller)',
    fecha_acta_compromiso DATE NULL COMMENT 'Fecha en que se generó y firmó el acta de compromiso',

    -- ------------------------------------------------
    -- SECCIÓN 5: RESOLUCIÓN DE LA DIRECCIÓN ACADÉMICA
    -- ------------------------------------------------
    estado ENUM('SOLICITADO', 'EN_REVISION', 'PROCEDENTE', 'NO_PROCEDENTE') DEFAULT 'SOLICITADO' COMMENT 'Estado de la solicitud: SOLICITADO (recibido), EN_REVISION (en análisis), PROCEDENTE (aprobado), NO_PROCEDENTE (rechazado). Corresponde a la conclusión del punto 5 del formulario.',
    fecha_solicitud DATE NULL COMMENT 'Fecha en que el postulante presentó la solicitud (punto 4 del formulario)',
    fecha_resolucion DATE NULL COMMENT 'Fecha en que la Dirección Académica emitió la resolución (punto 5 del formulario)',
    resuelto_por INT NULL COMMENT 'Usuario (director académico) que resolvió la solicitud (referencia a usuarios)',
    motivo_no_procedente TEXT NULL COMMENT 'Motivo por el que la solicitud fue declarada No Procedente',
    observaciones TEXT NULL COMMENT 'Observaciones adicionales de la revisión académica',

    -- Destino en INCOS
    carrera_destino_id INT NULL COMMENT 'Carrera en INCOS a la que ingresará si es Procedente (referencia a carreras)',
    plan_estudio_destino_id INT NULL COMMENT 'Plan de estudios en INCOS (referencia a planes_estudios)',
    periodo_destino_id INT NULL COMMENT 'Periodo académico al que ingresa en INCOS (referencia a periodos)',

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
    FOREIGN KEY (periodo_destino_id) REFERENCES periodos(id) ON DELETE SET NULL,

    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_institucion_origen_id (institucion_origen_id) COMMENT 'Búsqueda por institución de origen',
    INDEX idx_carrera_destino_id (carrera_destino_id) COMMENT 'Búsqueda por carrera destino',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado de la solicitud',
    INDEX idx_anio_cursado (anio_cursado) COMMENT 'Filtrado por año cursado en origen',
    INDEX idx_regimen_origen (regimen_origen) COMMENT 'Filtrado por régimen de estudios de origen',
    INDEX idx_tiene_acta_compromiso (tiene_acta_compromiso) COMMENT 'Filtrado por existencia de acta de compromiso',
    INDEX idx_fecha_solicitud (fecha_solicitud) COMMENT 'Búsqueda por fecha de solicitud',
    INDEX idx_fecha_resolucion (fecha_resolucion) COMMENT 'Búsqueda por fecha de resolución',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Búsqueda por estudiante y estado',
    INDEX idx_carrera_estado (carrera_destino_id, estado, activo, deleted_at) COMMENT 'Búsqueda por carrera destino y estado'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Solicitudes de traspaso: estudiantes que cursaron estudios en otro ITT y solicitan continuar en INCOS. Cubre los 5 puntos del Formulario Anexo 2 de Traspaso. Los datos personales están en estudiantes, los documentos entregados en estudiantes_documentos_entrega.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
