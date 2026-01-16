-- ============================================
-- SEEDER: cursos_horarios - CONTADURÍA GENERAL SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: SEGUNDO A (TARDE), SEGUNDO B (NOCHE)
-- ============================================
-- Orden: Carrera 3 (CON-GEN) → Periodo 2 → Paralelos → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 104-117 (2A: 104-110, 2B: 111-117)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos_horarios;

-- ============================================
-- SEGUNDO A - TARDE (curso_id: 104-110)
-- ============================================

-- CONTABILIDAD II (curso_id = 104) - 4 horas/semana
-- LUNES (2 bloques) + MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(396, 104, 5, NULL, 1),    -- LUNES 16:45 (horario_id=5)
(397, 104, 6, NULL, 2),    -- LUNES 17:30 (horario_id=6)
(398, 104, 11, NULL, 3),    -- MARTES 16:45 (horario_id=11)
(399, 104, 12, NULL, 4);   -- MARTES 17:30 (horario_id=12)

-- CONTABILIDAD DE COSTOS I (curso_id = 105) - 4 horas/semana
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(400, 105, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(401, 105, 8, NULL, 2),    -- MARTES 14:30 (horario_id=8)
(402, 105, 9, NULL, 3),    -- MARTES 15:15 (horario_id=9)
(403, 105, 10, NULL, 4);   -- MARTES 16:00 (horario_id=10)

-- CONTABILIDAD DE SOCIEDADES (curso_id = 106) - 2 horas/semana
-- MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(404, 106, 15, NULL, 1),   -- MIERCOLES 15:15 (horario_id=15)
(405, 106, 16, NULL, 2);   -- MIERCOLES 16:00 (horario_id=16)

-- CONTABILIDAD DE SEGUROS (curso_id = 107) - 4 horas/semana
-- LUNES (1 bloque) + JUEVES (2 bloques) + MIÉRCOLES (1 bloque)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(406, 107, 5, NULL, 1),    -- LUNES 16:45 (horario_id=5)
(407, 107, 21, NULL, 2),    -- JUEVES 15:15 (horario_id=21)
(408, 107, 22, NULL, 3),    -- JUEVES 16:00 (horario_id=22)
(409, 107, 13, NULL, 4);    -- MIERCOLES 13:45 (horario_id=13)

-- CONTABILIDAD BANCARIA Y COOPERATIVA (curso_id = 108) - 5 horas/semana
-- VIERNES (5 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(410, 108, 25, NULL, 1),   -- VIERNES 13:45 (horario_id=25)
(411, 108, 26, NULL, 2),   -- VIERNES 14:30 (horario_id=26)
(412, 108, 27, NULL, 3),   -- VIERNES 15:15 (horario_id=27)
(413, 108, 28, NULL, 4),   -- VIERNES 16:00 (horario_id=28)
(414, 108, 29, NULL, 5);   -- VIERNES 16:45 (horario_id=29)

-- EMPRENDIMIENTO PRODUCTIVO (curso_id = 109) - 4 horas/semana
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(415, 109, 19, NULL, 1),   -- JUEVES 13:45 (horario_id=19)
(416, 109, 20, NULL, 2),   -- JUEVES 14:30 (horario_id=20)
(417, 109, 29, NULL, 3),   -- VIERNES 16:45 (horario_id=29)
(418, 109, 30, NULL, 4);   -- VIERNES 17:30 (horario_id=30)

-- SISTEMA TRIBUTARIO (curso_id = 110) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(419, 110, 1, NULL, 1),    -- LUNES 13:45 (horario_id=1)
(420, 110, 2, NULL, 2),    -- LUNES 14:30 (horario_id=2)
(421, 110, 3, NULL, 3),    -- LUNES 15:15 (horario_id=3)
(422, 110, 4, NULL, 4);    -- LUNES 16:00 (horario_id=4)

-- ============================================
-- SEGUNDO B - NOCHE (curso_id: 111-117)
-- ============================================

-- CONTABILIDAD II (curso_id = 111) - 5 horas/semana
-- LUNES (1 bloque) + MARTES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(423, 111, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(424, 111, 36, NULL, 2),   -- MARTES 18:15 (horario_id=36)
(425, 111, 37, NULL, 3),   -- MARTES 19:00 (horario_id=37)
(426, 111, 38, NULL, 4),   -- MARTES 19:45 (horario_id=38)
(427, 111, 39, NULL, 5);   -- MARTES 20:30 (horario_id=39)

-- CONTABILIDAD DE COSTOS I (curso_id = 112) - 5 horas/semana
-- VIERNES (2 bloques) + SÁBADO (3 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(428, 112, 53, NULL, 1),   -- VIERNES 19:45 (horario_id=53)
(429, 112, 58, NULL, 2),    -- SABADO 16:30 (horario_id=58)
(430, 112, 59, NULL, 3),    -- SABADO 17:30 (horario_id=59)
(431, 112, 60, NULL, 4),    -- SABADO 18:15 (horario_id=60)
(432, 112, 54, NULL, 5);    -- VIERNES 20:30 (horario_id=54)

-- CONTABILIDAD DE SOCIEDADES (curso_id = 113) - 2 horas/semana
-- SÁBADO (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(433, 113, 56, NULL, 1),   -- SABADO 15:00 (horario_id=56)
(434, 113, 57, NULL, 2);   -- SABADO 15:45 (horario_id=57)

-- CONTABILIDAD DE SEGUROS (curso_id = 114) - 5 horas/semana
-- JUEVES (5 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(435, 114, 46, NULL, 1),   -- JUEVES 18:15 (horario_id=46)
(436, 114, 47, NULL, 2),   -- JUEVES 19:00 (horario_id=47)
(437, 114, 48, NULL, 3),   -- JUEVES 19:45 (horario_id=48)
(438, 114, 49, NULL, 4),   -- JUEVES 20:30 (horario_id=49)
(439, 114, 50, NULL, 5);   -- JUEVES 21:15 (horario_id=50)

-- CONTABILIDAD BANCARIA Y COOPERATIVA (curso_id = 115) - 5 horas/semana
-- LUNES (4 bloques) + MARTES (1 bloque)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(440, 115, 32, NULL, 1),   -- LUNES 19:00 (horario_id=32)
(441, 115, 33, NULL, 2),   -- LUNES 19:45 (horario_id=33)
(442, 115, 34, NULL, 3),   -- LUNES 20:30 (horario_id=34)
(443, 115, 35, NULL, 4),   -- LUNES 21:15 (horario_id=35)
(444, 115, 40, NULL, 5);   -- MARTES 21:15 (horario_id=40)

-- EMPRENDIMIENTO PRODUCTIVO (curso_id = 116) - 5 horas/semana
-- MIÉRCOLES (2 bloques) + VIERNES (3 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(445, 116, 41, NULL, 1),   -- MIERCOLES 18:15 (horario_id=41)
(446, 116, 42, NULL, 2),   -- MIERCOLES 19:00 (horario_id=42)
(447, 116, 51, NULL, 3),   -- VIERNES 18:15 (horario_id=51)
(448, 116, 52, NULL, 4),   -- VIERNES 19:00 (horario_id=52)
(449, 116, 53, NULL, 5);   -- VIERNES 19:45 (horario_id=53)

-- SISTEMA TRIBUTARIO (curso_id = 117) - 5 horas/semana
-- MIÉRCOLES (3 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(450, 117, 43, NULL, 1),   -- MIERCOLES 19:45 (horario_id=43)
(451, 117, 44, NULL, 2),   -- MIERCOLES 20:30 (horario_id=44)
(452, 117, 45, NULL, 3),   -- MIERCOLES 21:15 (horario_id=45)
(453, 117, 46, NULL, 4),   -- JUEVES 18:15 (horario_id=46)
(454, 117, 47, NULL, 5);   -- JUEVES 19:00 (horario_id=47)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TARDE): 7 cursos × ~4-5 bloques = 27 registros (IDs 396-422)
-- PARALELO B (NOCHE): 7 cursos × ~5 bloques = 35 registros (IDs 423-454)
-- TOTAL: 62 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
