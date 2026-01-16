-- ============================================
-- SEEDER: cursos_horarios - CONTADURÍA GENERAL TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: TERCERO A (TARDE), TERCERO B (TARDE)
-- ============================================
-- Orden: Carrera 3 (CON-GEN) → Periodo 3 → Paralelos → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 118-133 (3A: 118-125, 3B: 126-133)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Aulas: LAB-1=1

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos_horarios;

-- ============================================
-- TERCERO A - TARDE (curso_id: 118-125)
-- ============================================

-- CONTABILIDAD AGROPECUARIA (curso_id = 118) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(455, 118, 1, NULL, 1),    -- LUNES 13:45 (horario_id=1)
(456, 118, 2, NULL, 2),    -- LUNES 14:30 (horario_id=2)
(457, 118, 3, NULL, 3),    -- LUNES 15:15 (horario_id=3)
(458, 118, 4, NULL, 4);    -- LUNES 16:00 (horario_id=4)

-- CONTABILIDAD DE COSTOS II (curso_id = 119) - 4 horas/semana
-- JUEVES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(459, 119, 19, NULL, 1),   -- JUEVES 13:45 (horario_id=19)
(460, 119, 20, NULL, 2),   -- JUEVES 14:30 (horario_id=20)
(461, 119, 21, NULL, 3),   -- JUEVES 15:15 (horario_id=21)
(462, 119, 22, NULL, 4);   -- JUEVES 16:00 (horario_id=22)

-- CONTABILIDAD GUBERNAMENTAL (curso_id = 120) - 4 horas/semana
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(463, 120, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(464, 120, 8, NULL, 2),    -- MARTES 14:30 (horario_id=8)
(465, 120, 23, NULL, 3),   -- JUEVES 16:45 (horario_id=23)
(466, 120, 24, NULL, 4);   -- JUEVES 17:30 (horario_id=24)

-- CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL) (curso_id = 121) - 4 horas/semana
-- VIERNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(467, 121, 25, NULL, 1),   -- VIERNES 13:45 (horario_id=25)
(468, 121, 26, NULL, 2),   -- VIERNES 14:30 (horario_id=26)
(469, 121, 27, NULL, 3),   -- VIERNES 15:15 (horario_id=27)
(470, 121, 28, NULL, 4);   -- VIERNES 16:00 (horario_id=28)

-- CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE) (curso_id = 122) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(471, 122, 5, NULL, 1),    -- LUNES 16:45 (horario_id=5)
(472, 122, 6, NULL, 2);    -- LUNES 17:30 (horario_id=6)

-- GABINETE CONTABLE INFORMÁTICO (curso_id = 123) - 4 horas/semana LAB 1
-- MIÉRCOLES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(473, 123, 17, 1, 1),      -- MIERCOLES 16:45 (horario_id=17)
(474, 123, 18, 1, 2),      -- MIERCOLES 17:30 (horario_id=18)
(475, 123, 29, 1, 3),      -- VIERNES 16:45 (horario_id=29)
(476, 123, 30, 1, 4);      -- VIERNES 17:30 (horario_id=30)

-- ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS (curso_id = 124) - 4 horas/semana
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(477, 124, 9, NULL, 1),    -- MARTES 15:15 (horario_id=9)
(478, 124, 10, NULL, 2),   -- MARTES 16:00 (horario_id=10)
(479, 124, 11, NULL, 3),   -- MARTES 16:45 (horario_id=11)
(480, 124, 12, NULL, 4);   -- MARTES 17:30 (horario_id=12)

-- TALLER DE MODALIDAD DE GRADUACIÓN (curso_id = 125) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(481, 125, 13, NULL, 1),   -- MIERCOLES 13:45 (horario_id=13)
(482, 125, 14, NULL, 2),   -- MIERCOLES 14:30 (horario_id=14)
(483, 125, 15, NULL, 3),   -- MIERCOLES 15:15 (horario_id=15)
(484, 125, 16, NULL, 4);   -- MIERCOLES 16:00 (horario_id=16)

-- ============================================
-- TERCERO B - TARDE (curso_id: 126-133)
-- ============================================

-- CONTABILIDAD AGROPECUARIA (curso_id = 126) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(485, 126, 1, NULL, 1),    -- LUNES 13:45 (horario_id=1)
(486, 126, 2, NULL, 2),    -- LUNES 14:30 (horario_id=2)
(487, 126, 3, NULL, 3),    -- LUNES 15:15 (horario_id=3)
(488, 126, 4, NULL, 4);    -- LUNES 16:00 (horario_id=4)

-- CONTABILIDAD DE COSTOS II (curso_id = 127) - 4 horas/semana
-- JUEVES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(489, 127, 19, NULL, 1),   -- JUEVES 13:45 (horario_id=19)
(490, 127, 20, NULL, 2),   -- JUEVES 14:30 (horario_id=20)
(491, 127, 21, NULL, 3),   -- JUEVES 15:15 (horario_id=21)
(492, 127, 22, NULL, 4);   -- JUEVES 16:00 (horario_id=22)

-- CONTABILIDAD GUBERNAMENTAL (curso_id = 128) - 4 horas/semana
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(493, 128, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(494, 128, 8, NULL, 2),    -- MARTES 14:30 (horario_id=8)
(495, 128, 23, NULL, 3),   -- JUEVES 16:45 (horario_id=23)
(496, 128, 24, NULL, 4);   -- JUEVES 17:30 (horario_id=24)

-- CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL) (curso_id = 129) - 4 horas/semana
-- VIERNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(497, 129, 25, NULL, 1),   -- VIERNES 13:45 (horario_id=25)
(498, 129, 26, NULL, 2),   -- VIERNES 14:30 (horario_id=26)
(499, 129, 27, NULL, 3),   -- VIERNES 15:15 (horario_id=27)
(500, 129, 28, NULL, 4);   -- VIERNES 16:00 (horario_id=28)

-- CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE) (curso_id = 130) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(501, 130, 5, NULL, 1),    -- LUNES 16:45 (horario_id=5)
(502, 130, 6, NULL, 2);    -- LUNES 17:30 (horario_id=6)

-- GABINETE CONTABLE INFORMÁTICO (curso_id = 131) - 4 horas/semana LAB 1
-- MIÉRCOLES (2 bloques) + VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(503, 131, 17, 1, 1),      -- MIERCOLES 16:45 (horario_id=17)
(504, 131, 18, 1, 2),      -- MIERCOLES 17:30 (horario_id=18)
(505, 131, 29, 1, 3),      -- VIERNES 16:45 (horario_id=29)
(506, 131, 30, 1, 4);      -- VIERNES 17:30 (horario_id=30)

-- ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS (curso_id = 132) - 4 horas/semana
-- MARTES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(507, 132, 9, NULL, 1),    -- MARTES 15:15 (horario_id=9)
(508, 132, 10, NULL, 2),   -- MARTES 16:00 (horario_id=10)
(509, 132, 11, NULL, 3),   -- MARTES 16:45 (horario_id=11)
(510, 132, 12, NULL, 4);   -- MARTES 17:30 (horario_id=12)

-- TALLER DE MODALIDAD DE GRADUACIÓN (curso_id = 133) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(511, 133, 13, NULL, 1),   -- MIERCOLES 13:45 (horario_id=13)
(512, 133, 14, NULL, 2),   -- MIERCOLES 14:30 (horario_id=14)
(513, 133, 15, NULL, 3),   -- MIERCOLES 15:15 (horario_id=15)
(514, 133, 16, NULL, 4);   -- MIERCOLES 16:00 (horario_id=16)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TARDE): 8 cursos × ~4 bloques = 30 registros (IDs 455-484)
-- PARALELO B (TARDE): 8 cursos × ~4 bloques = 30 registros (IDs 485-514)
-- TOTAL: 60 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
