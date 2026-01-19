-- ============================================
-- TABLA DE SINCRONIZACIÓN
-- Sistema de Gestión Académica - Instituto INCOS
-- 1 Tabla: sincronizacion_logs
-- ============================================

USE instituto_incos;

-- ============================================
-- FASE 1: ELIMINACIÓN DE TABLAS
-- Deshabilitamos foreign key checks para poder eliminar en cualquier orden
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (orden no importa con foreign key checks deshabilitado)
DROP TABLE IF EXISTS sincronizacion_logs;

-- ============================================
-- FASE 2: CREACIÓN DE TABLAS
-- Las foreign key checks siguen deshabilitadas durante la creación
-- ============================================

-- ============================================
-- TABLA: sincronizacion_logs
-- ============================================

CREATE TABLE sincronizacion_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Identificación de la sincronización
    tipo_sincronizacion ENUM(
        'ESTUDIANTES',
        'INSCRIPCIONES',
        'CALIFICACIONES',
        'PAGOS',
        'USUARIOS',
        'COMPLETA',
        'OTRA'
    ) NOT NULL COMMENT 'Tipo de datos sincronizados',
    
    -- Detalles de la operación
    operacion ENUM('EXPORT', 'IMPORT', 'SYNC', 'BACKUP', 'RESTORE') NOT NULL,
    estado ENUM('INICIADO', 'EN_PROCESO', 'COMPLETADO', 'ERROR', 'CANCELADO') DEFAULT 'INICIADO',
    
    -- Fechas
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Inicio de la sincronización',
    fecha_fin TIMESTAMP NULL COMMENT 'Fin de la sincronización',
    duracion_segundos INT COMMENT 'Duración en segundos',
    
    -- Estadísticas
    registros_procesados INT DEFAULT 0 COMMENT 'Cantidad de registros procesados',
    registros_exitosos INT DEFAULT 0 COMMENT 'Registros procesados exitosamente',
    registros_fallidos INT DEFAULT 0 COMMENT 'Registros con error',
    registros_omitidos INT DEFAULT 0 COMMENT 'Registros omitidos',
    
    -- Origen y destino
    origen VARCHAR(200) COMMENT 'Sistema o archivo origen',
    destino VARCHAR(200) COMMENT 'Sistema o archivo destino',
    
    -- Información del archivo (si aplica)
    nombre_archivo VARCHAR(255) COMMENT 'Nombre del archivo procesado',
    ruta_archivo VARCHAR(500) COMMENT 'Ruta del archivo',
    tamano_kb INT COMMENT 'Tamaño del archivo en KB',
    
    -- Detalles del proceso
    descripcion TEXT COMMENT 'Descripción de la sincronización',
    parametros JSON COMMENT 'Parámetros utilizados en la sincronización',
    
    -- Mensajes y errores
    mensaje_resultado TEXT COMMENT 'Mensaje del resultado',
    errores_detalle JSON COMMENT 'Detalle de errores encontrados',
    warnings JSON COMMENT 'Advertencias durante el proceso',
    
    -- Usuario que ejecutó
    usuario_id INT COMMENT 'Usuario que ejecutó la sincronización',
    ip_cliente VARCHAR(45) COMMENT 'IP desde donde se ejecutó',
    
    -- Verificación
    checksum VARCHAR(255) COMMENT 'Checksum del archivo procesado',
    hash_integridad VARCHAR(255) COMMENT 'Hash para verificar integridad',
    
    -- Observaciones
    observaciones TEXT,
    
    -- Timestamp simple (no necesita auditoría completa al ser log)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del log',
    
    -- Foreign Keys
    
    -- Índices
    INDEX idx_tipo_sincronizacion (tipo_sincronizacion),
    INDEX idx_operacion (operacion),
    INDEX idx_estado (estado),
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_estado (fecha_inicio, estado)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Log de sincronizaciones y operaciones de importación/exportación';

-- ============================================
-- TRIGGER PARA CALCULAR DURACIÓN
-- ============================================

DELIMITER $$

DROP TRIGGER IF EXISTS trg_sync_calcular_duracion$$

CREATE TRIGGER trg_sync_calcular_duracion
BEFORE UPDATE ON sincronizacion_logs
FOR EACH ROW
BEGIN
    IF NEW.fecha_fin IS NOT NULL AND OLD.fecha_fin IS NULL THEN
        SET NEW.duracion_segundos = TIMESTAMPDIFF(SECOND, NEW.fecha_inicio, NEW.fecha_fin);
    END IF;
END$$

DELIMITER ;

-- ============================================
-- FASE 3: REHABILITAR FOREIGN KEY CHECKS
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Tabla de sincronización creada exitosamente' as mensaje;

SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME = 'sincronizacion_logs';

-- ============================================
-- NOTAS DE USO
-- ============================================

/*
TABLA DE SINCRONIZACIÓN:

Esta tabla registra todas las operaciones de:
- Exportación de datos
- Importación de datos
- Sincronización con sistemas externos
- Backups
- Restauraciones

TIPOS DE SINCRONIZACIÓN:
- ESTUDIANTES: Sincronización de datos de estudiantes
- INSCRIPCIONES: Sincronización de inscripciones
- CALIFICACIONES: Sincronización de notas
- PAGOS: Sincronización de pagos y aranceles
- USUARIOS: Sincronización de usuarios
- COMPLETA: Sincronización completa del sistema
- OTRA: Otras sincronizaciones

ESTADOS:
- INICIADO: Proceso iniciado
- EN_PROCESO: En ejecución
- COMPLETADO: Finalizado exitosamente
- ERROR: Finalizado con errores
- CANCELADO: Cancelado por usuario

EJEMPLO DE USO:

INSERT INTO sincronizacion_logs (
    tipo_sincronizacion,
    operacion,
    estado,
    origen,
    destino,
    nombre_archivo,
    descripcion,
    usuario_id
) VALUES (
    'CALIFICACIONES',
    'EXPORT',
    'INICIADO',
    'Sistema INCOS',
    'Excel',
    'calificaciones_2025.xlsx',
    'Exportación de calificaciones del primer semestre 2025',
    1
);

-- Al finalizar:
UPDATE sincronizacion_logs
SET estado = 'COMPLETADO',
    fecha_fin = NOW(),
    registros_procesados = 1500,
    registros_exitosos = 1500,
    registros_fallidos = 0,
    mensaje_resultado = 'Exportación completada exitosamente'
WHERE id = 1;
*/

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
