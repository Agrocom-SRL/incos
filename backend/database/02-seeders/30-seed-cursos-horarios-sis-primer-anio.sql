-- ============================================
-- SEEDER: cursos_horarios - SISTEMAS INFORMÁTICOS PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: PRIMERO A (NOCHE), PRIMERO B (NOCHE)
-- ============================================
-- Orden: Carrera 1 (SIS-INF) → Periodo 1 → Paralelos → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 1-14 (1A: 1-7, 1B: 8-14)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Aulas: LAB-1=1, LAB-4=4, AULA-8=6

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos_horarios;

-- ============================================
-- PRIMERO A - NOCHE (curso_id: 1-7)
-- ============================================

-- PROGRAMACIÓN I (curso_id = 2) - 8 horas/semana
-- MARTES (5 bloques) + JUEVES (1 bloque) + SÁBADO (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(1, 2, 36, 4, 1),   -- MARTES 18:15 (horario_id=36)
(2, 2, 37, 4, 2),   -- MARTES 19:00 (horario_id=37)
(3, 2, 38, 4, 3),   -- MARTES 19:45 (horario_id=38)
(4, 2, 39, 4, 4),   -- MARTES 20:30 (horario_id=39)
(5, 2, 40, 4, 5),   -- MARTES 21:15 (horario_id=40)
(6, 2, 48, 4, 6),   -- JUEVES 19:45 (horario_id=48)
(7, 2, 56, 4, 7),   -- SABADO 15:00 (horario_id=56)
(8, 2, 57, 4, 8);   -- SABADO 15:45 (horario_id=57)

-- MATEMÁTICA PARA LA INFORMÁTICA (curso_id = 1) - 4 horas/semana
-- MIÉRCOLES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(9, 1, 41, 4, 1),   -- MIERCOLES 18:15 (horario_id=41)
(10, 1, 42, 4, 2),  -- MIERCOLES 19:00 (horario_id=42)
(11, 1, 49, 4, 3),  -- JUEVES 20:30 (horario_id=49)
(12, 1, 50, 4, 4);  -- JUEVES 21:15 (horario_id=50)

-- INGLÉS TÉCNICO (curso_id = 3) - 2 horas/semana
-- SÁBADO (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(13, 3, 59, NULL, 1),  -- SABADO 17:30 (horario_id=59)
(14, 3, 60, NULL, 2);  -- SABADO 18:15 (horario_id=60)

-- HARDWARE DE COMPUTADORAS (curso_id = 4) - 4 horas/semana
-- VIERNES (4 bloques) AULA 8
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(15, 4, 51, 6, 1),  -- VIERNES 18:15 (horario_id=51)
(16, 4, 52, 6, 2),  -- VIERNES 19:00 (horario_id=52)
(17, 4, 53, 6, 3),  -- VIERNES 19:45 (horario_id=53)
(18, 4, 54, 6, 4);  -- VIERNES 20:30 (horario_id=54)

-- TALLER DE SISTEMAS OPERATIVOS (curso_id = 5) - 4 horas/semana
-- LUNES (3 bloques) + VIERNES (1 bloque) LAB 4 y AULA 8
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(19, 5, 31, 4, 1),  -- LUNES 18:15 (horario_id=31) LAB-4
(20, 5, 32, 4, 2),  -- LUNES 19:00 (horario_id=32) LAB-4
(21, 5, 33, 4, 3),  -- LUNES 19:45 (horario_id=33) LAB-4
(22, 5, 55, 6, 4);  -- VIERNES 21:15 (horario_id=55) AULA-8

-- OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA (curso_id = 6) - 4 horas/semana
-- JUEVES (2 bloques) + MIÉRCOLES (1 bloque) + SÁBADO (1 bloque) LAB 4 y LAB 1
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(23, 6, 46, 4, 1),  -- JUEVES 18:15 (horario_id=46) LAB-4
(24, 6, 47, 4, 2),  -- JUEVES 19:00 (horario_id=47) LAB-4
(25, 6, 43, 4, 3),  -- MIERCOLES 19:45 (horario_id=43) LAB-4
(26, 6, 58, 1, 4);  -- SABADO 16:30 (horario_id=58) LAB-1

-- DISEÑO Y PROGRAMACIÓN WEB I (curso_id = 7) - 4 horas/semana
-- LUNES (2 bloques) + MIÉRCOLES (2 bloques) LAB 4 y LAB 1
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(27, 7, 34, 4, 1),  -- LUNES 20:30 (horario_id=34) LAB-4
(28, 7, 35, 4, 2),  -- LUNES 21:15 (horario_id=35) LAB-4
(29, 7, 44, 1, 3),  -- MIERCOLES 20:30 (horario_id=44) LAB-1
(30, 7, 45, 1, 4);  -- MIERCOLES 21:15 (horario_id=45) LAB-1

-- ============================================
-- PRIMERO B - NOCHE (curso_id: 8-14)
-- ============================================

-- PROGRAMACIÓN I (curso_id = 9) - 8 horas/semana
-- LUNES (2 bloques) + MIÉRCOLES (1 bloque) + JUEVES (2 bloques) + VIERNES (1 bloque) + SÁBADO (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(31, 9, 31, 4, 1),   -- LUNES 18:15 (horario_id=31) LAB-4
(32, 9, 32, 4, 2),   -- LUNES 19:00 (horario_id=32) LAB-4
(33, 9, 43, 1, 3),   -- MIERCOLES 19:45 (horario_id=43) LAB-1
(34, 9, 49, 1, 4),   -- JUEVES 20:30 (horario_id=49) LAB-1
(35, 9, 50, 1, 5),   -- JUEVES 21:15 (horario_id=50) LAB-1
(36, 9, 51, 1, 6),   -- VIERNES 18:15 (horario_id=51) LAB-1
(37, 9, 56, 4, 7),   -- SABADO 15:00 (horario_id=56) LAB-4
(38, 9, 57, 4, 8);   -- SABADO 15:45 (horario_id=57) LAB-4

-- MATEMÁTICA PARA LA INFORMÁTICA (curso_id = 8) - 4 horas/semana
-- JUEVES (2 bloques) + MIÉRCOLES (2 bloques) LAB 1 y LAB 4
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(39, 8, 46, 1, 1),   -- JUEVES 18:15 (horario_id=46) LAB-1
(40, 8, 47, 1, 2),   -- JUEVES 19:00 (horario_id=47) LAB-1
(41, 8, 44, 4, 3),   -- MIERCOLES 20:30 (horario_id=44) LAB-4
(42, 8, 45, 4, 4);   -- MIERCOLES 21:15 (horario_id=45) LAB-4

-- INGLÉS TÉCNICO (curso_id = 10) - 2 horas/semana
-- SÁBADO (2 bloques) - Nota: En la imagen aparece en horario diferente, pero según columna 9
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(43, 10, 59, NULL, 1),  -- SABADO 17:30 (horario_id=59) AULA
(44, 10, 60, NULL, 2);  -- SABADO 18:15 (horario_id=60) AULA

-- HARDWARE DE COMPUTADORAS (curso_id = 11) - 4 horas/semana
-- MIÉRCOLES (2 bloques) + VIERNES (2 bloques) AULA 8 y LAB 1
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(45, 11, 41, 6, 1),  -- MIERCOLES 18:15 (horario_id=41)
(46, 11, 42, 6, 2),  -- MIERCOLES 19:00 (horario_id=42)
(47, 11, 54, 1, 3),  -- VIERNES 20:30 (horario_id=54)
(48, 11, 55, 1, 4);  -- VIERNES 21:15 (horario_id=55)

-- TALLER DE SISTEMAS OPERATIVOS (curso_id = 12) - 4 horas/semana
-- JUEVES (1 bloque) + SÁBADO (3 bloques) LAB 4
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(49, 12, 48, NULL, 1),  -- JUEVES 19:45 (horario_id=48) AULA
(50, 12, 58, 4, 2),     -- SABADO 16:30 (horario_id=58) LAB-4
(51, 12, 59, 4, 3),     -- SABADO 17:30 (horario_id=59) LAB-4
(52, 12, 60, 4, 4);     -- SABADO 18:15 (horario_id=60) LAB-4

-- OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA (curso_id = 13) - 4 horas/semana
-- MARTES (3 bloques) + MIÉRCOLES (1 bloque) LAB 1 y AULA 8
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(53, 13, 36, 1, 1),  -- MARTES 18:15 (horario_id=36) LAB-1
(54, 13, 37, 1, 2),  -- MARTES 19:00 (horario_id=37) LAB-1
(55, 13, 38, 1, 3),  -- MARTES 19:45 (horario_id=38) LAB-1
(56, 13, 43, 6, 4);  -- MIERCOLES 19:45 (horario_id=43) AULA-8

-- DISEÑO Y PROGRAMACIÓN WEB I (curso_id = 14) - 4 horas/semana
-- MARTES (2 bloques) + JUEVES (2 bloques) LAB 1
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(57, 14, 39, 1, 1),  -- MARTES 20:30 (horario_id=39)
(58, 14, 40, 1, 2),  -- MARTES 21:15 (horario_id=40)
(59, 14, 49, 1, 3),  -- JUEVES 20:30 (horario_id=49)
(60, 14, 50, 1, 4);  -- JUEVES 21:15 (horario_id=50)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (NOCHE): 7 cursos × ~4 bloques = 30 registros (IDs 1-30)
-- PARALELO B (NOCHE): 7 cursos × ~4 bloques = 30 registros (IDs 31-60)
-- TOTAL: 60 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
