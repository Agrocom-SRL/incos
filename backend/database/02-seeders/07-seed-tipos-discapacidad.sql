-- ============================================
-- SEEDER: tipos_discapacidad
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Tipos de discapacidad
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE tipos_discapacidad;

-- ============================================
-- INSERTAR TIPOS DE DISCAPACIDAD
-- IDs fijos para facilitar migraciones y referencias consistentes
-- ============================================

INSERT INTO tipos_discapacidad (id, nombre, descripcion) VALUES
-- Tipos de discapacidad ordenados por frecuencia en Bolivia (según Censo 2012)
(1, 'Visual', 'Discapacidad visual que incluye ceguera total o parcial, baja visión o problemas de visión'), -- 1. Más frecuente
(2, 'Motriz', 'Discapacidad física que afecta el movimiento, coordinación, extremidades o movilidad'), -- 2. Segundo más frecuente
(3, 'Auditiva', 'Discapacidad auditiva que incluye sordera total o parcial, pérdida de audición'), -- 3. Tercero más frecuente
(4, 'Concentración', 'Discapacidad que afecta la atención, concentración, memoria o procesos cognitivos'), -- 4. Dificultad para recordar o concentrarse
(5, 'Lenguaje', 'Discapacidad relacionada con el habla, comunicación verbal o dificultades en el lenguaje'), -- 5. Dificultad para hablar, comunicarse o conversar
(6, 'Intelectual', 'Discapacidad que afecta las capacidades cognitivas, aprendizaje y desarrollo intelectual'), -- 6. Discapacidad intelectual
(7, 'Psicosocial', 'Discapacidad relacionada con trastornos mentales, psicosociales o de salud mental'), -- 7. Discapacidad psicosocial
(8, 'Múltiple', 'Personas que presentan dos o más discapacidades simultáneamente'), -- 8. Discapacidad múltiple
(9, 'Otra', 'Otras discapacidades no especificadas en las categorías anteriores'); -- 9. Siempre al final

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

