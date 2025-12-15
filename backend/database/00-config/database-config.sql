-- ============================================
-- CONFIGURACIÓN INICIAL DE MYSQL
-- Sistema de Gestión Académica - Instituto INCOS
-- ============================================

-- Configuración de modo SQL
SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Configuración de zona horaria (Bolivia UTC-4)
SET GLOBAL time_zone = '-04:00';
SET SESSION time_zone = '-04:00';

-- Configuración de charset
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

-- Configuración de encoding
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '-04:00';

-- ============================================
-- CREAR BASE DE DATOS
-- ============================================

CREATE DATABASE IF NOT EXISTS instituto_incos 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Seleccionar base de datos
USE instituto_incos;

-- ============================================
-- CONFIGURACIÓN DE VARIABLES DE SESIÓN
-- ============================================

-- Desactivar verificación de foreign keys temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Configuración de group_concat_max_len (para consultas con muchos registros)
SET SESSION group_concat_max_len = 100000;

-- Configuración de max_allowed_packet (para inserts grandes)
SET GLOBAL max_allowed_packet = 67108864; -- 64MB

-- ============================================
-- MOSTRAR CONFIGURACIÓN APLICADA
-- ============================================

SELECT 'Configuración de MySQL aplicada exitosamente' as mensaje;

SELECT 
    @@character_set_database as charset_db,
    @@collation_database as collation_db,
    @@time_zone as timezone,
    @@max_allowed_packet as max_packet,
    @@sql_mode as sql_mode;

-- ============================================
-- FIN DE CONFIGURACIÓN INICIAL
-- ============================================
