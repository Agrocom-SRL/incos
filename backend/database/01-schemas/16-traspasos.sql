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
-- INSTITUCIÓN DE ORIGEN: Se usa la MISMA tabla instituciones (15-transitabilidades.sql).
-- Para traspaso el origen es tipo ITT; los datos de la sección 2 "Formación académica"
-- del formulario (nombre institución, departamento, distrito educativo, dependencia)
-- se reflejan en instituciones; carrera, primer/segundo año y régimen en esta tabla traspasos.
--
-- DOCUMENTOS DEL TRASPASO: Tipos en tabla documentacion (seed 09-seed-documentacion.sql).
-- Entrega por estudiante en estudiantes_documentos_entrega. Los 5 ítems del formulario
-- "Documentos Presentados" son: doc. TRASPASO id 8, 9 + INSCRIPCION id 3, 2, 1 (Carnet, Cert. Nac., Diploma).
--   1. Autorización de Traspaso de la Subdirección de Educación Superior  (documentacion id 8)
--   2. Certificado de Calificaciones / Centralizador / Histórico Académico (documentacion id 9)
--   3. Fotocopia de Carnet de Identidad Vigente         (id 3) ← acta de compromiso si falta
--   4. Fotocopia de Certificado de Nacimiento           (id 2) ← acta de compromiso si falta
--   5. Fotocopia de Diploma de Bachiller                (id 1) ← acta de compromiso si falta
--
-- ACTA DE COMPROMISO: La genera el caso de uso GenerateActaCompromisoUseCase cuando
-- falta alguno de los últimos 3 documentos. No se guarda flag en esta tabla: si se generó
-- acta se refleja en el documento guardado (documentos_estudiante / tipo correspondiente).
--
-- FLUJO:
-- 1. El postulante llena el formulario y presenta los documentos disponibles
-- 2. Si faltan doc. 3, 4 o 5 → se genera acta de compromiso
-- 3. La Dirección Académica revisa y concluye Procedente / No Procedente
-- 4. Si Procedente: se registra el estudiante con tipo_admision = TRASPASO
--
-- RELACIÓN CON ESTUDIANTES:
-- Los datos personales (CI, nombres, fecha nacimiento, domicilio, teléfono,
-- correo) ya se almacenan en la tabla estudiantes. El código RUDE/RUDEAL es
-- exclusivo del formulario de traspaso y se almacena en esta tabla (traspasos).
-- La carrera, plan y periodo en INCOS ya están en estudiantes_datos_academicos/inscripciones;
-- no se duplican aquí (carrera_destino_id, plan_estudio_destino_id, periodo_destino_id eliminados).
-- La entrega de documentos se gestiona en estudiantes_documentos_entrega.
-- Esta tabla solo almacena lo específico del proceso de traspaso.
--
-- FORMULARIOS - QUÉ VA DÓNDE (todos los datos del formulario se reflejan en el sistema):
-- - Sección 1 "Datos generales del postulante" → tabla estudiantes.
-- - Sección 2 "Formación académica" = ORIGEN (ITT): nombre, departamento, distrito, dependencia
--   → tabla instituciones (tipo ITT), referenciada por institucion_origen_id. CARRERA, Primer/Segundo año,
--   Régimen → tabla traspasos (carrera_origen, anio_cursado, regimen_origen). No se duplica el nombre:
--   se obtiene de instituciones.nombre vía institucion_origen_id.
-- - Sección 4 "Declaración jurada": la firma del postulante es documento físico (no se guarda en BD).
--   fecha_solicitud es opcional: fecha de presentación/recepción si se desea registrar.
-- - Sección 5 "Cumplimiento de requisitos": lugar, fecha y firma son propios del documento impreso
--   (según donde se use el sistema); no se guardan en la tabla. Solo se guarda estado (Procedente/No procedente)
--   y motivo_no_procedente, observaciones para flujo y auditoría.
--
-- FLUJO EN DOS PASOS (UI): igual que transitabilidades — Paso 1 registro (secciones 1-4 + documentos),
--   Paso 2 resolución (solo director académico; en traspaso una sola firma auditable).
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
    estudiante_id INT NULL COMMENT 'Estudiante postulante (referencia a estudiantes). Sus datos personales, CI, domicilio, teléfono y correo están en la tabla estudiantes.',

    -- Código RUDE/RUDEAL (exclusivo de traspaso; ningún otro tipo de admisión lo usa)
    codigo_rude VARCHAR(50) NULL COMMENT 'Código RUDE o RUDEAL del postulante (registro único en el sistema educativo boliviano). Solo aplica a traspasos.',

    -- ------------------------------------------------
    -- SECCIÓN 2: FORMACIÓN ACADÉMICA (institución de origen)
    -- ------------------------------------------------
    -- El nombre de la institución está en instituciones.nombre (vía esta FK); no se duplica aquí.
    institucion_origen_id INT NULL COMMENT 'ITT de origen donde el estudiante cursó estudios previos (referencia a instituciones). El nombre, departamento, distrito y dependencia están en la tabla instituciones.',
    carrera_origen VARCHAR(200) NULL COMMENT 'Nombre de la carrera cursada en el ITT de origen (opcional; la carrera destino en INCOS ya se eligió en Tipo de Admisión).',
    anio_cursado ENUM('PRIMERO', 'SEGUNDO') NOT NULL COMMENT 'Año que completó en el ITT de origen: PRIMERO (primer año) o SEGUNDO (segundo año). Corresponde a las opciones del punto 2.1 del formulario.',
    regimen_origen ENUM('SEMESTRAL', 'ANUAL') NULL COMMENT 'Régimen de estudios en el ITT de origen: SEMESTRAL o ANUAL',

    -- ------------------------------------------------
    -- SECCIÓN 5: RESOLUCIÓN (solo estado y motivo; lugar/fecha/firma son del documento impreso)
    -- ------------------------------------------------
    estado ENUM('SOLICITADO', 'EN_REVISION', 'PROCEDENTE', 'NO_PROCEDENTE') DEFAULT 'SOLICITADO' COMMENT 'Estado de la solicitud: SOLICITADO (recibido), EN_REVISION (en análisis), PROCEDENTE (aprobado), NO_PROCEDENTE (rechazado). Corresponde a la conclusión del punto 5 del formulario.',
    fecha_solicitud DATE NULL COMMENT 'Fecha en que el postulante presentó la solicitud (punto 4 del formulario), si se desea registrar.',
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

    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_institucion_origen_id (institucion_origen_id) COMMENT 'Búsqueda por institución de origen',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado de la solicitud',
    INDEX idx_anio_cursado (anio_cursado) COMMENT 'Filtrado por año cursado en origen',
    INDEX idx_regimen_origen (regimen_origen) COMMENT 'Filtrado por régimen de estudios de origen',
    INDEX idx_fecha_solicitud (fecha_solicitud) COMMENT 'Búsqueda por fecha de solicitud',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Búsqueda por estudiante y estado'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Solicitudes de traspaso: estudiantes que cursaron estudios en otro ITT y solicitan continuar en INCOS. Cubre los 5 puntos del Formulario Anexo 2 de Traspaso. Los datos personales están en estudiantes, los documentos entregados en estudiantes_documentos_entrega.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
