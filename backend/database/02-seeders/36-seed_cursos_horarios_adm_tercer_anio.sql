-- ============================================
-- SEEDER: cursos_horarios - ADMINISTRACIÓN TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELO: TERCERO A (NOCHE)
-- ============================================
-- Orden: Carrera 2 (ADM-EMP) → Periodo 3 → Paralelo 3A → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 61-67 (3A: 61-67)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos_horarios;

-- ============================================
-- TERCERO A - NOCHE (curso_id: 61-67)
-- ============================================

-- ADMINISTRACIÓN DE LA MICRO, PEQUEÑA Y MEDIANA EMPRESA (curso_id = 61) - 6 horas/semana
-- LUNES (5 bloques) + MIÉRCOLES (1 bloque)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(246, 61, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(247, 61, 32, NULL, 2),   -- LUNES 19:00 (horario_id=32)
(248, 61, 33, NULL, 3),   -- LUNES 19:45 (horario_id=33)
(249, 61, 34, NULL, 4),   -- LUNES 20:30 (horario_id=34)
(250, 61, 35, NULL, 5),   -- LUNES 21:15 (horario_id=35)
(251, 61, 41, NULL, 6);   -- MIERCOLES 18:15 (horario_id=41)

-- INCUBACIÓN Y MODELOS DE NEGOCIOS (curso_id = 62) - 4 horas/semana
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(252, 62, 46, NULL, 1),   -- JUEVES 18:15 (horario_id=46)
(253, 62, 47, NULL, 2),   -- JUEVES 19:00 (horario_id=47)
(254, 62, 54, NULL, 3),   -- VIERNES 20:30 (horario_id=54)
(255, 62, 55, NULL, 4);   -- VIERNES 21:15 (horario_id=55)

-- ADMINISTRACIÓN FINANCIERA II (curso_id = 63) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(256, 63, 42, NULL, 1),   -- MIERCOLES 19:00 (horario_id=42)
(257, 63, 43, NULL, 2),   -- MIERCOLES 19:45 (horario_id=43)
(258, 63, 44, NULL, 3),   -- MIERCOLES 20:30 (horario_id=44)
(259, 63, 45, NULL, 4);   -- MIERCOLES 21:15 (horario_id=45)

-- TALLER DE MODALIDAD DE GRADUACIÓN (curso_id = 64) - 4 horas/semana
-- JUEVES (1 bloque) + SÁBADO (3 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(260, 64, 48, NULL, 1),   -- JUEVES 19:45 (horario_id=48)
(261, 64, 58, NULL, 2),   -- SABADO 16:30 (horario_id=58)
(262, 64, 59, NULL, 3),   -- SABADO 17:30 (horario_id=59)
(263, 64, 60, NULL, 4);   -- SABADO 18:15 (horario_id=60)

-- EMPRENDIMIENTO PRODUCTIVO (curso_id = 65) - 4 horas/semana
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(264, 65, 39, NULL, 1),   -- MARTES 20:30 (horario_id=39)
(265, 65, 40, NULL, 2),   -- MARTES 21:15 (horario_id=40)
(266, 65, 49, NULL, 3),   -- JUEVES 20:30 (horario_id=49)
(267, 65, 50, NULL, 4);   -- JUEVES 21:15 (horario_id=50)

-- COMERCIO INTERNACIONAL (curso_id = 66) - 4 horas/semana
-- MARTES (2 bloques) + SÁBADO (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(268, 66, 37, NULL, 1),   -- MARTES 19:00 (horario_id=37)
(269, 66, 38, NULL, 2),   -- MARTES 19:45 (horario_id=38)
(270, 66, 56, NULL, 3),   -- SABADO 15:00 (horario_id=56)
(271, 66, 57, NULL, 4);   -- SABADO 15:45 (horario_id=57)

-- GESTIÓN ESTRATÉGICA (curso_id = 67) - 4 horas/semana
-- MARTES (1 bloque) + VIERNES (3 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(272, 67, 36, NULL, 1),   -- MARTES 18:15 (horario_id=36)
(273, 67, 51, NULL, 2),   -- VIERNES 18:15 (horario_id=51)
(274, 67, 52, NULL, 3),   -- VIERNES 19:00 (horario_id=52)
(275, 67, 53, NULL, 4);   -- VIERNES 19:45 (horario_id=53)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (NOCHE): 7 cursos × ~4-6 bloques = 30 registros (IDs 246-275)
-- TOTAL: 30 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
