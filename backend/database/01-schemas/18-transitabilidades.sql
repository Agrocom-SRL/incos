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
-- correo) ya se almacenan en la tabla estudiantes. El código RUDE/RUDEAL NO
-- tiene columna en estudiantes: el ANEXO 2 lo solicita igual que el formulario
-- de traspaso, por lo que se guarda aquí (codigo_rude, espejo de
-- traspasos.codigo_rude).
-- La carrera en INCOS una vez admitido está en estudiantes_datos_academicos.carrera_id.
-- Esta tabla solo almacena lo específico del proceso de transitabilidad.
--
-- FORMULARIOS - QUÉ VA DÓNDE:
-- - Sección 1 "Datos generales del postulante" → tabla estudiantes.
-- - Sección 2 "Formación académica" = datos de ORIGEN (UETHP/CEA): institución,
--   carrera_origen, año conclusión, código SIE, departamento, distrito → instituciones
--   + transitabilidades (institucion_origen_id, carrera_origen, anio_conclusion).
--   Los checkboxes "Técnico Medio UETHP" / "Técnico Medio CEA" (nivel académico alcanzado,
--   categorías fijas del sistema educativo boliviano) no requieren campo propio: se infieren
--   de instituciones.tipo vía institucion_origen_id (UETHP o CEA).
-- - Sección 3 "Justificativo" = regimen_estudios y acepta_compromiso. La carrera en INCOS
--   ya está en estudiantes_datos_academicos.carrera_id (elegida en el paso Tipo de Admisión).
-- - Sección 4 "Declaración jurada": la firma del postulante es documento físico (no se guarda en BD).
--   fecha_solicitud es opcional: fecha de presentación/recepción si se desea registrar.
-- - Sección 5 "Cumplimiento de requisitos": lugar, fecha y firmas (dirección académica, rector) son
--   propios del documento impreso que se entrega al estudiante como respaldo; no forman parte del schema.
--   Solo se guardan estado (Procedente/No procedente), motivo_no_procedente y observaciones para flujo y auditoría.
--
-- FLUJO EN DOS PASOS (UI): Paso 1 registro (secciones 1-4 + documentos), Paso 2 resolución
--   (solo director académico: cambia estado a PROCEDENTE/NO_PROCEDENTE; lugar/fecha/firma quedan en el documento impreso).
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
-- Catálogo de instituciones educativas de ORIGEN (UETHP, CEA, ITT, etc.).
-- Contiene ÚNICAMENTE la información de la sección 2 "Formación académica" del
-- formulario: nombre de la institución, tipo (UETHP/CEA/ITT), código SIE-UE,
-- departamento, distrito educativo, dependencia. Usada por transitabilidades
-- (origen UETHP/CEA) y traspasos (origen ITT). Se crea aquí para que este
-- script pueda ejecutarse antes que 16-traspasos.sql.
-- ============================================

CREATE TABLE instituciones (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Datos de identificación
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre completo de la institución',
    tipo ENUM('UETHP', 'CEA', 'ITT', 'UNIVERSIDAD') NOT NULL COMMENT 'Tipo de institución: UETHP (Unidad Educativa Técnica Humanística Plena), CEA (Centro de Educación Alternativa), ITT (Instituto Técnico y Tecnológico), UNIVERSIDAD',
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
--
-- Esta tabla agrupa TRES bloques de datos del formulario físico:
--   A) ORIGEN (sección 2 Formación académica): ref a instituciones + carrera_origen, anio_conclusion.
--   B) DESTINO / SELECCIÓN EN INCOS (sección 3 Justificativo): régimen, compromiso; la carrera
--      destino ya está en estudiantes_datos_academicos (no se duplica aquí).
--   C) SECCIÓN 5: solo estado, motivo_no_procedente y observaciones. Lugar, fecha y firmas son
--      del documento impreso (respaldo físico), no del schema.
-- ============================================

CREATE TABLE transitabilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NULL COMMENT 'Estudiante postulante (referencia a estudiantes). Sus datos personales, CI, domicilio, teléfono y correo están en la tabla estudiantes; el código RUDE/RUDEAL se guarda aquí (codigo_rude).',

    -- Código RUDE/RUDEAL (sección 1 del ANEXO 2; sin columna en estudiantes, espejo de traspasos.codigo_rude)
    codigo_rude VARCHAR(50) NULL COMMENT 'Código RUDE o RUDEAL del postulante (registro único en el sistema educativo boliviano). El ANEXO 2 de transitabilidad lo solicita igual que el formulario de traspaso.',

    -- ------------------------------------------------
    -- A) SECCIÓN 2: FORMACIÓN ACADÉMICA (origen UETHP/CEA)
    -- ------------------------------------------------
    -- El "nivel alcanzado" (Técnico Medio UETHP / CEA) del formulario = instituciones.tipo vía esta FK.
    institucion_origen_id INT NULL COMMENT 'Institución de origen donde obtuvo el Técnico Medio (referencia a instituciones). El tipo (UETHP o CEA) equivale a los checkboxes "Técnico Medio UETHP/CEA" del formulario; no se guarda nivel_alcanzado aparte.',
    carrera_origen VARCHAR(200) NOT NULL COMMENT 'Nombre de la carrera cursada en la institución de origen (ej: Técnico Medio en Contabilidad)',
    anio_conclusion INT NULL COMMENT 'Año de conclusión de estudios en la institución de origen',

    -- ------------------------------------------------
    -- B) SECCIÓN 3: JUSTIFICATIVO (selección en nuestro instituto INCOS)
    -- ------------------------------------------------
    -- Carrera/plan en INCOS ya están en estudiantes_datos_academicos (elegidos en Tipo de Admisión).
    regimen_estudios ENUM('SEMESTRAL', 'ANUAL') NULL COMMENT 'Régimen de estudios de la carrera destino: SEMESTRAL o ANUAL (formulario sección 3)',
    acepta_compromiso BOOLEAN DEFAULT FALSE COMMENT 'El postulante acepta cumplir las normativas vigentes del ITT (corresponde al punto 3 del formulario)',
    fecha_compromiso DATE NULL COMMENT 'Fecha en que el postulante firmó el compromiso',

    -- ------------------------------------------------
    -- C) SECCIÓN 5: RESOLUCIÓN (solo estado y motivo; lugar/fecha/firmas son del documento impreso)
    -- ------------------------------------------------
    estado ENUM('SOLICITADO', 'EN_REVISION', 'PROCEDENTE', 'NO_PROCEDENTE') DEFAULT 'SOLICITADO' COMMENT 'Estado de la solicitud: SOLICITADO (recibido), EN_REVISION (en análisis), PROCEDENTE (aprobado), NO_PROCEDENTE (rechazado). Corresponde a la conclusión del punto 5 del formulario.',
    fecha_solicitud DATE NULL COMMENT 'Fecha en que el postulante presentó la solicitud (sección 4), si se desea registrar.',
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
    INDEX idx_fecha_solicitud (fecha_solicitud) COMMENT 'Búsqueda por fecha de solicitud',
    INDEX idx_regimen_estudios (regimen_estudios) COMMENT 'Filtrado por régimen de estudios',
    INDEX idx_acepta_compromiso (acepta_compromiso) COMMENT 'Filtrado por aceptación de compromiso',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Búsqueda por estudiante y estado'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Solicitudes de transitabilidad: postulantes con Técnico Medio (UETHP/CEA) que solicitan ingresar a un ITT. Cubre los 5 puntos del Formulario Anexo 2 de Transitabilidad. Los datos personales del postulante están en la tabla estudiantes; el código RUDE/RUDEAL se guarda aquí (codigo_rude).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
