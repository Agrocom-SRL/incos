-- ============================================
-- MÓDULO DE PAGOS
-- Sistema de Gestión Académica - Instituto INCOS
-- 2 Tablas: pagos_aranceles, detalle_pagos
-- NORMALIZACIÓN: Estructura normalizada según 3FN
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS detalle_pagos;
DROP TABLE IF EXISTS pagos_aranceles;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: pagos_aranceles
-- ============================================

CREATE TABLE pagos_aranceles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relaciones
    estudiante_id INT NOT NULL COMMENT 'Estudiante que realiza el pago',
    inscripcion_id INT NOT NULL COMMENT 'Inscripción asociada',
    gestion_id INT NOT NULL COMMENT 'Gestión académica',
    
    -- Datos del pago
    numero_recibo VARCHAR(50) COMMENT 'Número de recibo único',
    fecha_pago DATE NOT NULL COMMENT 'Fecha del pago',
    
    -- Montos (Aporte anualizado de 400 Bs)
    monto_total DECIMAL(10,2) NOT NULL DEFAULT 400.00 COMMENT 'Aporte anualizado: 400 Bs',
    descuento_beca DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Descuento por beca (automático o manual)',
    descuento_otros DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Otros descuentos',
    monto_descuento DECIMAL(10,2) GENERATED ALWAYS AS (descuento_beca + descuento_otros) STORED,
    monto_a_pagar DECIMAL(10,2) GENERATED ALWAYS AS (monto_total - descuento_beca - descuento_otros) STORED,
    monto_pagado DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Monto efectivamente pagado',
    
    -- Método de pago
    metodo_pago ENUM('EFECTIVO', 'TRANSFERENCIA', 'DEPOSITO', 'TARJETA', 'QR', 'OTRO') NOT NULL,
    numero_transaccion VARCHAR(100) COMMENT 'Número de transacción/depósito',
    banco VARCHAR(100) COMMENT 'Banco (si aplica)',
    
    -- Concepto
    concepto TEXT COMMENT 'Concepto del pago',
    periodo_pago VARCHAR(50) COMMENT 'Periodo que cubre (Ej: Año 2025)',
    
    -- Estado del pago
    estado ENUM('PENDIENTE', 'PAGADO', 'PARCIAL', 'VENCIDO', 'ANULADO') DEFAULT 'PENDIENTE',
    fecha_vencimiento DATE COMMENT 'Fecha de vencimiento',
    
    -- Validación
    validado BOOLEAN DEFAULT FALSE COMMENT 'Pago validado por personal',
    validado_por INT COMMENT 'Usuario que validó el pago',
    fecha_validacion DATE COMMENT 'Fecha de validación',
    
    -- Comprobante
    comprobante_url VARCHAR(255) COMMENT 'URL del comprobante escaneado',
    
    -- Observaciones
    observaciones TEXT,
    motivo_anulacion TEXT COMMENT 'Motivo de anulación (si aplica)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys (SET NULL para facilitar migraciones y mantener historial de pagos)
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (validado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_estudiante_id (estudiante_id),
    INDEX idx_inscripcion_id (inscripcion_id),
    INDEX idx_gestion_id (gestion_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_pago (fecha_pago),
    INDEX idx_fecha_vencimiento (fecha_vencimiento),
    INDEX idx_numero_recibo (numero_recibo),
    
    -- Constraints
    CHECK (monto_total >= 0),
    CHECK (descuento_beca >= 0),
    CHECK (descuento_otros >= 0),
    CHECK (monto_pagado >= 0),
    CHECK (monto_pagado <= monto_total)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Pagos de aranceles de estudiantes';

-- ============================================
-- TABLA: detalle_pagos
-- ============================================

CREATE TABLE detalle_pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relación
    pago_id INT NOT NULL COMMENT 'Pago principal',
    
    -- Detalle del concepto
    concepto VARCHAR(200) NOT NULL COMMENT 'MATRICULA, MENSUALIDAD, EXAMEN, CERTIFICADO, etc.',
    descripcion TEXT COMMENT 'Descripción adicional',
    
    -- Montos
    cantidad INT DEFAULT 1 COMMENT 'Cantidad de items',
    precio_unitario DECIMAL(10,2) NOT NULL COMMENT 'Precio unitario',
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    descuento DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Descuento aplicado a este item',
    total DECIMAL(10,2) GENERATED ALWAYS AS (subtotal - descuento) STORED,
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- Foreign Keys
    FOREIGN KEY (pago_id) REFERENCES pagos_aranceles(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_activo (activo),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_pago_id (pago_id),
    INDEX idx_concepto (concepto),
    
    -- Constraints
    CHECK (cantidad > 0),
    CHECK (precio_unitario >= 0),
    CHECK (descuento >= 0)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Detalle de conceptos pagados';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER $$

-- Trigger para generar número de recibo automáticamente
DROP TRIGGER IF EXISTS trg_pago_generar_recibo$$

CREATE TRIGGER trg_pago_generar_recibo
BEFORE INSERT ON pagos_aranceles
FOR EACH ROW
BEGIN
    DECLARE anio INT;
    DECLARE ultimo_numero INT;
    DECLARE nuevo_recibo VARCHAR(50);
    
    IF NEW.numero_recibo IS NULL OR NEW.numero_recibo = '' THEN
        SET anio = YEAR(NEW.fecha_pago);
        
        SELECT COALESCE(MAX(CAST(SUBSTRING(numero_recibo, -6) AS UNSIGNED)), 0) INTO ultimo_numero
        FROM pagos_aranceles
        WHERE numero_recibo LIKE CONCAT('REC-', anio, '-%')
          AND deleted_at IS NULL;
        
        SET nuevo_recibo = CONCAT('REC-', anio, '-', LPAD(ultimo_numero + 1, 6, '0'));
        SET NEW.numero_recibo = nuevo_recibo;
    END IF;
END$$

DELIMITER ;

SELECT 'Módulo de pagos creado (2 tablas)' as mensaje;
