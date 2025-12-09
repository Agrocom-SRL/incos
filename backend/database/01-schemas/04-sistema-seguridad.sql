-- ============================================
-- SISTEMA DE SEGURIDAD
-- Sistema de Gestión Académica - Instituto INCOS
-- 3 Tablas: usuarios, roles_permisos, auditoria
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLA: usuarios
-- ============================================

DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Credenciales
    username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre de usuario único',
    email VARCHAR(150) NOT NULL UNIQUE COMMENT 'Email único',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
    
    -- Rol principal
    rol_id INT NOT NULL COMMENT 'Rol principal del usuario',
    
    -- Datos personales básicos
    nombres VARCHAR(150) COMMENT 'Nombres del usuario',
    apellido_paterno VARCHAR(100) COMMENT 'Apellido paterno',
    apellido_materno VARCHAR(100) COMMENT 'Apellido materno',
    foto_url VARCHAR(255) COMMENT 'URL de la foto de perfil',
    
    -- Seguridad
    ultimo_login TIMESTAMP NULL COMMENT 'Última vez que inició sesión',
    intentos_fallidos INT DEFAULT 0 COMMENT 'Intentos fallidos de login consecutivos',
    bloqueado_hasta TIMESTAMP NULL COMMENT 'Bloqueado temporalmente hasta esta fecha/hora',
    debe_cambiar_password BOOLEAN DEFAULT FALSE COMMENT 'Forzar cambio de contraseña en próximo login',
    token_recuperacion VARCHAR(255) COMMENT 'Token para recuperación de contraseña',
    token_recuperacion_expira TIMESTAMP NULL COMMENT 'Expiración del token de recuperación',
    ultimo_cambio_password TIMESTAMP NULL COMMENT 'Última vez que cambió su contraseña',
    
    -- Estado del usuario
    estado ENUM('ACTIVO', 'INACTIVO', 'BLOQUEADO', 'SUSPENDIDO', 'PENDIENTE_ACTIVACION') DEFAULT 'PENDIENTE_ACTIVACION',
    fecha_activacion DATE COMMENT 'Fecha en que se activó el usuario',
    fecha_suspension DATE COMMENT 'Fecha de suspensión',
    fecha_desbloqueo DATE COMMENT 'Fecha programada de desbloqueo',
    motivo_suspension TEXT COMMENT 'Razón de la suspensión',
    
    -- Preferencias
    idioma_preferido VARCHAR(5) DEFAULT 'es' COMMENT 'Idioma de la interfaz (es, en)',
    zona_horaria VARCHAR(50) DEFAULT 'America/La_Paz' COMMENT 'Zona horaria del usuario',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_estado (estado),
    INDEX idx_rol_id (rol_id),
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_ultimo_login (ultimo_login)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Usuarios del sistema';

-- ============================================
-- TABLA: roles_permisos
-- ============================================

DROP TABLE IF EXISTS roles_permisos;

CREATE TABLE roles_permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NOT NULL COMMENT 'ID del rol',
    permiso_id INT NOT NULL COMMENT 'ID del permiso',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Asignación activa/inactiva',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    UNIQUE KEY unique_rol_permiso (rol_id, permiso_id, deleted_at),
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_rol_id (rol_id),
    INDEX idx_permiso_id (permiso_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla pivote roles-permisos (many-to-many)';

-- ============================================
-- TABLA: auditoria
-- ============================================

DROP TABLE IF EXISTS auditoria;

CREATE TABLE auditoria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Identificación del usuario
    usuario_id INT COMMENT 'Usuario que realizó la acción',
    username VARCHAR(50) COMMENT 'Username del usuario (desnormalizado para histórico)',
    
    -- Acción realizada
    accion ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED') NOT NULL,
    tabla VARCHAR(100) COMMENT 'Tabla afectada (si aplica)',
    registro_id INT COMMENT 'ID del registro afectado (si aplica)',
    modulo VARCHAR(50) COMMENT 'Módulo del sistema (ESTUDIANTES, CALIFICACIONES, etc.)',
    
    -- Datos del cambio
    valores_anteriores JSON COMMENT 'Valores antes del cambio (UPDATE/DELETE)',
    valores_nuevos JSON COMMENT 'Valores después del cambio (CREATE/UPDATE)',
    descripcion TEXT COMMENT 'Descripción adicional de la acción',
    
    -- Información del request
    ip_cliente VARCHAR(45) COMMENT 'IP del cliente (IPv4 o IPv6)',
    user_agent TEXT COMMENT 'User agent del navegador',
    metodo_http VARCHAR(10) COMMENT 'GET, POST, PUT, DELETE',
    url VARCHAR(500) COMMENT 'URL del endpoint llamado',
    
    -- Información adicional
    duracion_ms INT COMMENT 'Duración de la operación en milisegundos',
    fue_exitoso BOOLEAN DEFAULT TRUE COMMENT 'Si la operación fue exitosa',
    mensaje_error TEXT COMMENT 'Mensaje de error si falló',
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la acción',
    
    -- Foreign Keys
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices para búsquedas frecuentes
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_tabla (tabla),
    INDEX idx_accion (accion),
    INDEX idx_created_at (created_at),
    INDEX idx_modulo (modulo),
    INDEX idx_registro_id (registro_id),
    INDEX idx_tabla_registro (tabla, registro_id),
    INDEX idx_usuario_fecha (usuario_id, created_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Auditoría de operaciones críticas del sistema';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- TRIGGER: Limpiar intentos fallidos después de login exitoso
-- ============================================

DELIMITER $$

DROP TRIGGER IF EXISTS trg_usuarios_reset_intentos$$

CREATE TRIGGER trg_usuarios_reset_intentos
BEFORE UPDATE ON usuarios
FOR EACH ROW
BEGIN
    -- Si el último login cambió (login exitoso), resetear intentos fallidos
    IF NEW.ultimo_login != OLD.ultimo_login OR (OLD.ultimo_login IS NULL AND NEW.ultimo_login IS NOT NULL) THEN
        SET NEW.intentos_fallidos = 0;
        SET NEW.bloqueado_hasta = NULL;
    END IF;
    
    -- Si se resetean manualmente los intentos, desbloquear
    IF NEW.intentos_fallidos = 0 AND OLD.intentos_fallidos > 0 THEN
        SET NEW.bloqueado_hasta = NULL;
    END IF;
    
    -- Si el estado cambia a ACTIVO, limpiar bloqueos
    IF NEW.estado = 'ACTIVO' AND OLD.estado != 'ACTIVO' THEN
        SET NEW.intentos_fallidos = 0;
        SET NEW.bloqueado_hasta = NULL;
        IF NEW.fecha_activacion IS NULL THEN
            SET NEW.fecha_activacion = CURDATE();
        END IF;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Sistema de seguridad creado exitosamente' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion,
    TABLE_ROWS as filas_aprox
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME IN ('usuarios', 'roles_permisos', 'auditoria')
ORDER BY TABLE_NAME;

-- ============================================
-- NOTAS IMPORTANTES DE SEGURIDAD
-- ============================================

/*
CONFIGURACIÓN DE SEGURIDAD:

1. PASSWORD_HASH:
   - Usar bcrypt con salt rounds = 10
   - Nunca almacenar contraseñas en texto plano
   - Ejemplo en Node.js: bcrypt.hash(password, 10)

2. INTENTOS FALLIDOS:
   - Bloquear después de 5 intentos fallidos
   - Bloqueo temporal: 15 minutos (bloqueado_hasta)
   - Resetear automáticamente después de login exitoso

3. TOKEN RECUPERACIÓN:
   - Generar token aleatorio seguro (UUID v4 o similar)
   - Expiración: 1 hora
   - Usar solo una vez (invalidar después de uso)

4. SESIONES:
   - JWT con expiración de 8 horas
   - Refresh token con expiración de 7 días
   - Invalidar tokens en logout

5. AUDITORÍA:
   - Registrar TODAS las operaciones críticas
   - Logins exitosos y fallidos
   - Cambios en calificaciones, estudiantes, pagos
   - Mantener auditoría por mínimo 2 años

6. RATE LIMITING:
   - Login: 5 intentos por 15 minutos por IP
   - API general: 100 requests por 15 minutos por usuario
*/

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
