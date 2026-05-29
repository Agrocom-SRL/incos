-- ============================================
-- SEEDER: asignacion_horarios - ADMINISTRACIÓN TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELO: TERCERO A (NOCHE)
-- ============================================
-- Sprint 5 — Bloques horarios (cuelgan de asignacion_docente_id, no de oferta)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- Orden: Carrera 2 (ADM-EMP) → Periodo 3 → Paralelo 3A → Asignaciones → Bloques → Aulas
-- IDs oferta (asignacion_docente_id ref): 68-74 (3A: 68-74)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Continuación desde último ID del seeder de Administración segundo año: 271

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignacion_horarios;

-- ============================================
-- TERCERO A - NOCHE (asignacion_docente_id: 68-74)
-- ============================================

-- ADMINISTRACIÓN DE LA MICRO, PEQUEÑA Y MEDIANA EMPRESA (asignacion_docente_id = 68) - 6 horas/semana
-- LUNES (5 bloques) + MIÉRCOLES (1 bloque)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(272, 68, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(273, 68, 32, NULL, 2),   -- LUNES 19:00 (horario_id=32)
(274, 68, 33, NULL, 3),   -- LUNES 19:45 (horario_id=33)
(275, 68, 34, NULL, 4),   -- LUNES 20:30 (horario_id=34)
(276, 68, 35, NULL, 5),   -- LUNES 21:15 (horario_id=35)
(277, 68, 41, NULL, 6);   -- MIERCOLES 18:15 (horario_id=41)

-- INCUBACIÓN Y MODELOS DE NEGOCIOS (asignacion_docente_id = 69) - 4 horas/semana
-- JUEVES (4 bloques) - Periodos 1-2, 4-5
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(278, 69, 46, NULL, 1),   -- JUEVES 18:15 (horario_id=46)
(279, 69, 47, NULL, 2),   -- JUEVES 19:00 (horario_id=47)
(280, 69, 49, NULL, 3),   -- JUEVES 20:30 (horario_id=49)
(281, 69, 50, NULL, 4);   -- JUEVES 21:15 (horario_id=50)

-- ADMINISTRACIÓN FINANCIERA II (asignacion_docente_id = 70) - 4 horas/semana
-- MIÉRCOLES (4 bloques) - Periodos 2-5
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(282, 70, 42, NULL, 1),   -- MIERCOLES 19:00 (horario_id=42)
(283, 70, 43, NULL, 2),   -- MIERCOLES 19:45 (horario_id=43)
(284, 70, 44, NULL, 3),   -- MIERCOLES 20:30 (horario_id=44)
(285, 70, 45, NULL, 4);   -- MIERCOLES 21:15 (horario_id=45)

-- TALLER DE MODALIDAD DE GRADUACIÓN (asignacion_docente_id = 71) - 4 horas/semana
-- JUEVES (1 bloque) + SÁBADO (3 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(286, 71, 48, NULL, 1),   -- JUEVES 19:45 (horario_id=48)
(287, 71, 58, NULL, 2),   -- SABADO 16:30 (horario_id=58)
(288, 71, 59, NULL, 3),   -- SABADO 17:30 (horario_id=59)
(289, 71, 60, NULL, 4);   -- SABADO 18:15 (horario_id=60)

-- EMPRENDIMIENTO PRODUCTIVO (asignacion_docente_id = 72) - 4 horas/semana
-- MARTES (2 bloques) - Periodos 4-5
-- NOTA: La imagen muestra solo 2 horas, pero asignaturas_plan indica 4 horas
-- Se asignan solo las 2 horas visibles en la imagen
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(290, 72, 39, NULL, 1),   -- MARTES 20:30 (horario_id=39)
(291, 72, 40, NULL, 2);   -- MARTES 21:15 (horario_id=40)

-- COMERCIO INTERNACIONAL (asignacion_docente_id = 73) - 4 horas/semana
-- MARTES (2 bloques) + SÁBADO (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(292, 73, 37, NULL, 1),   -- MARTES 19:00 (horario_id=37)
(293, 73, 38, NULL, 2),   -- MARTES 19:45 (horario_id=38)
(294, 73, 56, NULL, 3),   -- SABADO 15:00 (horario_id=56)
(295, 73, 57, NULL, 4);   -- SABADO 15:45 (horario_id=57)

-- GESTIÓN ESTRATÉGICA (asignacion_docente_id = 74) - 4 horas/semana
-- MARTES (1 bloque) + VIERNES (3 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(296, 74, 36, NULL, 1),   -- MARTES 18:15 (horario_id=36)
(297, 74, 51, NULL, 2),   -- VIERNES 18:15 (horario_id=51)
(298, 74, 52, NULL, 3),   -- VIERNES 19:00 (horario_id=52)
(299, 74, 53, NULL, 4);   -- VIERNES 19:45 (horario_id=53)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TERCERO A - NOCHE): 7 cursos = 28 registros (IDs 272-299)
--   ADMINISTRACIÓN DE LA MICRO, PEQUEÑA Y MEDIANA EMPRESA: 6 registros (272-277)
--   INCUBACIÓN Y MODELOS DE NEGOCIOS: 4 registros (278-281)
--   ADMINISTRACIÓN FINANCIERA II: 4 registros (282-285)
--   TALLER DE MODALIDAD DE GRADUACIÓN: 4 registros (286-289)
--   EMPRENDIMIENTO PRODUCTIVO: 2 registros (290-291)
--   COMERCIO INTERNACIONAL: 4 registros (292-295)
--   GESTIÓN ESTRATÉGICA: 4 registros (296-299)
--
-- TOTAL: 28 registros (IDs 272-299)
-- NOTA: Continuación desde el último ID del seeder de Administración segundo año (271)
-- NOTA: EMPRENDIMIENTO PRODUCTIVO tiene solo 2 horas según la imagen, pero asignaturas_plan indica 4 horas
-- ============================================
-- FIN DEL SEEDER
-- ============================================
