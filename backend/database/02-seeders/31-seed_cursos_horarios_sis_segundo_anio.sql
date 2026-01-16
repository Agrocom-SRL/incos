-- ============================================
-- SEEDER: cursos_horarios - SISTEMAS INFORMÁTICOS SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELO: SEGUNDO A (NOCHE)
-- ============================================
-- Orden: Carrera 1 (SIS-INF) → Periodo 2 → Paralelo 2A → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 15-22 (2A: 15-22)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Aulas: LAB-3=3

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos_horarios;

-- ============================================
-- SEGUNDO A - NOCHE (curso_id: 15-22)
-- ============================================

-- ESTADÍSTICA (curso_id = 15) - 2 horas/semana
-- LUNES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(61, 15, 34, 3, 1),  -- LUNES 20:30 (horario_id=34)
(62, 15, 35, 3, 2);  -- LUNES 21:15 (horario_id=35)

-- PROGRAMACIÓN II (curso_id = 16) - 4 horas/semana
-- MARTES (2 bloques) + MIÉRCOLES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(63, 16, 36, 3, 1),  -- MARTES 18:15 (horario_id=36)
(64, 16, 37, 3, 2),  -- MARTES 19:00 (horario_id=37)
(65, 16, 41, 3, 3),  -- MIERCOLES 18:15 (horario_id=41)
(66, 16, 42, 3, 4);  -- MIERCOLES 19:00 (horario_id=42)

-- ESTRUCTURA DE DATOS (curso_id = 17) - 2 horas/semana
-- MIÉRCOLES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(67, 17, 44, 3, 1),  -- MIERCOLES 20:30 (horario_id=44)
(68, 17, 45, 3, 2);  -- MIERCOLES 21:15 (horario_id=45)

-- REDES DE COMPUTADORAS I (curso_id = 18) - 4 horas/semana
-- JUEVES (2 bloques) + VIERNES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(69, 18, 46, 3, 1),  -- JUEVES 18:15 (horario_id=46)
(70, 18, 47, 3, 2),  -- JUEVES 19:00 (horario_id=47)
(71, 18, 51, 3, 3),  -- VIERNES 18:15 (horario_id=51)
(72, 18, 52, 3, 4);  -- VIERNES 19:00 (horario_id=52)

-- PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES I (curso_id = 19) - 4 horas/semana
-- MARTES (2 bloques) + SÁBADO (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(73, 19, 39, 3, 1),  -- MARTES 20:30 (horario_id=39)
(74, 19, 40, 3, 2),  -- MARTES 21:15 (horario_id=40)
(75, 19, 56, 3, 3),  -- SABADO 15:00 (horario_id=56)
(76, 19, 57, 3, 4);  -- SABADO 15:45 (horario_id=57)

-- ANÁLISIS Y DISEÑO DE SISTEMAS I (curso_id = 20) - 4 horas/semana
-- MIÉRCOLES (1 bloque) + JUEVES (2 bloques) + VIERNES (1 bloque) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(77, 20, 43, 3, 1),  -- MIERCOLES 19:45 (horario_id=43)
(78, 20, 48, 3, 2),  -- JUEVES 19:45 (horario_id=48)
(79, 20, 49, 3, 3),  -- JUEVES 20:30 (horario_id=49)
(80, 20, 50, 3, 4),  -- JUEVES 21:15 (horario_id=50)
(81, 20, 53, 3, 5);  -- VIERNES 19:45 (horario_id=53)

-- DISEÑO Y PROGRAMACIÓN WEB II (curso_id = 21) - 4 horas/semana
-- LUNES (3 bloques) + JUEVES (1 bloque) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(82, 21, 31, 3, 1),  -- LUNES 18:15 (horario_id=31)
(83, 21, 32, 3, 2),  -- LUNES 19:00 (horario_id=32)
(84, 21, 33, 3, 3),  -- LUNES 19:45 (horario_id=33)
(85, 21, 47, 3, 4);  -- JUEVES 19:00 (horario_id=47)

-- BASE DE DATOS I (curso_id = 22) - 4 horas/semana
-- JUEVES (1 bloque) + SÁBADO (1 bloque) + VIERNES (2 bloques) LAB 3
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(86, 22, 46, 3, 1),  -- JUEVES 18:15 (horario_id=46)
(87, 22, 58, 3, 2),  -- SABADO 16:30 (horario_id=58)
(88, 22, 54, 3, 3),  -- VIERNES 20:30 (horario_id=54)
(89, 22, 55, 3, 4);  -- VIERNES 21:15 (horario_id=55)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (NOCHE): 8 cursos × ~4 bloques = 29 registros (IDs 61-89)
-- TOTAL: 29 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
