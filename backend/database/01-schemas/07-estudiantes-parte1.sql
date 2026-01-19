-- ============================================
-- MÓDULO DE ESTUDIANTES - PARTE 1
-- Sistema de Gestión Académica - Instituto INCOS
-- 4 Tablas: estudiantes, estudiantes_datos_academicos, estudiantes_documentos_entrega, documentos_estudiante
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS documentos_estudiante;
DROP TABLE IF EXISTS estudiantes_documentos_entrega;
DROP TABLE IF EXISTS estudiantes_datos_academicos;
DROP TABLE IF EXISTS estudiantes;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: estudiantes
-- ============================================

CREATE TABLE estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT COMMENT 'Relación con usuario del sistema',
    codigo_estudiante VARCHAR(20) NOT NULL COMMENT 'Código único del estudiante',
    
    -- Datos personales básicos
    ci VARCHAR(20) NOT NULL COMMENT 'Cédula de identidad',
    expedicion VARCHAR(5) NOT NULL COMMENT 'Expedición del CI (SC, LP, CB, etc.)',
    nombres VARCHAR(150) NOT NULL COMMENT 'Nombres completos',
    apellido_paterno VARCHAR(100) NOT NULL COMMENT 'Apellido paterno',
    apellido_materno VARCHAR(100) COMMENT 'Apellido materno',
    fecha_nacimiento DATE NOT NULL COMMENT 'Fecha de nacimiento',
    genero ENUM('MASCULINO', 'FEMENINO', 'OTRO') NOT NULL COMMENT 'Género',
    estado_civil_id INT COMMENT 'Estado civil',
    tipo_sangre ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') COMMENT 'Tipo de sangre',
    
    -- Discapacidad (necesario para becas)
    -- Los detalles de discapacidad están en la tabla estudiantes_discapacidades
    tiene_discapacidad BOOLEAN DEFAULT FALSE COMMENT 'Tiene discapacidad (los detalles están en estudiantes_discapacidades)',
    
    -- Contacto
    email_personal VARCHAR(150) COMMENT 'Email personal (para emergencias, el email institucional está en usuarios) para el estudiante',
    celular VARCHAR(20) NOT NULL COMMENT 'Teléfono celular',
    telefono_fijo VARCHAR(20) COMMENT 'Teléfono fijo',
    direccion TEXT COMMENT 'Dirección completa',
    municipio_residencia_id INT COMMENT 'Municipio de residencia (contiene toda la info geográfica)',
    zona VARCHAR(100) COMMENT 'Zona/barrio',
    
    -- Observaciones
    observaciones TEXT COMMENT 'Observaciones adicionales',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estado_civil_id) REFERENCES estados_civiles(id) ON DELETE SET NULL,
    FOREIGN KEY (municipio_residencia_id) REFERENCES municipios(id) ON DELETE SET NULL,
    
    INDEX idx_codigo_estudiante (codigo_estudiante) COMMENT 'Búsqueda por código',
    INDEX idx_ci_expedicion (ci, expedicion) COMMENT 'Búsqueda por CI y expedición',
    INDEX idx_usuario_id (usuario_id) COMMENT 'Búsqueda por usuario',
    INDEX idx_email_personal (email_personal) COMMENT 'Búsqueda por email personal',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_apellidos (apellido_paterno, apellido_materno) COMMENT 'Búsqueda por apellidos',
    INDEX idx_municipio_residencia (municipio_residencia_id) COMMENT 'Búsqueda por municipio de residencia',
    INDEX idx_tiene_discapacidad (tiene_discapacidad) COMMENT 'Búsqueda por discapacidad'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Estudiantes del instituto';

-- ============================================
-- TABLA: estudiantes_datos_academicos
-- ============================================

CREATE TABLE estudiantes_datos_academicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NULL COMMENT 'Estudiante (NULL permite flexibilidad en migraciones)',
    carrera_id INT NULL COMMENT 'Carrera (NULL permite flexibilidad en migraciones)',
    gestion_ingreso_id INT NULL COMMENT 'Gestión de ingreso (NULL permite flexibilidad en migraciones)',
    estado_academico ENUM('REGULAR', 'NIVELACION', 'RETIRADO', 'EGRESADO', 'ABANDONO') DEFAULT 'REGULAR' COMMENT 'Estado académico',
    estado_registro ENUM('BORRADOR', 'PENDIENTE', 'ADMITIDO') DEFAULT 'BORRADOR' COMMENT 'Estado del proceso de registro: BORRADOR (datos completos, documentos pendientes), PENDIENTE (al menos un documento original), ADMITIDO (todos los documentos originales verificados)',
    unidad_educativa_procedencia VARCHAR(200) COMMENT 'Unidad educativa de procedencia',
    anio_egreso_secundaria INT COMMENT 'Año de egreso de secundaria',
    promedio_anual DECIMAL(5,2) COMMENT 'Promedio anual (se usa para cálculo de descuentos en becas)',
    fecha_egreso DATE COMMENT 'Fecha de egreso',
    fecha_retiro DATE COMMENT 'Fecha de retiro',
    motivo_retiro TEXT COMMENT 'Motivo de retiro/abandono',
    foto_url VARCHAR(255) COMMENT 'URL de la fotografía',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_ingreso_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_carrera_id (carrera_id) COMMENT 'Búsqueda por carrera',
    INDEX idx_estado_academico (estado_academico) COMMENT 'Filtrado por estado académico',
    INDEX idx_estado_registro (estado_registro, activo, deleted_at) COMMENT 'Búsqueda por estado de registro',
    INDEX idx_promedio_anual (promedio_anual) COMMENT 'Búsqueda por promedio anual',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_activo (estudiante_id, activo, deleted_at) COMMENT 'Búsqueda por estudiante y estado activo',
    INDEX idx_carrera_estado (carrera_id, estado_academico, activo, deleted_at) COMMENT 'Búsqueda por carrera y estado académico',
    INDEX idx_gestion_ingreso (gestion_ingreso_id, activo, deleted_at) COMMENT 'Búsqueda por gestión de ingreso',
    INDEX idx_estado_activo (estado_academico, activo, deleted_at) COMMENT 'Búsqueda por estado académico y activo',
    INDEX idx_carrera_gestion (carrera_id, gestion_ingreso_id, activo, deleted_at) COMMENT 'Búsqueda por carrera y gestión de ingreso'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Datos académicos detallados de estudiantes. Relación 1:1 con estudiantes.';

-- ============================================
-- TABLA: estudiantes_documentos_entrega
-- ============================================
-- Tabla para registrar la RELACIÓN entre estudiante y documento requerido
-- IMPORTANTE: Esta tabla representa la relación entre un estudiante y un tipo de documento requerido.
-- Indica si el documento fue entregado, si está en trámite, fecha de entrega, etc.
-- NO almacena archivos digitales, solo el estado de la relación estudiante-documento.
-- Los archivos digitales se almacenan en documentos_estudiante.

CREATE TABLE estudiantes_documentos_entrega (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NULL COMMENT 'Estudiante',
    documentacion_id INT NULL COMMENT 'Tipo de documentación requerida (referencia a documentacion)',
    entregado BOOLEAN DEFAULT FALSE COMMENT 'Indica si el documento fue entregado físicamente (TRUE) o no (FALSE)',
    en_tramite BOOLEAN DEFAULT FALSE COMMENT 'Indica si el documento está en trámite. Si es TRUE, el estudiante puede registrar aunque no lo tenga físicamente, pero debe presentarlo posteriormente',
    es_original BOOLEAN DEFAULT FALSE COMMENT 'Indica si el documento entregado es original (TRUE) o fotocopia (FALSE). Solo aplica si entregado = TRUE y en_tramite = FALSE.',
    fecha_entrega DATE COMMENT 'Fecha en que se entregó físicamente el documento',
    fecha_vencimiento_tramite DATE COMMENT 'Fecha límite para entregar el documento si está en trámite (ej: 10 días desde el registro)',
    observaciones TEXT COMMENT 'Observaciones adicionales sobre la entrega del documento (incluye motivo de trámite si aplica)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (documentacion_id) REFERENCES documentacion(id) ON DELETE SET NULL,
    
    -- Índices esenciales
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_documentacion_id (documentacion_id) COMMENT 'Búsqueda por tipo de documentación',
    INDEX idx_entregado (entregado) COMMENT 'Filtrado por documentos entregados',
    INDEX idx_en_tramite (en_tramite) COMMENT 'Filtrado por documentos en trámite',
    INDEX idx_es_original (es_original, entregado, activo, deleted_at) COMMENT 'Filtrado por tipo de documento entregado (original/fotocopia)',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_documentacion (estudiante_id, documentacion_id, activo, deleted_at) COMMENT 'Búsqueda de entrega por estudiante y tipo de documentación',
    INDEX idx_entregado_tramite (entregado, en_tramite, activo, deleted_at) COMMENT 'Búsqueda por estado de entrega y trámite',
    INDEX idx_fecha_vencimiento (fecha_vencimiento_tramite, en_tramite, activo, deleted_at) COMMENT 'Búsqueda de documentos en trámite próximos a vencer'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relación entre estudiantes y documentos requeridos. Rastrea el estado de entrega de cada documento requerido por estudiante (entregado, en trámite, fecha de entrega). NO almacena archivos digitales, solo la relación y estado. Los archivos digitales se almacenan en documentos_estudiante.';

-- ============================================
-- TABLA: documentos_estudiante
-- ============================================
-- Tabla para almacenar los ARCHIVOS DIGITALES (reflejo del documento físico digitalizado)
-- IMPORTANTE: Esta tabla almacena los archivos digitales subidos al sistema.
-- Es el reflejo del documento físico digitalizado (escaneado, fotografiado, etc.).
-- Tiene relación directa con documentacion (tipo de documento) y estudiantes.
-- Un archivo puede contener un solo documento o múltiples documentos.
-- Ejemplo: Un PDF puede contener el Diploma de Bachiller y el Boletín de Calificaciones.

CREATE TABLE documentos_estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NULL COMMENT 'Estudiante propietario del archivo',
    tipo_documento VARCHAR(50) NULL COMMENT 'Tipo de documento según categoría (INSCRIPCION, LICENCIA, PASANTIA, DESCUENTO, TITULACION, TRASPASO, TRANSFERENCIA, BECA, OTRO). El usuario selecciona el tipo y luego puede elegir un documento específico de ese tipo.',
    documentacion_id INT NULL COMMENT 'Documento específico de la categoría tipo_documento (referencia a documentacion). NULL si el archivo contiene TODOS los documentos del tipo_documento o múltiples documentos de diferentes tipos.',
    nombre_archivo VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo digital',
    ruta_archivo VARCHAR(500) NOT NULL COMMENT 'Ruta del archivo en el servidor',
    extension VARCHAR(10) COMMENT 'Extensión del archivo (pdf, jpg, png, etc.)',
    tipo_mime VARCHAR(100) COMMENT 'Tipo MIME del archivo',
    contiene_multiple_documentos BOOLEAN DEFAULT FALSE COMMENT 'Indica si el archivo contiene múltiples documentos (TRUE) o un solo documento (FALSE). Si es TRUE y documentacion_id es NULL, el archivo contiene TODOS los documentos del tipo_documento.',
    verificado BOOLEAN DEFAULT FALSE COMMENT 'Documento verificado por personal administrativo',
    verificado_por INT COMMENT 'Usuario que verificó el documento',
    fecha_verificacion DATE COMMENT 'Fecha de verificación',
    observaciones_verificacion TEXT COMMENT 'Observaciones de verificación',
    estado ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO') DEFAULT 'PENDIENTE' COMMENT 'Estado del documento: PENDIENTE (pendiente de revisión), APROBADO (aprobado), RECHAZADO (rechazado)',
    motivo_rechazo TEXT COMMENT 'Motivo de rechazo si el estado es RECHAZADO',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (documentacion_id) REFERENCES documentacion(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_tipo_documento (tipo_documento) COMMENT 'Búsqueda por tipo de documento',
    INDEX idx_documentacion_id (documentacion_id) COMMENT 'Búsqueda por documento específico',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_verificado (verificado, estado, activo) COMMENT 'Búsqueda por documentos verificados',
    INDEX idx_contiene_multiple (contiene_multiple_documentos, activo, deleted_at) COMMENT 'Búsqueda de archivos que contienen múltiples documentos',
    INDEX idx_tipo_documentacion (tipo_documento, documentacion_id, activo, deleted_at) COMMENT 'Búsqueda por tipo de documento y documento específico',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_estado (estudiante_id, estado, activo, deleted_at) COMMENT 'Búsqueda por estudiante y estado',
    INDEX idx_estado_activo (estado, activo, deleted_at) COMMENT 'Búsqueda por estado y activo',
    INDEX idx_estudiante_documentacion (estudiante_id, documentacion_id, activo, deleted_at) COMMENT 'Búsqueda por estudiante y tipo de documentación'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Archivos digitales subidos por estudiantes. Es el reflejo del documento físico digitalizado. El usuario selecciona el tipo_documento (INSCRIPCION, LICENCIA, etc.) y luego puede elegir un documento específico de ese tipo (documentacion_id) o subir un archivo que contenga TODOS los documentos del tipo (documentacion_id NULL, contiene_multiple_documentos = TRUE). La relación entre estudiante y documento requerido se registra en estudiantes_documentos_entrega.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
