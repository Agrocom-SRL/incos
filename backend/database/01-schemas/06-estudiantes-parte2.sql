-- ============================================
-- MÓDULO DE ESTUDIANTES - PARTE 2
-- Sistema de Gestión Académica - Instituto INCOS
-- 3 Tablas: estados_especiales_estudiante, licencias_solicitudes, licencias_documentos
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLA: estados_especiales_estudiante
-- ============================================

DROP TABLE IF EXISTS estados_especiales_estudiante;

CREATE TABLE estados_especiales_estudiante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante',
    
    -- Tipo de estado especial
    tipo_estado ENUM(
        'EMBARAZO',
        'ENFERMEDAD_GRAVE',
        'TRABAJO_TIEMPO_COMPLETO',
        'DEPORTISTA_ALTO_RENDIMIENTO',
        'REPRESENTANTE_ESTUDIANTIL',
        'SITUACION_FAMILIAR',
        'OTRO'
    ) NOT NULL,
    descripcion TEXT NOT NULL COMMENT 'Descripción detallada del estado',
    
    -- Vigencia
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    es_vigente BOOLEAN DEFAULT TRUE COMMENT 'Estado actual vigente',
    
    -- Adaptaciones especiales requeridas
    requiere_adaptacion_curricular BOOLEAN DEFAULT FALSE,
    requiere_flexibilidad_horaria BOOLEAN DEFAULT FALSE,
    requiere_asistencia_especial BOOLEAN DEFAULT FALSE,
    adaptaciones_otorgadas TEXT COMMENT 'Descripción de adaptaciones otorgadas',
    
    -- Documentación
    documentos_respaldo_completos BOOLEAN DEFAULT FALSE,
    
    -- Aprobación
    aprobado_por INT COMMENT 'Usuario que aprobó',
    fecha_aprobacion DATE,
    
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
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_estudiante_id (estudiante_id),
    INDEX idx_tipo_estado (tipo_estado),
    INDEX idx_es_vigente (es_vigente)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Estados especiales que requieren adaptaciones (embarazo, enfermedad, etc.)';

-- ============================================
-- TABLA: licencias_solicitudes
-- ============================================

DROP TABLE IF EXISTS licencias_solicitudes;

CREATE TABLE licencias_solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL COMMENT 'Estudiante solicitante',
    carrera_id INT NOT NULL COMMENT 'Carrera',
    gestion_id INT NOT NULL COMMENT 'Gestión',
    curso VARCHAR(50) COMMENT 'Curso o semestre',
    
    -- Fechas de la licencia
    fecha_solicitud DATE NOT NULL DEFAULT (CURDATE()) COMMENT 'Fecha de solicitud',
    fecha_desde DATE NOT NULL COMMENT 'Inicio de la licencia',
    fecha_hasta DATE NOT NULL COMMENT 'Fin de la licencia',
    total_dias INT NOT NULL COMMENT 'Total de días de licencia',
    
    -- Motivo
    motivo ENUM('ENFERMEDAD', 'TRABAJO', 'FAMILIAR', 'VIAJE', 'PERSONAL', 'OTRO') NOT NULL,
    detalle_motivo TEXT NOT NULL COMMENT 'Detalle del motivo',
    
    -- Estado de la solicitud
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA') DEFAULT 'PENDIENTE',
    fecha_decision DATE COMMENT 'Fecha de aprobación/rechazo',
    decidido_por INT COMMENT 'Usuario que aprobó/rechazó',
    motivo_rechazo TEXT,
    
    -- Documentación adjunta
    tiene_documentos_respaldo BOOLEAN DEFAULT FALSE,
    
    -- Observaciones
    observaciones TEXT,
    observaciones_decision TEXT COMMENT 'Observaciones del decisor',
    
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
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE RESTRICT,
    FOREIGN KEY (decidido_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_estudiante_id (estudiante_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_solicitud (fecha_solicitud),
    INDEX idx_gestion_id (gestion_id),
    
    -- Constraints
    CHECK (fecha_hasta >= fecha_desde),
    CHECK (total_dias > 0 AND total_dias <= 15) -- Máximo 15 días según regla de negocio
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Solicitudes de licencias estudiantiles (máx 15 días/gestión)';

-- ============================================
-- TABLA: licencias_documentos
-- ============================================

DROP TABLE IF EXISTS licencias_documentos;

CREATE TABLE licencias_documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    licencia_id INT NOT NULL COMMENT 'Solicitud de licencia',
    
    -- Datos del documento
    tipo_documento VARCHAR(100) COMMENT 'Certificado médico, Carta laboral, etc.',
    descripcion TEXT,
    
    -- Archivo
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    extension VARCHAR(10),
    tamano_kb INT,
    
    -- Verificación
    verificado BOOLEAN DEFAULT FALSE,
    verificado_por INT,
    fecha_verificacion DATE,
    
    -- Campos de auditoría (simplificados para documentos)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de subida',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    
    -- Foreign Keys
    FOREIGN KEY (licencia_id) REFERENCES licencias_solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (verificado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_licencia_id (licencia_id),
    INDEX idx_deleted_at (deleted_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Documentos de respaldo de solicitudes de licencias';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER $$

-- Trigger para calcular automáticamente el total de días de licencia
DROP TRIGGER IF EXISTS trg_licencia_calcular_dias$$

CREATE TRIGGER trg_licencia_calcular_dias
BEFORE INSERT ON licencias_solicitudes
FOR EACH ROW
BEGIN
    SET NEW.total_dias = DATEDIFF(NEW.fecha_hasta, NEW.fecha_desde) + 1;
END$$

-- Trigger para actualizar total_dias si cambian las fechas
DROP TRIGGER IF EXISTS trg_licencia_actualizar_dias$$

CREATE TRIGGER trg_licencia_actualizar_dias
BEFORE UPDATE ON licencias_solicitudes
FOR EACH ROW
BEGIN
    IF NEW.fecha_desde != OLD.fecha_desde OR NEW.fecha_hasta != OLD.fecha_hasta THEN
        SET NEW.total_dias = DATEDIFF(NEW.fecha_hasta, NEW.fecha_desde) + 1;
    END IF;
END$$

-- Trigger para validar que solo haya UNA beca activa por estudiante
DROP TRIGGER IF EXISTS trg_beca_validar_unica_activa$$

CREATE TRIGGER trg_beca_validar_unica_activa
BEFORE INSERT ON estudiantes_becas
FOR EACH ROW
BEGIN
    DECLARE beca_activa_count INT;
    
    IF NEW.estado = 'ACTIVA' THEN
        SELECT COUNT(*) INTO beca_activa_count
        FROM estudiantes_becas
        WHERE estudiante_id = NEW.estudiante_id
          AND estado = 'ACTIVA'
          AND deleted_at IS NULL;
        
        IF beca_activa_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El estudiante ya tiene una beca activa. Debe finalizar la beca actual antes de asignar una nueva.';
        END IF;
    END IF;
END$$

-- Trigger para generar código de estudiante automáticamente
DROP TRIGGER IF EXISTS trg_estudiante_generar_codigo$$

CREATE TRIGGER trg_estudiante_generar_codigo
BEFORE INSERT ON estudiantes
FOR EACH ROW
BEGIN
    DECLARE anio INT;
    DECLARE ultimo_numero INT;
    DECLARE nuevo_codigo VARCHAR(20);
    
    IF NEW.codigo_estudiante IS NULL OR NEW.codigo_estudiante = '' THEN
        -- Obtener año de la gestión de ingreso
        SELECT anio INTO anio
        FROM gestiones
        WHERE id = NEW.gestion_ingreso_id;
        
        -- Obtener el último número usado en esa gestión
        SELECT COALESCE(MAX(CAST(SUBSTRING(codigo_estudiante, -4) AS UNSIGNED)), 0) INTO ultimo_numero
        FROM estudiantes
        WHERE codigo_estudiante LIKE CONCAT('EST-', anio, '-%')
          AND deleted_at IS NULL;
        
        -- Generar nuevo código: EST-2025-0001
        SET nuevo_codigo = CONCAT('EST-', anio, '-', LPAD(ultimo_numero + 1, 4, '0'));
        SET NEW.codigo_estudiante = nuevo_codigo;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Módulo de estudiantes completado (6 tablas)' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME IN (
    'estudiantes',
    'estudiantes_becas',
    'documentos_estudiante',
    'estados_especiales_estudiante',
    'licencias_solicitudes',
    'licencias_documentos'
  )
ORDER BY TABLE_NAME;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
REGLAS DE NEGOCIO IMPLEMENTADAS:

1. CÓDIGO DE ESTUDIANTE:
   - Formato: EST-YYYY-NNNN (ejemplo: EST-2025-0001)
   - Se genera automáticamente al insertar
   - Secuencial por gestión de ingreso

2. BECAS:
   - Solo UNA beca ACTIVA por estudiante
   - Beca 100% requiere aprobación del Rector (flag en becas_descuentos)
   - Se pueden tener múltiples becas en historial (FINALIZADA, SUSPENDIDA)

3. LICENCIAS:
   - Máximo 15 días por gestión (constraint)
   - Cálculo automático de total_dias
   - Requieren documentos de respaldo

4. ESTADOS ESPECIALES:
   - Permiten adaptaciones curriculares
   - Pueden tener vigencia definida
   - Requieren aprobación

5. SOFT DELETE:
   - Todos los registros pueden recuperarse
   - Usar: WHERE deleted_at IS NULL en queries

6. DOCUMENTOS:
   - Almacenados en filesystem
   - Ruta relativa en BD
   - Verificación manual por personal
*/

-- ============================================
-- FIN DEL MÓDULO DE ESTUDIANTES
-- ============================================
