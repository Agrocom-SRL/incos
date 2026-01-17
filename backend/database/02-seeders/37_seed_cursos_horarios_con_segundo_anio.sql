-- ============================================
-- SEEDER: cursos_horarios - CONTADURÍA GENERAL SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: SEGUNDO A (TARDE), SEGUNDO B (NOCHE)
-- ============================================
-- Orden: Carrera 3 (CON-GEN) → Periodo 2 → Paralelos → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 111-124 (2A: 111-117, 2B: 118-124)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Continuación desde último ID del seeder de primer año: 419

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos_horarios;

-- ============================================
-- SEGUNDO A - TARDE (curso_id: 111-117)
-- ============================================

-- SISTEMA TRIBUTARIO (curso_id = 111, asignatura_plan_id = 61) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(420, 111, 1, NULL, 1),    -- LUNES 13:45 (horario_id=1)
(421, 111, 2, NULL, 2),    -- LUNES 14:30 (horario_id=2)
(422, 111, 3, NULL, 3),    -- LUNES 15:15 (horario_id=3)
(423, 111, 4, NULL, 4);    -- LUNES 16:00 (horario_id=4)

-- CONTABILIDAD DE COSTOS I (curso_id = 112, asignatura_plan_id = 56) - 6 horas/semana
-- MARTES (4 bloques) + MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(424, 112, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(425, 112, 8, NULL, 2),    -- MARTES 14:30 (horario_id=8)
(426, 112, 9, NULL, 3),    -- MARTES 15:15 (horario_id=9)
(427, 112, 10, NULL, 4),   -- MARTES 16:00 (horario_id=10)
(428, 112, 13, NULL, 5),   -- MIERCOLES 13:45 (horario_id=13)
(429, 112, 14, NULL, 6);   -- MIERCOLES 14:30 (horario_id=14)

-- CONTABILIDAD DE SEGUROS (curso_id = 113, asignatura_plan_id = 58) - 2 horas/semana
-- MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(430, 113, 15, NULL, 1),   -- MIERCOLES 15:15 (horario_id=15)
(431, 113, 16, NULL, 2);   -- MIERCOLES 16:00 (horario_id=16)

-- CONTABILIDAD DE SOCIEDADES (curso_id = 114, asignatura_plan_id = 57) - 4 horas/semana
-- JUEVES (2 bloques) + LUNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(432, 114, 21, NULL, 1),   -- JUEVES 15:15 (horario_id=21)
(433, 114, 22, NULL, 2),   -- JUEVES 16:00 (horario_id=22)
(434, 114, 5, NULL, 3),    -- LUNES 16:45 (horario_id=5)
(435, 114, 6, NULL, 4);    -- LUNES 17:30 (horario_id=6)

-- CONTABILIDAD BANCARIA Y COOPERATIVA (curso_id = 115, asignatura_plan_id = 59) - 4 horas/semana
-- VIERNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(436, 115, 25, NULL, 1),   -- VIERNES 13:45 (horario_id=25)
(437, 115, 26, NULL, 2),   -- VIERNES 14:30 (horario_id=26)
(438, 115, 27, NULL, 3),   -- VIERNES 15:15 (horario_id=27)
(439, 115, 28, NULL, 4);   -- VIERNES 16:00 (horario_id=28)

-- EMPRENDIMIENTO PRODUCTIVO (curso_id = 116, asignatura_plan_id = 60) - 4 horas/semana
-- JUEVES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(440, 116, 19, NULL, 1),   -- JUEVES 13:45 (horario_id=19)
(441, 116, 20, NULL, 2),   -- JUEVES 14:30 (horario_id=20)
(442, 116, 29, NULL, 3),   -- VIERNES 16:45 (horario_id=29)
(443, 116, 30, NULL, 4);   -- VIERNES 17:30 (horario_id=30)

-- CONTABILIDAD II (curso_id = 117, asignatura_plan_id = 55) - 6 horas/semana
-- MARTES (2 bloques) + MIÉRCOLES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(444, 117, 11, NULL, 1),   -- MARTES 16:45 (horario_id=11)
(445, 117, 12, NULL, 2),   -- MARTES 17:30 (horario_id=12)
(446, 117, 17, NULL, 3),   -- MIERCOLES 16:45 (horario_id=17)
(447, 117, 18, NULL, 4),   -- MIERCOLES 17:30 (horario_id=18)
(448, 117, 23, NULL, 5),   -- JUEVES 16:45 (horario_id=23)
(449, 117, 24, NULL, 6);   -- JUEVES 17:30 (horario_id=24)

-- ============================================
-- SEGUNDO B - NOCHE (curso_id: 118-124)
-- ============================================

-- CONTABILIDAD II (curso_id = 118, asignatura_plan_id = 55) - 6 horas/semana
-- LUNES (1 bloque) + MARTES (5 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(450, 118, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(451, 118, 36, NULL, 2),   -- MARTES 18:15 (horario_id=36)
(452, 118, 37, NULL, 3),   -- MARTES 19:00 (horario_id=37)
(453, 118, 38, NULL, 4),   -- MARTES 19:45 (horario_id=38)
(454, 118, 39, NULL, 5),   -- MARTES 20:30 (horario_id=39)
(455, 118, 40, NULL, 6);   -- MARTES 21:15 (horario_id=40)

-- CONTABILIDAD DE COSTOS I (curso_id = 119, asignatura_plan_id = 56) - 6 horas/semana
-- VIERNES (3 bloques) + SÁBADO (3 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(456, 119, 53, NULL, 1),   -- VIERNES 19:45 (horario_id=53)
(457, 119, 54, NULL, 2),   -- VIERNES 20:30 (horario_id=54)
(458, 119, 55, NULL, 3),   -- VIERNES 21:15 (horario_id=55)
(459, 119, 59, NULL, 4),   -- SABADO 17:30 (horario_id=59)
(460, 119, 60, NULL, 5),   -- SABADO 18:15 (horario_id=60)
(461, 119, 58, NULL, 6);   -- SABADO 16:30 (horario_id=58) - Periodo 3 del sábado

-- CONTABILIDAD DE SOCIEDADES (curso_id = 120, asignatura_plan_id = 57) - 4 horas/semana
-- JUEVES (4 bloques) - Periodos 2-5 según imagen
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(462, 120, 47, NULL, 1),   -- JUEVES 19:00 (horario_id=47) - Periodo 2
(463, 120, 48, NULL, 2),   -- JUEVES 19:45 (horario_id=48) - Periodo 3
(464, 120, 49, NULL, 3),   -- JUEVES 20:30 (horario_id=49) - Periodo 4
(465, 120, 50, NULL, 4);   -- JUEVES 21:15 (horario_id=50) - Periodo 5

-- CONTABILIDAD DE SEGUROS (curso_id = 121, asignatura_plan_id = 58) - 2 horas/semana
-- SÁBADO (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(466, 121, 56, NULL, 1),   -- SABADO 15:00 (horario_id=56)
(467, 121, 57, NULL, 2);   -- SABADO 15:45 (horario_id=57)

-- CONTABILIDAD BANCARIA Y COOPERATIVA (curso_id = 122, asignatura_plan_id = 59) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(468, 122, 32, NULL, 1),   -- LUNES 19:00 (horario_id=32)
(469, 122, 33, NULL, 2),   -- LUNES 19:45 (horario_id=33)
(470, 122, 34, NULL, 3),   -- LUNES 20:30 (horario_id=34)
(471, 122, 35, NULL, 4);   -- LUNES 21:15 (horario_id=35)

-- EMPRENDIMIENTO PRODUCTIVO (curso_id = 123, asignatura_plan_id = 60) - 4 horas/semana
-- MIÉRCOLES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(472, 123, 41, NULL, 1),   -- MIERCOLES 18:15 (horario_id=41)
(473, 123, 42, NULL, 2),   -- MIERCOLES 19:00 (horario_id=42)
(474, 123, 51, NULL, 3),   -- VIERNES 18:15 (horario_id=51)
(475, 123, 52, NULL, 4);   -- VIERNES 19:00 (horario_id=52)

-- SISTEMA TRIBUTARIO (curso_id = 124, asignatura_plan_id = 61) - 4 horas/semana
-- MIÉRCOLES (3 bloques) + JUEVES (1 bloque)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(476, 124, 43, NULL, 1),   -- MIERCOLES 19:45 (horario_id=43)
(477, 124, 44, NULL, 2),   -- MIERCOLES 20:30 (horario_id=44)
(478, 124, 45, NULL, 3),   -- MIERCOLES 21:15 (horario_id=45)
(479, 124, 46, NULL, 4);   -- JUEVES 18:15 (horario_id=46)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (SEGUNDO A - TARDE): 7 cursos = 28 registros (IDs 420-449)
--   SISTEMA TRIBUTARIO: 4 registros (420-423)
--   CONTABILIDAD DE COSTOS I: 6 registros (424-429)
--   CONTABILIDAD DE SEGUROS: 2 registros (430-431)
--   CONTABILIDAD DE SOCIEDADES: 4 registros (432-435)
--   CONTABILIDAD BANCARIA Y COOPERATIVA: 4 registros (436-439)
--   EMPRENDIMIENTO PRODUCTIVO: 4 registros (440-443)
--   CONTABILIDAD II: 6 registros (444-449)
--
-- PARALELO B (SEGUNDO B - NOCHE): 7 cursos = 30 registros (IDs 450-479)
--   CONTABILIDAD II: 6 registros (450-455)
--   CONTABILIDAD DE COSTOS I: 6 registros (456-461)
--   CONTABILIDAD DE SOCIEDADES: 4 registros (462-465)
--   CONTABILIDAD DE SEGUROS: 2 registros (466-467)
--   CONTABILIDAD BANCARIA Y COOPERATIVA: 4 registros (468-471)
--   EMPRENDIMIENTO PRODUCTIVO: 4 registros (472-475)
--   SISTEMA TRIBUTARIO: 4 registros (476-479)
--
-- TOTAL: 58 registros (IDs 420-479)
-- NOTA: Continuación desde el último ID del seeder de primer año (419)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
