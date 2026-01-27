-- ============================================
-- MÓDULO DE PAGOS
-- Sistema de Gestión Académica - Instituto INCOS
-- Tablas: configuracion_aportes, cuentas_pago, metodos_pago, bancos_autorizados, pago_aporte, pago_cuotas
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden: primero detalle, luego cabecera; con FK deshabilitado el orden no afecta)
DROP TABLE IF EXISTS pago_cuotas;
DROP TABLE IF EXISTS pago_aporte;
DROP TABLE IF EXISTS bancos_autorizados;
DROP TABLE IF EXISTS cuentas_pago;
DROP TABLE IF EXISTS metodos_pago;
DROP TABLE IF EXISTS configuracion_aportes;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: configuracion_aportes
-- Configuración del monto del aporte académico por gestión
-- ============================================

CREATE TABLE configuracion_aportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gestion_id INT NULL COMMENT 'Gestión académica',
    
    -- Configuración
    monto_base DECIMAL(10,2) NOT NULL DEFAULT 400.00 COMMENT 'Monto base del aporte académico para esta gestión',
    aporte_activo BOOLEAN DEFAULT TRUE COMMENT 'Si el aporte está activo para esta gestión',
    
    -- Vigencia
    fecha_inicio DATE NOT NULL COMMENT 'Fecha desde la cual está vigente el aporte',
    fecha_fin DATE COMMENT 'Fecha hasta la cual está vigente (NULL = sin límite)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_aporte_activo (aporte_activo) COMMENT 'Búsqueda de aportes activos',
    INDEX idx_fecha_inicio (fecha_inicio) COMMENT 'Búsqueda por fecha de inicio',
    INDEX idx_fecha_fin (fecha_fin) COMMENT 'Búsqueda por fecha de fin',
    INDEX idx_monto_base (monto_base) COMMENT 'Búsqueda por monto base',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_gestion_activo (gestion_id, aporte_activo, activo, deleted_at) COMMENT 'Búsqueda de aporte activo por gestión'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuración del monto del aporte académico por gestión';

-- ============================================
-- TABLA: metodos_pago
-- Catálogo de métodos de pago disponibles
-- ============================================

CREATE TABLE metodos_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL COMMENT 'Código: EFECTIVO, TRANSFERENCIA, DEPOSITO, TARJETA, QR, TIGO_MONEY, OTRO',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del método de pago',

    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código',
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_codigo_activo (codigo, activo, deleted_at) COMMENT 'Búsqueda por código y estado activo'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de métodos de pago disponibles (EFECTIVO, TRANSFERENCIA, DEPOSITO, TARJETA, QR, TIGO_MONEY, etc.)';

-- ============================================
-- TABLA: bancos_autorizados
-- Bancos autorizados para métodos TRANSFERENCIA y DEPOSITO
-- Según normas bolivianas: solo bancos autorizados por ASFI
-- ============================================

CREATE TABLE bancos_autorizados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metodo_pago_id INT NULL COMMENT 'Método de pago (TRANSFERENCIA o DEPOSITO)',
    codigo VARCHAR(30) NOT NULL COMMENT 'Código del banco según ASFI (ej: BNB, BCP, BCPB, MERCANTIL, UNION)',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre completo del banco según ASFI',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id) ON DELETE SET NULL,
    
    INDEX idx_metodo_pago_id (metodo_pago_id) COMMENT 'Búsqueda por método de pago',
    INDEX idx_codigo (codigo) COMMENT 'Búsqueda por código de banco',
    INDEX idx_nombre (nombre) COMMENT 'Búsqueda por nombre de banco',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_metodo_activo (metodo_pago_id, activo, deleted_at) COMMENT 'Búsqueda de bancos activos por método'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bancos autorizados para métodos TRANSFERENCIA y DEPOSITO según normas ASFI. Tigo Money NO es banco, es método de pago.';

-- ============================================
-- TABLA: cuentas_pago
-- Configuración de datos de cuenta para métodos de pago (QR, TRANSFERENCIA, DEPOSITO, TIGO_MONEY)
-- ============================================

CREATE TABLE cuentas_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metodo_pago_id INT NULL COMMENT 'Método de pago (TRANSFERENCIA, DEPOSITO, QR, TIGO_MONEY)',
    banco_id INT NULL COMMENT 'Banco asociado (para TRANSFERENCIA, DEPOSITO, QR. NULL para TIGO_MONEY)',
    nombre_titular VARCHAR(200) NOT NULL COMMENT 'Nombre completo del titular de la cuenta',
    numero_cuenta VARCHAR(50) COMMENT 'Número de cuenta bancaria (para TRANSFERENCIA, DEPOSITO, QR)',
    numero_celular VARCHAR(20) COMMENT 'Número de celular del titular (para TIGO_MONEY)',
    qr_imagen_url VARCHAR(500) COMMENT 'Ruta/URL de la imagen del código QR activo (solo para método QR)',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id) ON DELETE SET NULL,
    FOREIGN KEY (banco_id) REFERENCES bancos_autorizados(id) ON DELETE SET NULL,
    
    INDEX idx_metodo_pago_id (metodo_pago_id) COMMENT 'Búsqueda por método de pago',
    INDEX idx_banco_id (banco_id) COMMENT 'Búsqueda por banco',
    INDEX idx_nombre_titular (nombre_titular) COMMENT 'Búsqueda por nombre del titular',
    INDEX idx_numero_cuenta (numero_cuenta) COMMENT 'Búsqueda por número de cuenta',
    INDEX idx_numero_celular (numero_celular) COMMENT 'Búsqueda por número de celular',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_metodo_activo (metodo_pago_id, activo, deleted_at) COMMENT 'Búsqueda de cuentas activas por método'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuración de cuentas del instituto para recibir pagos. Almacena datos de cuenta bancaria (TRANSFERENCIA, DEPOSITO, QR) y número de celular (TIGO_MONEY). Para QR incluye la imagen del código QR activo.';

-- ============================================
-- TABLA: pago_aporte (CABECERA MAESTRA)
-- Deuda del aporte académico por estudiante y gestión. Una sola cabecera por (estudiante, gestión).
-- El estudiante tiene todo el año para pagar; los pagos se registran en pago_cuotas.
-- La beca/descuento se aplica una sola vez a esta cabecera (estudiante_beca_id). Un solo descuento por gestión.
-- Cancelado cuando SUM(pago_cuotas.monto) >= monto_obligatorio.
-- ============================================

CREATE TABLE pago_aporte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NULL COMMENT 'Estudiante que debe el aporte',
    gestion_id INT NULL COMMENT 'Gestión académica del aporte (una cabecera por estudiante por gestión)',
    estudiante_beca_id INT NULL COMMENT 'Beca/descuento aplicado UNA SOLA VEZ por gestión (referencia a estudiantes_becas). Solo un registro por cabecera.',
    
    -- Montos de la deuda (descuento aplicado a la cabecera)
    monto_base DECIMAL(10,2) NOT NULL COMMENT 'Monto base del aporte para esta gestión (de configuracion_aportes)',
    descuento_beca DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Descuento por beca aplicado a esta cabecera (una vez por gestión)',
    monto_obligatorio DECIMAL(10,2) NOT NULL COMMENT 'Monto a pagar = monto_base - descuento_beca',
    
    -- Estado de la deuda (derivable: CANCELADO si SUM(cuotas.monto) >= monto_obligatorio; se almacena para consultas rápidas)
    estado ENUM('PENDIENTE', 'PARCIAL', 'CANCELADO') DEFAULT 'PENDIENTE' COMMENT 'PENDIENTE=sin pagos, PARCIAL=algún pago, CANCELADO=total pagado >= monto_obligatorio',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (estudiante_beca_id) REFERENCES estudiantes_becas(id) ON DELETE SET NULL,
    
    -- Sin UNIQUE en (estudiante_id, gestion_id): con soft delete puede haber fila eliminada y otra nueva; la “una cabecera activa” se garantiza en lógica de negocio
    INDEX idx_estudiante_id (estudiante_id) COMMENT 'Búsqueda por estudiante',
    INDEX idx_gestion_id (gestion_id) COMMENT 'Búsqueda por gestión',
    INDEX idx_estudiante_beca_id (estudiante_beca_id) COMMENT 'Búsqueda por beca',
    INDEX idx_estado (estado) COMMENT 'Filtrado por estado de la deuda',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_estudiante_gestion (estudiante_id, gestion_id, activo, deleted_at) COMMENT 'Búsqueda de cabecera por estudiante y gestión',
    INDEX idx_gestion_estado (gestion_id, estado, activo, deleted_at) COMMENT 'Pagos por gestión y estado'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cabecera maestra del aporte académico por estudiante y gestión. Una deuda por gestión; beca/descuento aplicada una vez. El estudiante paga en cuotas (sin monto ni fecha fija). Cancelado cuando SUM(pago_cuotas.monto) >= monto_obligatorio.';

-- ============================================
-- TABLA: pago_cuotas
-- Historial de pagos (cuotas) contra una cabecera pago_aporte. Montos y fechas variables, sin límite.
-- Por cada registro se genera un recibo (numero_recibo).
-- ============================================

CREATE TABLE pago_cuotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pago_aporte_id INT NULL COMMENT 'Cabecera del aporte a la que aplica este pago',
    
    -- Datos del pago
    numero_recibo VARCHAR(50) NOT NULL COMMENT 'Número de recibo único por cuota (generado por lógica de negocio)',
    fecha_pago DATE NOT NULL COMMENT 'Fecha del pago',
    monto DECIMAL(10,2) NOT NULL COMMENT 'Monto de este pago (sin valor fijo; suma de cuotas = total pagado)',
    metodo_pago_id INT NULL COMMENT 'Método de pago utilizado',
    cuenta_pago_id INT NULL COMMENT 'Cuenta utilizada (para TRANSFERENCIA/DEPOSITO/QR/TIGO_MONEY)',
    numero_transaccion VARCHAR(100) COMMENT 'Número de transacción/código',
    codigo_comprobante VARCHAR(100) COMMENT 'Código del comprobante (requerido para QR/TRANSFERENCIA/DEPOSITO)',
    descripcion TEXT COMMENT 'Descripción u observación del pago',
    
    -- Campos de auditoría y control (ESTÁNDAR)
    activo BOOLEAN DEFAULT TRUE COMMENT 'Registro activo/inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de modificación',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
    created_by INT COMMENT 'Usuario que creó',
    updated_by INT COMMENT 'Usuario que modificó',
    deleted_by INT COMMENT 'Usuario que eliminó',
    
    -- NOTA: Las Foreign Keys a usuarios se omiten para evitar dependencias circulares
    -- Los campos created_by, updated_by, deleted_by se mantienen para auditoría
    
    FOREIGN KEY (pago_aporte_id) REFERENCES pago_aporte(id) ON DELETE SET NULL,
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id) ON DELETE SET NULL,
    FOREIGN KEY (cuenta_pago_id) REFERENCES cuentas_pago(id) ON DELETE SET NULL,
    
    -- Sin UNIQUE en numero_recibo: con soft delete puede haber cuota eliminada y otra nueva; la unicidad se garantiza en lógica al generar el número
    INDEX idx_numero_recibo (numero_recibo) COMMENT 'Búsqueda por número de recibo',
    INDEX idx_pago_aporte_id (pago_aporte_id) COMMENT 'Búsqueda por cabecera',
    INDEX idx_fecha_pago (fecha_pago) COMMENT 'Búsqueda por fecha de pago',
    INDEX idx_metodo_pago_id (metodo_pago_id) COMMENT 'Búsqueda por método de pago',
    INDEX idx_activo (activo) COMMENT 'Filtrado por estado activo',
    INDEX idx_deleted_at (deleted_at) COMMENT 'Filtrado de soft delete',
    INDEX idx_cabecera_activo (pago_aporte_id, activo, deleted_at) COMMENT 'Cuotas activas por cabecera'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de pagos (cuotas) del aporte. Montos y fechas libres; cada pago genera un recibo. Total pagado = SUM(monto) WHERE activo=1 AND deleted_at IS NULL.';

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
