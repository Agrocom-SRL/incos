-- ============================================
-- AGREGAR CAMPOS DE DISCAPACIDAD A ESTUDIANTES
-- Sistema de Gestión Académica - Instituto INCOS
-- Agrega campos: grado_invalidez y detalles_discapacidad
-- ============================================

USE instituto_incos;

-- ============================================
-- AGREGAR CAMPOS A LA TABLA estudiantes
-- ============================================

ALTER TABLE estudiantes
ADD COLUMN grado_invalidez VARCHAR(50) COMMENT 'Grado de invalidez (leve, moderado, severo, profundo)' AFTER tipo_discapacidad_id,
ADD COLUMN detalles_discapacidad TEXT COMMENT 'Detalles específicos de la discapacidad' AFTER grado_invalidez;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 
    COLUMN_NAME as campo,
    COLUMN_TYPE as tipo,
    COLUMN_COMMENT as descripcion
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'instituto_incos'
  AND TABLE_NAME = 'estudiantes'
  AND COLUMN_NAME IN ('grado_invalidez', 'detalles_discapacidad')
ORDER BY ORDINAL_POSITION;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
