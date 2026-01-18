-- ============================================
-- SISTEMA DE SEGURIDAD
-- Sistema de Gestión Académica - Instituto INCOS
-- Tablas: roles, permisos, usuarios, roles_permisos, sesiones, configuracion_sistema
-- Tablas de usuarios específicos: personal (base), rectores, directores, secretarias
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
DROP TABLE IF EXISTS configuracion_sistema;
DROP TABLE IF EXISTS sesiones;
DROP TABLE IF EXISTS roles_permisos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS permisos;
DROP TABLE IF EXISTS roles;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: roles
-- ============================================

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL COMMENT 'Código único del rol (opcional, puede usarse para validaciones programáticas)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo del rol',
    nivel_acceso INT DEFAULT 1 COMMENT 'Nivel jerárquico (1=bajo, 5=alto) - define qué permisos puede tener',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código',
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_nivel_acceso (nivel_acceso) COMMENT 'Búsqueda por nivel de acceso',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Roles del sistema (RBAC)';

-- ============================================
-- TABLA: permisos
-- ============================================

CREATE TABLE permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(250) NOT NULL COMMENT 'estudiantes.ver, calificaciones.registrar (endpoint interno)',
    modulo VARCHAR(50) NOT NULL COMMENT 'ESTUDIANTES, INSCRIPCIONES, CALIFICACIONES, etc.',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código',
    INDEX idx_modulo (modulo) COMMENT 'Búsqueda por módulo',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Permisos del sistema (RBAC - endpoints internos)';

-- ============================================
-- TABLA: usuarios
-- ============================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL COMMENT 'Nombre de usuario',
    email VARCHAR(150) NOT NULL COMMENT 'Email',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
    foto_url VARCHAR(255) COMMENT 'URL de la foto de perfil',
    rol_id INT NULL COMMENT 'Rol principal del usuario (NULL permite flexibilidad en migraciones)',
    
    referencia_id INT NULL COMMENT 'ID de referencia según tipo_referencia (apunta a personal.id para rectores/directores/secretarias)',
    tipo_referencia ENUM('ESTUDIANTE', 'DOCENTE', 'RECTOR', 'DIRECTOR', 'SECRETARIA') NULL COMMENT 'Tipo de referencia polimórfica',
    
    estado ENUM('BLOQUEADO', 'SUSPENDIDO', 'RETIRADO') NULL COMMENT 'Estado del usuario (NULL = activo)',
    fecha_cambio_estado DATE COMMENT 'Fecha del último cambio de estado',
    motivo_cambio_estado TEXT COMMENT 'Razón del cambio de estado',
    
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_rol_id (rol_id) COMMENT 'Búsqueda por rol',
    INDEX idx_email (email) COMMENT 'Búsqueda por email',
    INDEX idx_username (username) COMMENT 'Búsqueda por username',
    INDEX idx_referencia (referencia_id, tipo_referencia) COMMENT 'Búsqueda por referencia polimórfica',
    INDEX idx_tipo_referencia (tipo_referencia) COMMENT 'Filtrado por tipo de referencia',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_rol_estado (rol_id, estado, activo, deleted_at) COMMENT 'Búsqueda por rol y estado',
    INDEX idx_email_activo (email, activo, deleted_at) COMMENT 'Búsqueda por email y estado',
    INDEX idx_username_activo (username, activo, deleted_at) COMMENT 'Búsqueda por username y estado'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Usuarios del sistema';

-- ============================================
-- TABLA: roles_permisos
-- ============================================

CREATE TABLE roles_permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NULL COMMENT 'ID del rol (NULL permite flexibilidad en migraciones)',
    permiso_id INT NULL COMMENT 'ID del permiso (NULL permite flexibilidad en migraciones)',
    accion ENUM('VER', 'CREAR', 'EDITAR', 'ELIMINAR', 'APROBAR', 'EXPORTAR') NOT NULL COMMENT 'Acción específica permitida para este rol y permiso',
    
    activo BOOLEAN DEFAULT TRUE COMMENT 'Asignación activa/inactiva',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_rol_permiso_accion (rol_id, permiso_id, accion) COMMENT 'Búsqueda por rol, permiso y acción',
    INDEX idx_rol_id (rol_id) COMMENT 'Búsqueda por rol',
    INDEX idx_permiso_id (permiso_id) COMMENT 'Búsqueda por permiso',
    INDEX idx_accion (accion) COMMENT 'Búsqueda por acción',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_rol_activo (rol_id, activo, deleted_at) COMMENT 'Búsqueda de permisos activos por rol',
    INDEX idx_permiso_activo (permiso_id, activo, deleted_at) COMMENT 'Búsqueda de roles activos por permiso'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla pivote roles-permisos (define acción específica por rol y permiso)';

-- ============================================
-- TABLA: sesiones
-- ============================================

CREATE TABLE sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL COMMENT 'Usuario de la sesión (NULL permite flexibilidad en migraciones)',
    
    -- Información de autenticación
    token_sesion VARCHAR(500) COMMENT 'Token JWT o similar de la sesión activa',
    token_recuperacion VARCHAR(255) COMMENT 'Token para recuperación de contraseña (incluye expiración en el token)',
    fecha_expiracion TIMESTAMP NULL COMMENT 'Fecha de expiración de la sesión',
    
    -- Información de acceso
    ultimo_login TIMESTAMP NULL COMMENT 'Última vez que inició sesión',
    ip_ultimo_login VARCHAR(45) COMMENT 'IP del último login (IPv4 o IPv6)',
    dispositivo VARCHAR(50) COMMENT 'Tipo de dispositivo: MOVIL, TABLET, DESKTOP',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_usuario_id (usuario_id) COMMENT 'Búsqueda por usuario',
    INDEX idx_token_sesion (token_sesion(255)) COMMENT 'Búsqueda por token de sesión',
    INDEX idx_ultimo_login (ultimo_login) COMMENT 'Búsqueda por último login',
    INDEX idx_fecha_expiracion (fecha_expiracion) COMMENT 'Búsqueda por fecha de expiración',
    INDEX idx_ip_ultimo_login (ip_ultimo_login) COMMENT 'Búsqueda por IP',
    INDEX idx_dispositivo (dispositivo) COMMENT 'Filtrado por tipo de dispositivo'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sesiones de usuarios del sistema';

-- ============================================
-- TABLA: configuracion_sistema
-- ============================================

CREATE TABLE configuracion_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) NOT NULL COMMENT 'Clave única de configuración (ej: codigo_estudiante_correlativo_2025)',
    valor TEXT NOT NULL COMMENT 'Valor de la configuración',
    tipo ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE') DEFAULT 'STRING' COMMENT 'Tipo de dato del valor',
    descripcion TEXT COMMENT 'Descripción de qué representa esta configuración',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_clave (clave) COMMENT 'Búsqueda por clave',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuración del sistema: guarda settings como correlativos de códigos de estudiantes por gestión, etc.';

-- ============================================
-- TABLAS ESPECÍFICAS POR TIPO DE USUARIO
-- Estructura normalizada: tabla base + herencias específicas
-- ============================================

-- ============================================
-- TABLA BASE: personal
-- Contiene todos los campos comunes
-- ============================================

CREATE TABLE personal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT COMMENT 'Relación con usuario del sistema',
    
    -- Datos personales básicos
    ci VARCHAR(20) NOT NULL COMMENT 'Cédula de identidad',
    expedicion VARCHAR(5) NOT NULL COMMENT 'Expedición del CI (SC, LP, CB, etc.)',
    nombres VARCHAR(150) NOT NULL COMMENT 'Nombres completos',
    apellido_paterno VARCHAR(100) NOT NULL COMMENT 'Apellido paterno',
    apellido_materno VARCHAR(100) COMMENT 'Apellido materno',
    fecha_nacimiento DATE COMMENT 'Fecha de nacimiento',
    genero ENUM('MASCULINO', 'FEMENINO', 'OTRO') COMMENT 'Género',
    estado_civil_id INT COMMENT 'Estado civil',
    
    -- Contacto
    email_personal VARCHAR(150) COMMENT 'Email personal (como referencias de los empleados)',
    telefono VARCHAR(20) COMMENT 'Teléfono fijo',
    celular VARCHAR(20) COMMENT 'Teléfono celular',
    direccion TEXT COMMENT 'Dirección completa',
    municipio_id INT COMMENT 'Municipio de residencia (FK)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (estado_civil_id) REFERENCES estados_civiles(id) ON DELETE SET NULL,
    FOREIGN KEY (municipio_id) REFERENCES municipios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_ci_expedicion (ci, expedicion) COMMENT 'Búsqueda por CI y expedición',
    INDEX idx_usuario_id (usuario_id) COMMENT 'JOIN con usuarios',
    INDEX idx_ci (ci) COMMENT 'Búsqueda por CI',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_apellidos (apellido_paterno, apellido_materno) COMMENT 'Búsqueda por apellidos',
    INDEX idx_municipio (municipio_id) COMMENT 'Búsqueda por municipio'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla base para personal institucional (rectores, directores, secretarias) - solo datos personales y laborales básicos';

-- ============================================
-- TABLA: rectores
-- Herencia nivel 1: solo campos específicos
-- ============================================

CREATE TABLE rectores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    personal_id INT NULL COMMENT 'Referencia a personal.id (NULL permite flexibilidad en migraciones)',
    
    -- Información académica (solo para cargos superiores)
    titulo_profesional VARCHAR(200) COMMENT 'Título profesional',
    especialidad VARCHAR(200) COMMENT 'Especialidad',
    nivel_academico ENUM('TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO') COMMENT 'Nivel académico',
    institucion_egreso VARCHAR(200) COMMENT 'Institución de egreso (universidad o instituto técnico)',
    anio_egreso INT COMMENT 'Año de egreso',
    
    -- Datos específicos del cargo
    fecha_nombramiento DATE COMMENT 'Fecha de nombramiento/contratación',
    resolucion_nombramiento VARCHAR(100) COMMENT 'Resolución o número de contrato',
    periodo_mandato_inicio DATE COMMENT 'Inicio del período de mandato',
    periodo_mandato_fin DATE NULL COMMENT 'Fin del período de mandato (NULL = mandato indefinido)',
    
    -- Foreign Keys
    FOREIGN KEY (personal_id) REFERENCES personal(id) ON DELETE SET NULL,
    
    INDEX idx_personal_id (personal_id) COMMENT 'Búsqueda por personal',
    INDEX idx_periodo_mandato (periodo_mandato_inicio, periodo_mandato_fin) COMMENT 'Búsqueda por período de mandato'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Rector del instituto (hereda de personal) - incluye información académica y datos del mandato';

-- ============================================
-- TABLA: directores
-- Herencia nivel 2: campos específicos + tipo
-- ============================================

CREATE TABLE directores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    personal_id INT NULL COMMENT 'Referencia a personal.id (NULL permite flexibilidad en migraciones)',
    
    -- Datos específicos del cargo
    tipo ENUM('ACADEMICO', 'ADMINISTRATIVO') NOT NULL COMMENT 'Tipo de director',
    fecha_nombramiento DATE COMMENT 'Fecha de nombramiento como director (cuando asumió el cargo)',
    resolucion_nombramiento VARCHAR(100) COMMENT 'Resolución o número de contrato',
    
    -- Información académica (solo para cargos superiores)
    titulo_profesional VARCHAR(200) COMMENT 'Título profesional o técnico',
    especialidad VARCHAR(200) COMMENT 'Especialidad',
    nivel_academico ENUM('TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO') COMMENT 'Nivel académico',
    institucion_egreso VARCHAR(200) COMMENT 'Institución de egreso (universidad o instituto técnico)',
    anio_egreso INT COMMENT 'Año de egreso',
    
    -- Foreign Keys
    FOREIGN KEY (personal_id) REFERENCES personal(id) ON DELETE SET NULL,

    INDEX idx_personal_id (personal_id) COMMENT 'Búsqueda por personal',
    INDEX idx_tipo (tipo) COMMENT 'Filtrado por tipo de director',
    INDEX idx_fecha_nombramiento (fecha_nombramiento) COMMENT 'Búsqueda por fecha de nombramiento'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Directores del instituto (hereda de personal) - incluye información académica y fecha de nombramiento';

-- ============================================
-- TABLA: secretarias
-- Herencia nivel 3: campos específicos + tipo
-- ============================================

CREATE TABLE secretarias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    personal_id INT NULL COMMENT 'Referencia a personal.id (NULL permite flexibilidad en migraciones)',
    
    -- Datos específicos del cargo
    tipo ENUM('ACADEMICA', 'ADMINISTRATIVA') NOT NULL COMMENT 'Tipo de secretaria',
    nivel_academico ENUM('ESTUDIANTE', 'TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO') COMMENT 'Nivel académico',
    
    -- Datos específicos del contrato
    fecha_contratacion DATE COMMENT 'Fecha de contratación',
    fecha_fin_contrato DATE NULL COMMENT 'Fecha de fin de contrato (NULL = contrato indefinido)',
    tipo_contrato ENUM('EVENTUAL', 'TEMPORAL', 'INDEFINIDO') COMMENT 'Tipo de contrato',
    
    -- Foreign Keys
    FOREIGN KEY (personal_id) REFERENCES personal(id) ON DELETE SET NULL,

    INDEX idx_personal_id (personal_id) COMMENT 'Búsqueda por personal',
    INDEX idx_tipo (tipo) COMMENT 'Filtrado por tipo de secretaria',
    INDEX idx_nivel_academico (nivel_academico) COMMENT 'Filtrado por nivel académico',
    INDEX idx_tipo_contrato (tipo_contrato) COMMENT 'Filtrado por tipo de contrato'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Secretarias del instituto (hereda de personal) - datos específicos del contrato';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
