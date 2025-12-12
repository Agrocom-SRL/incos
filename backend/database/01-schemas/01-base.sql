-- ============================================
-- SCHEMA BASE - CREACIÓN DE BASE DE DATOS
-- Sistema de Gestión Académica - Instituto INCOS Santa Cruz
-- ============================================
-- NOTA: El nombre de la base de datos debe coincidir con:
-- - database/00-config/database-config.sql (CREATE DATABASE)
-- - backend/src/config/database.js (constante DATABASE_NAME)
-- - backend/.env (variable DB_NAME)

-- Usar la base de datos
USE instituto_incos;

-- ============================================
-- MENSAJE DE INICIO
-- ============================================

SELECT 'Iniciando creación de schema base...' as mensaje;

-- ============================================
-- INFORMACIÓN DE LA BASE DE DATOS
-- ============================================

SELECT 
    DATABASE() as base_datos_actual,
    @@character_set_database as charset,
    @@collation_database as collation,
    VERSION() as version_mysql,
    NOW() as fecha_hora_actual;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
ESTRUCTURA ESTÁNDAR DE TODAS LAS TABLAS:

Todas las tablas del sistema incluyen los siguientes campos de auditoría y control:

1. id INT AUTO_INCREMENT PRIMARY KEY
   - Clave primaria autoincremental

2. activo BOOLEAN DEFAULT TRUE
   - Indica si el registro está habilitado/activo
   - TRUE = activo, FALSE = deshabilitado (no eliminado)

3. created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - Fecha y hora de creación del registro
   - Se establece automáticamente al insertar

4. updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   - Fecha y hora de última modificación
   - Se actualiza automáticamente en cada UPDATE

5. deleted_at TIMESTAMP NULL DEFAULT NULL
   - Soft delete: NULL = registro activo, FECHA = registro eliminado
   - Permite "recuperar" registros eliminados
   - Las queries deben filtrar: WHERE deleted_at IS NULL

6. created_by INT
   - ID del usuario que creó el registro
   - Foreign key a tabla usuarios

7. updated_by INT
   - ID del usuario que modificó el registro por última vez
   - Foreign key a tabla usuarios

8. deleted_by INT
   - ID del usuario que eliminó el registro (soft delete)
   - Foreign key a tabla usuarios

ÍNDICES ESTÁNDAR:
- INDEX idx_activo (activo)
- INDEX idx_deleted_at (deleted_at)
- INDEX idx_created_at (created_at)

MOTOR: InnoDB
CHARSET: utf8mb4
COLLATION: utf8mb4_unicode_ci
*/

-- ============================================
-- FIN DEL SCRIPT BASE
-- ============================================

SELECT 'Schema base listo. Proceder con 02-catalogos-geograficos.sql' as mensaje;
