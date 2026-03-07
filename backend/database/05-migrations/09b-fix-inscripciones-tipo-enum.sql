-- ============================================
-- FIX: tipo_inscripcion ENUM → TRASPASO, TRANSITABILIDAD (sin _ENTRADA)
-- Ejecutar en bases que ya tengan la tabla inscripciones con el ENUM antiguo.
-- Actualiza valores existentes y modifica el ENUM.
-- ============================================

USE instituto_incos;

-- Actualizar filas que usen los valores antiguos
UPDATE inscripciones SET tipo_inscripcion = 'TRASPASO'  WHERE tipo_inscripcion = 'TRASPASO_ENTRADA';
UPDATE inscripciones SET tipo_inscripcion = 'TRANSITABILIDAD' WHERE tipo_inscripcion = 'TRANSITABILIDAD_ENTRADA';

-- Modificar columna al nuevo ENUM
ALTER TABLE inscripciones
  MODIFY COLUMN tipo_inscripcion ENUM('NUEVO', 'REINGRESO', 'CONTINUIDAD', 'TRASPASO', 'TRANSITABILIDAD') DEFAULT 'CONTINUIDAD'
  COMMENT 'Tipo de inscripción: NUEVO, REINGRESO, CONTINUIDAD, TRASPASO, TRANSITABILIDAD';
