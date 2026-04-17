-- ============================================
-- PERSONAL E INSTITUCIONAL
-- Sistema de Gestión Académica - Instituto INCOS
-- Tablas: personal, rectores, directores, secretarias
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS secretarias;
DROP TABLE IF EXISTS directores;
DROP TABLE IF EXISTS rectores;
DROP TABLE IF EXISTS personal;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: personal
-- ============================================

CREATE TABLE personal (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único',
    usuario_id INT NULL COMMENT 'Relación con el usuario del sistema en tabla usuarios. NULL mientras el usuario aún no ha sido creado en el sistema.',
    ci VARCHAR(20) NOT NULL COMMENT 'Cédula de identidad',
    expedicion VARCHAR(5) NULL COMMENT 'Lugar de expedición del CI (SC, LP, CB, etc.). Opcional si no se registra.',
    nombres VARCHAR(150) NOT NULL COMMENT 'Nombres completos',
    apellido_paterno VARCHAR(100) NOT NULL COMMENT 'Apellido paterno',
    apellido_materno VARCHAR(100) NULL COMMENT 'Apellido materno (puede estar ausente)',
    fecha_nacimiento DATE NULL COMMENT 'Fecha de nacimiento',
    genero ENUM('MASCULINO','FEMENINO','OTRO') NULL COMMENT 'Género',
    estado_civil_id INT NULL COMMENT 'FK hacia tabla estados_civiles',
    email_personal VARCHAR(150) NULL COMMENT 'Email personal del empleado (distinto del email institucional que está en usuarios.email)',
    telefono VARCHAR(20) NULL COMMENT 'Teléfono fijo',
    celular VARCHAR(20) NULL COMMENT 'Teléfono celular',
    direccion TEXT NULL COMMENT 'Dirección de domicilio completa',
    municipio_id INT NULL COMMENT 'FK hacia tabla municipios',
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
    FOREIGN KEY (estado_civil_id) REFERENCES estados_civiles(id) ON DELETE SET NULL,
    FOREIGN KEY (municipio_id) REFERENCES municipios(id) ON DELETE SET NULL,
    INDEX idx_ci_expedicion (ci, expedicion),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_ci (ci),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_apellidos (apellido_paterno, apellido_materno),
    INDEX idx_municipio (municipio_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla base de personal institucional (rectores, directores, secretarias). Herencia por tabla separada por tipo de cargo.';

-- ============================================
-- TABLA: rectores
-- ============================================

CREATE TABLE rectores (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único',
    personal_id INT NULL COMMENT 'FK hacia personal.id — datos personales del rector',
    titulo_profesional VARCHAR(200) NULL COMMENT 'Título profesional obtenido',
    especialidad VARCHAR(200) NULL COMMENT 'Área de especialidad profesional',
    nivel_academico ENUM('TECNICO','LICENCIATURA','MAESTRIA','DOCTORADO') NULL COMMENT 'Nivel académico más alto alcanzado',
    institucion_egreso VARCHAR(200) NULL COMMENT 'Universidad o instituto de egreso',
    anio_egreso INT NULL COMMENT 'Año de egreso o titulación',
    fecha_nombramiento DATE NULL COMMENT 'Fecha oficial de nombramiento como rector',
    resolucion_nombramiento VARCHAR(100) NULL COMMENT 'Número de resolución ministerial o contrato',
    periodo_mandato_inicio DATE NULL COMMENT 'Inicio del período de gestión',
    periodo_mandato_fin DATE NULL COMMENT 'Fin del período de gestión. NULL = mandato vigente sin fecha definida',
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
    FOREIGN KEY (personal_id) REFERENCES personal(id) ON DELETE SET NULL,
    INDEX idx_personal_id (personal_id),
    INDEX idx_periodo_mandato (periodo_mandato_inicio, periodo_mandato_fin),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Datos específicos del cargo de Rector. Los datos personales están en personal.';

-- ============================================
-- TABLA: directores
-- ============================================

CREATE TABLE directores (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único',
    personal_id INT NULL COMMENT 'FK hacia personal.id — datos personales del director',
    tipo ENUM('ACADEMICO','ADMINISTRATIVO') NOT NULL COMMENT 'Tipo de dirección que ejerce',
    fecha_nombramiento DATE NULL COMMENT 'Fecha de nombramiento como director',
    resolucion_nombramiento VARCHAR(100) NULL COMMENT 'Número de resolución o contrato',
    titulo_profesional VARCHAR(200) NULL COMMENT 'Título profesional',
    especialidad VARCHAR(200) NULL COMMENT 'Área de especialidad',
    nivel_academico ENUM('TECNICO','LICENCIATURA','MAESTRIA','DOCTORADO') NULL COMMENT 'Nivel académico más alto',
    institucion_egreso VARCHAR(200) NULL COMMENT 'Universidad o instituto de egreso',
    anio_egreso INT NULL COMMENT 'Año de egreso',
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
    FOREIGN KEY (personal_id) REFERENCES personal(id) ON DELETE SET NULL,
    INDEX idx_personal_id (personal_id),
    INDEX idx_tipo (tipo),
    INDEX idx_fecha_nombramiento (fecha_nombramiento),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Datos del cargo de Director (Académico o Administrativo). Los datos personales están en personal.';

-- ============================================
-- TABLA: secretarias
-- ============================================

CREATE TABLE secretarias (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único',
    personal_id INT NULL COMMENT 'FK hacia personal.id — datos personales de la secretaria',
    tipo ENUM('ACADEMICA','ADMINISTRATIVA') NOT NULL COMMENT 'Tipo de secretaría que ejerce',
    nivel_academico ENUM('ESTUDIANTE','TECNICO','LICENCIATURA','MAESTRIA','DOCTORADO') NULL COMMENT 'Nivel académico alcanzado',
    fecha_contratacion DATE NULL COMMENT 'Fecha de inicio del contrato laboral',
    fecha_fin_contrato DATE NULL COMMENT 'Fecha de fin de contrato. NULL = contrato indefinido vigente',
    tipo_contrato ENUM('EVENTUAL','TEMPORAL','INDEFINIDO') NULL COMMENT 'Modalidad del contrato laboral',
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
    FOREIGN KEY (personal_id) REFERENCES personal(id) ON DELETE SET NULL,
    INDEX idx_personal_id (personal_id),
    INDEX idx_tipo (tipo),
    INDEX idx_nivel_academico (nivel_academico),
    INDEX idx_tipo_contrato (tipo_contrato),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Datos del cargo de Secretaria (Académica o Administrativa). Los datos personales están en personal.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
