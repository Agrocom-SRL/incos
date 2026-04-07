-- ============================================
-- SISTEMA DE SEGURIDAD
-- Sistema de Gestión Académica - Instituto INCOS
-- Tablas: roles, permisos, usuarios, roles_permisos,
--         usuarios_permisos, sesiones, configuracion_sistema
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS usuarios_permisos;
DROP TABLE IF EXISTS sesiones;
DROP TABLE IF EXISTS roles_permisos;
DROP TABLE IF EXISTS permiso_acciones;
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
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único',
    codigo VARCHAR(50) NOT NULL COMMENT 'Código único del rol. Ejemplos: RECTOR, DIR_ACADEMICO, DIR_ADMIN, SEC_ACADEMICA, SEC_ADMIN, DOCENTE, ESTUDIANTE',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo visible en el sistema',
    nivel_acceso INT DEFAULT 1 COMMENT 'Nivel jerárquico: 1=Estudiante, 2=Docente, 3=Secretaria, 4=Director, 5=Rector/Admin',
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
    INDEX idx_codigo (codigo),
    INDEX idx_nombre (nombre),
    INDEX idx_nivel_acceso (nivel_acceso),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Roles del sistema (RBAC)';

-- ============================================
-- TABLA: permisos
-- ============================================

CREATE TABLE permisos (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único',
    codigo VARCHAR(250) NOT NULL COMMENT 'Código de dominio: matricula.admision.ver, academico.calificacion.registrar. Coincide con el campo permiso en routes.jsx del frontend.',
    nombre VARCHAR(150) NOT NULL COMMENT 'Nombre legible para el panel de administración. Ejemplo: Ver Admisiones, Registrar Calificaciones',
    descripcion TEXT NULL COMMENT 'Descripción detallada de qué permite este permiso',
    dominio VARCHAR(50) NOT NULL COMMENT 'Dominio de negocio estable. Valores: MATRICULA, ACADEMICO, DOCENTES, FINANZAS, INSTITUCIONAL, REPORTES, SEGURIDAD. No cambia aunque el menú del frontend se reorganice.',
    modulo VARCHAR(50) NOT NULL COMMENT 'Subdominio técnico. Coincide con menu.module del frontend: MAT, ACA, DOC, FIN, INST, REP, SEG. Puede cambiar si se reorganiza el sidebar.',
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
    INDEX idx_codigo (codigo),
    INDEX idx_dominio (dominio),
    INDEX idx_modulo (modulo),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Permisos del sistema — códigos alineados al campo permiso de routes.jsx. Desacoplados del menú frontend.';

-- ============================================
-- TABLA: permiso_acciones
-- ============================================

CREATE TABLE permiso_acciones (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único',
    permiso_id INT NULL COMMENT 'Permiso al que aplica esta acción válida (NULL permite flexibilidad en migraciones)',
    accion ENUM('VER','CREAR','EDITAR','ELIMINAR','APROBAR','EXPORTAR')
        NOT NULL COMMENT 'Acción válida para este permiso según las capacidades reales del sistema',
    
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
    
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE SET NULL,
    
    -- Índices esenciales
    INDEX idx_permiso_id (permiso_id) COMMENT 'Búsqueda por permiso (JOIN frecuente)',
    INDEX idx_accion (accion) COMMENT 'Filtro por tipo de acción',
    INDEX idx_permiso_accion (permiso_id, accion) COMMENT 'Consulta de combinación permiso-acción',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de acciones válidas por permiso.
         Define qué checkboxes mostrar en el PermisosDominioPicker.
         ADMIN_SISTEMA debe tener exactamente todas las filas de esta tabla.
         Una asignación en roles_permisos solo es válida si existe aquí.';

-- ============================================
-- TABLA: usuarios
-- ============================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único',
    username VARCHAR(50) NOT NULL COMMENT 'Nombre de usuario para login',
    email VARCHAR(150) NOT NULL COMMENT 'Email institucional',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
    foto_url VARCHAR(255) NULL COMMENT 'URL de la foto de perfil',
    rol_id INT NULL COMMENT 'Rol principal del usuario',
    referencia_id INT NULL COMMENT 'ID en la tabla específica según tipo_referencia. Para RECTOR/DIRECTOR/SECRETARIA apunta a personal.id. Para DOCENTE apunta a docentes.id (tabla futura). Para ESTUDIANTE apunta a estudiantes.id (tabla futura).',
    tipo_referencia ENUM('ESTUDIANTE','DOCENTE','RECTOR','DIRECTOR','SECRETARIA') NULL COMMENT 'Tipo de referencia polimórfica. Define en qué tabla buscar el referencia_id para obtener datos del perfil.',
    estado ENUM('BLOQUEADO','SUSPENDIDO','RETIRADO') NULL COMMENT 'Estado restrictivo. NULL significa usuario activo normal.',
    fecha_cambio_estado DATE NULL COMMENT 'Fecha del último cambio de estado',
    motivo_cambio_estado TEXT NULL COMMENT 'Razón documentada del cambio de estado',
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
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL,
    INDEX idx_rol_id (rol_id),
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_referencia (referencia_id, tipo_referencia),
    INDEX idx_tipo_referencia (tipo_referencia),
    INDEX idx_estado (estado),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_rol_estado (rol_id, estado, activo, deleted_at),
    INDEX idx_email_activo (email, activo, deleted_at),
    INDEX idx_username_activo (username, activo, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Usuarios del sistema con referencia polimórfica al perfil';

-- ============================================
-- TABLA: roles_permisos
-- ============================================

CREATE TABLE roles_permisos (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único',
    rol_id INT NULL COMMENT 'Rol al que se asigna el permiso',
    permiso_id INT NULL COMMENT 'Permiso asignado al rol',
    accion ENUM('VER','CREAR','EDITAR','ELIMINAR','APROBAR','EXPORTAR') NOT NULL COMMENT 'Acción específica permitida para esta combinación rol-permiso',
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
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE SET NULL,
    INDEX idx_rol_permiso_accion (rol_id, permiso_id, accion),
    INDEX idx_rol_id (rol_id),
    INDEX idx_permiso_id (permiso_id),
    INDEX idx_accion (accion),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_rol_activo (rol_id, activo, deleted_at),
    INDEX idx_permiso_activo (permiso_id, activo, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignación de permisos por rol con acción específica (RBAC)';

-- ============================================
-- TABLA: usuarios_permisos
-- ============================================

CREATE TABLE usuarios_permisos (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único',
    usuario_id INT NULL COMMENT 'Usuario al que aplica el override',
    permiso_id INT NULL COMMENT 'Permiso afectado por el override',
    accion ENUM('VER','CREAR','EDITAR','ELIMINAR','APROBAR','EXPORTAR') NOT NULL COMMENT 'Acción específica del override',
    tipo ENUM('GRANT','REVOKE') NOT NULL COMMENT 'GRANT: otorgar permiso extra que el rol no tiene. REVOKE: quitar un permiso que el rol sí tiene.',
    motivo TEXT NULL COMMENT 'Razón documentada del override. Obligatorio en implementación, opcional en schema.',
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
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE SET NULL,
    INDEX idx_usuario_permiso_accion (usuario_id, permiso_id, accion),
    INDEX idx_tipo (tipo),
    INDEX idx_usuario_activo (usuario_id, activo, deleted_at),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Overrides de permisos por usuario individual. GRANT agrega, REVOKE quita sobre el rol base.';

-- ============================================
-- TABLA: sesiones
-- ============================================

CREATE TABLE sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único',
    usuario_id INT NULL COMMENT 'Usuario propietario de la sesión',
    token_sesion VARCHAR(500) NULL COMMENT 'JWT activo de la sesión. Permite invalidación forzada sin esperar expiración del token.',
    token_recuperacion VARCHAR(255) NULL COMMENT 'Token para recuperación de contraseña. La expiración se maneja dentro del propio token.',
    fecha_expiracion TIMESTAMP NULL COMMENT 'Fecha de expiración de la sesión activa',
    ultimo_login TIMESTAMP NULL COMMENT 'Timestamp del último inicio de sesión exitoso',
    ip_ultimo_login VARCHAR(45) NULL COMMENT 'IP del último login. Soporta IPv4 e IPv6 (máx 45 chars)',
    dispositivo VARCHAR(50) NULL COMMENT 'Tipo de dispositivo: MOVIL, TABLET, DESKTOP',
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
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_token_sesion (token_sesion(255)),
    INDEX idx_ultimo_login (ultimo_login),
    INDEX idx_fecha_expiracion (fecha_expiracion),
    INDEX idx_ip_ultimo_login (ip_ultimo_login),
    INDEX idx_dispositivo (dispositivo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sesiones de usuarios. Permite invalidación de JWT sin esperar expiración (stateful auth).';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
