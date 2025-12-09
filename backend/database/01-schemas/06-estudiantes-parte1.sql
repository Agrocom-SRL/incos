-- ============================================
-- MÓDULO DE ESTUDIANTES
-- Sistema de Gestión Académica - Instituto INCOS
-- 6 Tablas: estudiantes, estudiantes_becas, documentos_estudiante,
--           estados_especiales_estudiante, licencias_solicitudes, licencias_documentos
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLA: estudiantes
-- ============================================

DROP TABLE IF EXISTS estudiantes;

CREATE TABLE estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Código único del estudiante
    codigo_estudiante VARCHAR(20) NOT NULL UNIQUE COMMENT 'EST-2025-0001',
    
    -- Identificación
    ci VARCHAR(15) NOT NULL COMMENT 'Cédula de identidad sin guiones',
    expedicion VARCHAR(5) NOT NULL COMMENT 'SC, LP, CB, OR, PT, TJ, CH, BE, PD',
    complemento VARCHAR(10) COMMENT 'Complemento del CI (1A, 2B, etc.)',
    tipo_documento ENUM('CI', 'PASAPORTE', 'EXTRANJERO') DEFAULT 'CI',
    libreta_militar VARCHAR(50) COMMENT 'Número de libreta militar (varones)',
    
    -- Datos personales
    nombres VARCHAR(150) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    genero ENUM('M', 'F', 'OTRO') NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    
    -- Lugar de nacimiento
    pais_nacimiento_id INT,
    departamento_nacimiento_id INT,
    provincia_nacimiento_id INT,
    municipio_nacimiento_id INT,
    comunidad_nacimiento_id INT,
    localidad_nacimiento_id INT,
    
    -- Información adicional
    idioma_natal_id INT COMMENT 'Idioma materno',
    estado_civil_id INT,
    tipo_sangre_id INT,
    nacionalidad VARCHAR(50) DEFAULT 'Boliviana',
    
    -- Discapacidad
    tiene_discapacidad BOOLEAN DEFAULT FALSE,
    tipo_discapacidad_id INT,
    grado_discapacidad ENUM('LEVE', 'MODERADA', 'GRAVE', 'MUY_GRAVE') COMMENT 'Grado de discapacidad',
    carnet_discapacidad VARCHAR(50) COMMENT 'Número de carnet de discapacidad',
    porcentaje_discapacidad DECIMAL(5,2) COMMENT 'Porcentaje de discapacidad',
    
    -- Nacionalidad adicional
    tiene_doble_nacionalidad BOOLEAN DEFAULT FALSE,
    pais_segunda_nacionalidad_id INT,
    
    -- Contacto
    email VARCHAR(150) UNIQUE COMMENT 'Email institucional o personal',
    email_secundario VARCHAR(150),
    celular VARCHAR(20) NOT NULL,
    telefono_fijo VARCHAR(20),
    
    -- Dirección actual
    direccion_actual TEXT,
    zona_barrio VARCHAR(100),
    ciudad_residencia VARCHAR(100),
    localidad_id INT,
    departamento_residencia_id INT,
    pais_residencia_id INT DEFAULT 1 COMMENT 'Bolivia por defecto',
    
    -- Redes sociales (opcional)
    facebook VARCHAR(100),
    instagram VARCHAR(100),
    whatsapp VARCHAR(20),
    
    -- Información de contacto de emergencia
    contacto_emergencia_nombre VARCHAR(150),
    contacto_emergencia_relacion VARCHAR(50) COMMENT 'Padre, Madre, Hermano, etc.',
    contacto_emergencia_telefono VARCHAR(20),
    
    -- Datos académicos
    carrera_id INT NOT NULL COMMENT 'Carrera en la que está inscrito',
    gestion_ingreso_id INT NOT NULL COMMENT 'Gestión en la que ingresó',
    turno_preferido VARCHAR(20) COMMENT 'MAÑANA, TARDE, NOCHE',
    
    -- Estado académico
    estado_academico ENUM('REGULAR', 'NIVELACION', 'RETIRADO', 'EGRESADO', 'ABANDONO') DEFAULT 'REGULAR',
    fecha_egreso DATE COMMENT 'Fecha de egreso',
    motivo_retiro TEXT COMMENT 'Motivo de retiro/abandono',
    fecha_retiro DATE,
    
    -- Datos de ingreso
    unidad_educativa_procedencia VARCHAR(200) COMMENT 'Colegio de procedencia',
    anio_egreso_secundaria INT,
    modalidad_ingreso ENUM('EXAMEN', 'DIRECTO', 'TRANSFERENCIA', 'CONVENIO') DEFAULT 'DIRECTO',
    
    -- Información económica
    trabaja BOOLEAN DEFAULT FALSE,
    lugar_trabajo VARCHAR(200),
    ocupacion VARCHAR(100),
    ingreso_mensual_aproximado DECIMAL(10,2),
    
    -- Datos familiares
    nombre_padre VARCHAR(150),
    ocupacion_padre VARCHAR(100),
    telefono_padre VARCHAR(20),
    nombre_madre VARCHAR(150),
    ocupacion_madre VARCHAR(100),
    telefono_madre VARCHAR(20),
    vive_con ENUM('AMBOS_PADRES', 'MADRE', 'PADRE', 'OTROS_FAMILIARES', 'SOLO', 'OTRO'),
    
    -- Fotografía
    foto_url VARCHAR(255) COMMENT 'URL de la fotografía del estudiante',
    
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
    FOREIGN KEY (pais_nacimiento_id) REFERENCES paises(id) ON DELETE SET NULL,
    FOREIGN KEY (departamento_nacimiento_id) REFERENCES departamentos(id) ON DELETE SET NULL,
    FOREIGN KEY (provincia_nacimiento_id) REFERENCES provincias(id) ON DELETE SET NULL,
    FOREIGN KEY (municipio_nacimiento_id) REFERENCES municipios(id) ON DELETE SET NULL,
    FOREIGN KEY (comunidad_nacimiento_id) REFERENCES comunidades(id) ON DELETE SET NULL,
    FOREIGN KEY (localidad_nacimiento_id) REFERENCES localidades(id) ON DELETE SET NULL,
    FOREIGN KEY (idioma_natal_id) REFERENCES idiomas(id) ON DELETE SET NULL,
    FOREIGN KEY (estado_civil_id) REFERENCES estados_civiles(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_sangre_id) REFERENCES tipos_sangre(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_discapacidad_id) REFERENCES tipos_discapacidad(id) ON DELETE SET NULL,
    FOREIGN KEY (pais_segunda_nacionalidad_id) REFERENCES paises(id) ON DELETE SET NULL,
    FOREIGN KEY (localidad_id) REFERENCES localidades(id) ON DELETE SET NULL,
    FOREIGN KEY (departamento_residencia_id) REFERENCES departamentos(id) ON DELETE SET NULL,
    FOREIGN KEY (pais_residencia_id) REFERENCES paises(id) ON DELETE SET NULL,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT,
    FOREIGN KEY (gestion_ingreso_id) REFERENCES gestiones(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    UNIQUE KEY unique_ci_expedicion (ci, expedicion, deleted_at),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_codigo_estudiante (codigo_estudiante),
    INDEX idx_estado_academico (estado_academico),
    INDEX idx_carrera_id (carrera_id),
    INDEX idx_email (email),
    INDEX idx_nombres_apellidos (nombres, apellido_paterno, apellido_materno)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Estudiantes del instituto';

-- ============================================
-- TABLA: estudiantes_becas
-- ============================================

DROP TABLE IF EXISTS estudiantes_becas;

CREATE TABLE estudiantes_becas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante beneficiario',
    beca_descuento_id INT NOT NULL COMMENT 'Tipo de beca/descuento',
    gestion_id INT NOT NULL COMMENT 'Gestión en la que se otorga',
    
    -- Detalles de la beca
    porcentaje DECIMAL(5,2) NOT NULL COMMENT 'Porcentaje de descuento otorgado',
    fecha_inicio DATE NOT NULL COMMENT 'Fecha de inicio de la beca',
    fecha_fin DATE COMMENT 'Fecha de fin de la beca',
    
    -- Estado de la beca
    estado ENUM('PENDIENTE', 'ACTIVA', 'SUSPENDIDA', 'FINALIZADA', 'RECHAZADA') DEFAULT 'PENDIENTE',
    motivo_suspension TEXT COMMENT 'Motivo de suspensión',
    fecha_suspension DATE,
    
    -- Aprobación
    requiere_aprobacion_rector BOOLEAN DEFAULT FALSE,
    aprobada_por INT COMMENT 'Usuario que aprobó',
    fecha_aprobacion DATE,
    observaciones_aprobacion TEXT,
    
    -- Documentación
    documentos_completos BOOLEAN DEFAULT FALSE COMMENT 'Documentación entregada completa',
    fecha_entrega_documentos DATE,
    
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
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE RESTRICT,
    FOREIGN KEY (beca_descuento_id) REFERENCES becas_descuentos(id) ON DELETE RESTRICT,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE RESTRICT,
    FOREIGN KEY (aprobada_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_estudiante_id (estudiante_id),
    INDEX idx_estado (estado),
    INDEX idx_gestion_id (gestion_id),
    
    -- Constraints
    CHECK (porcentaje >= 0 AND porcentaje <= 100)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Becas y descuentos asignados a estudiantes';

-- ============================================
-- TABLA: documentos_estudiante
-- ============================================

DROP TABLE IF EXISTS documentos_estudiante;

CREATE TABLE documentos_estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante',
    
    -- Tipo de documento
    tipo_documento ENUM(
        'CEDULA_IDENTIDAD',
        'CERTIFICADO_NACIMIENTO',
        'TITULO_BACHILLER',
        'LIBRETA_MILITAR',
        'FOTO_CARNET',
        'CERTIFICADO_MEDICO',
        'CARNET_DISCAPACIDAD',
        'COMPROBANTE_PAGO',
        'OTRO'
    ) NOT NULL,
    descripcion TEXT COMMENT 'Descripción adicional del documento',
    
    -- Archivo
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL COMMENT 'Ruta completa del archivo',
    extension VARCHAR(10) COMMENT 'pdf, jpg, png, etc.',
    tamano_kb INT COMMENT 'Tamaño en kilobytes',
    
    -- Verificación
    verificado BOOLEAN DEFAULT FALSE COMMENT 'Documento verificado por personal',
    verificado_por INT COMMENT 'Usuario que verificó',
    fecha_verificacion DATE,
    observaciones_verificacion TEXT,
    
    -- Estado
    estado ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REQUERIDO') DEFAULT 'PENDIENTE',
    motivo_rechazo TEXT,
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (verificado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_estudiante_id (estudiante_id),
    INDEX idx_tipo_documento (tipo_documento),
    INDEX idx_estado (estado)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Documentos digitalizados de estudiantes';

-- ============================================
-- Continuará en parte 2...
-- ============================================

SELECT 'Módulo de estudiantes - Parte 1/2 creada (3 tablas)' as mensaje;
