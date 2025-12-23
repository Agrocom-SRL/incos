-- ============================================
-- MÓDULO DE ESTUDIANTES - PARTE 1
-- Sistema de Gestión Académica - Instituto INCOS
-- 3 Tablas: estudiantes, estudiantes_datos_academicos, documentos_estudiante
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS documentos_estudiante;
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
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (estado_civil_id) REFERENCES estados_civiles(id) ON DELETE SET NULL,
    FOREIGN KEY (municipio_residencia_id) REFERENCES municipios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
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
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
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
-- TABLA: documentos_estudiante
-- ============================================

CREATE TABLE documentos_estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NULL COMMENT 'Estudiante (NULL permite flexibilidad en migraciones)',
    documentacion_id INT NULL COMMENT 'Tipo de documentación requerida (referencia a documentacion). NULL si no es documento de inscripción estándar.',
    motivo_documento VARCHAR(200) COMMENT 'Motivo específico del documento (ej: licencia por enfermedad, descuento por promedio, etc.)',
    tipo_referencia ENUM(
        'licencias_solicitudes',
        'estudiantes_becas',
        'pasantias_asignaciones',
        'inscripciones',
        'pagos',
        'transferencias',
        'traspasos',
        'otro'
    ) COMMENT 'Tipo de referencia: indica a qué tabla pertenece el referencia_id (solo se usa cuando referencia_id no es NULL). Para pagos, referencia_id puede apuntar a registros de pago relacionados con estudiantes_datos_economicos. Para transferencias y traspasos, referencia_id apunta a las tablas transferencias y traspasos respectivamente.',
    referencia_id INT COMMENT 'ID de referencia según tipo_referencia (ej: si tipo_referencia es licencias_solicitudes, entonces referencia_id es el id de esa tabla)',
    descripcion TEXT COMMENT 'Descripción del documento',
    nombre_archivo VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo',
    ruta_archivo VARCHAR(500) NOT NULL COMMENT 'Ruta del archivo',
    extension VARCHAR(10) COMMENT 'Extensión del archivo',
    tamano_kb INT COMMENT 'Tamaño en kilobytes',
    verificado BOOLEAN DEFAULT FALSE COMMENT 'Documento verificado',
    verificado_por INT COMMENT 'Usuario que verificó',
    fecha_verificacion DATE COMMENT 'Fecha de verificación',
    observaciones_verificacion TEXT COMMENT 'Observaciones de verificación',
    estado ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO') DEFAULT 'PENDIENTE' COMMENT 'Estado del documento',
    es_original BOOLEAN DEFAULT FALSE COMMENT 'Indica si el documento es original (TRUE) o fotocopia (FALSE). Permite tener el mismo documento dos veces: primero copia, luego original.',
    motivo_rechazo TEXT COMMENT 'Motivo de rechazo',
    
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
    FOREIGN KEY (verificado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_documentacion_id (documentacion_id) COMMENT 'Búsqueda por tipo de documentación',
    INDEX idx_tipo_referencia (tipo_referencia, referencia_id) COMMENT 'Búsqueda por tipo de referencia y ID',
    INDEX idx_referencia (referencia_id, tipo_referencia) COMMENT 'Búsqueda por referencia',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_es_original (es_original, estado, activo) COMMENT 'Búsqueda por tipo de documento (original/fotocopia)',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_documentacion (estudiante_id, documentacion_id, activo, deleted_at) COMMENT 'Búsqueda de documentos por estudiante y tipo de documentación',
    INDEX idx_documentacion_estado (documentacion_id, estado, activo, deleted_at) COMMENT 'Búsqueda por tipo de documentación y estado',
    INDEX idx_verificado (verificado, estado, activo) COMMENT 'Búsqueda por documentos verificados',
    INDEX idx_estado_activo (estado, activo, deleted_at) COMMENT 'Búsqueda por estado y activo'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Documentos digitalizados de estudiantes: inscripción, licencias, pasantías, descuentos, pagos. Relación 1 a muchos (un estudiante puede tener muchos documentos de respaldo). Los pagos pueden ser: inscripción, titulación, traslado de instituto, cambio de carrera. Los documentos de pago están relacionados con estudiantes_datos_economicos.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
