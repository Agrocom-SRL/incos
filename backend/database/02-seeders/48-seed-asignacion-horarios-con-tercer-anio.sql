-- ============================================
-- SEEDER: asignacion_horarios - CONTADURÍA GENERAL TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: TERCERO A (TARDE), TERCERO B (NOCHE)
-- ============================================
-- Sprint 5 — Bloques horarios (cuelgan de asignacion_docente_id, no de oferta)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- Orden: Carrera 3 (CON-GEN) → Periodo 3 → Paralelos → Asignaciones → Bloques → Aulas
-- IDs oferta (asignacion_docente_id ref): 125-140 (3A: 125-132, 3B: 133-140)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Aulas: LAB-1=1, AULA-6=5
-- Continuación desde último ID del seeder de segundo año: 479

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignacion_horarios;

-- ============================================
-- TERCERO A - TARDE (asignacion_docente_id: 125-132)
-- ============================================

-- CONTABILIDAD AGROPECUARIA (asignacion_docente_id = 125, asignatura_plan_id = 62) - 4 horas/semana
-- LUNES (4 bloques) - Periodos 1-4
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(480, 125, 1, NULL, 1),    -- LUNES 13:45 (horario_id=1)
(481, 125, 2, NULL, 2),    -- LUNES 14:30 (horario_id=2)
(482, 125, 3, NULL, 3),    -- LUNES 15:15 (horario_id=3)
(483, 125, 4, NULL, 4);    -- LUNES 16:00 (horario_id=4)

-- CONTABILIDAD GUBERNAMENTAL (asignacion_docente_id = 127, asignatura_plan_id = 64) - 4 horas/semana
-- MARTES (2 bloques) + JUEVES (2 bloques) - Periodos 1-2 y 5-6
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(484, 127, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(485, 127, 8, NULL, 2),    -- MARTES 14:30 (horario_id=8)
(486, 127, 23, NULL, 3),   -- JUEVES 16:45 (horario_id=23)
(487, 127, 24, NULL, 4);   -- JUEVES 17:30 (horario_id=24)

-- TALLER DE MODALIDAD DE GRADUACIÓN (asignacion_docente_id = 132, asignatura_plan_id = 69) - 4 horas/semana
-- MIÉRCOLES (4 bloques) - Periodos 1-4
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(488, 132, 13, NULL, 1),   -- MIERCOLES 13:45 (horario_id=13)
(489, 132, 14, NULL, 2),   -- MIERCOLES 14:30 (horario_id=14)
(490, 132, 15, NULL, 3),   -- MIERCOLES 15:15 (horario_id=15)
(491, 132, 16, NULL, 4);   -- MIERCOLES 16:00 (horario_id=16)

-- CONTABILIDAD DE COSTOS II (asignacion_docente_id = 126, asignatura_plan_id = 63) - 4 horas/semana
-- JUEVES (4 bloques) - Periodos 1-4
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(492, 126, 19, NULL, 1),   -- JUEVES 13:45 (horario_id=19)
(493, 126, 20, NULL, 2),   -- JUEVES 14:30 (horario_id=20)
(494, 126, 21, NULL, 3),   -- JUEVES 15:15 (horario_id=21)
(495, 126, 22, NULL, 4);   -- JUEVES 16:00 (horario_id=22)

-- CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL) (asignacion_docente_id = 128, asignatura_plan_id = 65) - 4 horas/semana
-- VIERNES (4 bloques) - Periodos 1-4
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(496, 128, 25, NULL, 1),   -- VIERNES 13:45 (horario_id=25)
(497, 128, 26, NULL, 2),   -- VIERNES 14:30 (horario_id=26)
(498, 128, 27, NULL, 3),   -- VIERNES 15:15 (horario_id=27)
(499, 128, 28, NULL, 4);   -- VIERNES 16:00 (horario_id=28)

-- CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE) (asignacion_docente_id = 129, asignatura_plan_id = 66) - 2 horas/semana
-- LUNES (2 bloques) - Periodos 5-6
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(500, 129, 5, NULL, 1),    -- LUNES 16:45 (horario_id=5)
(501, 129, 6, NULL, 2);    -- LUNES 17:30 (horario_id=6)

-- GABINETE CONTABLE INFORMÁTICO (asignacion_docente_id = 130, asignatura_plan_id = 67) - 4 horas/semana LAB 1
-- MIÉRCOLES (2 bloques) + VIERNES (2 bloques) - Periodos 5-6
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(502, 130, 17, 1, 1),      -- MIERCOLES 16:45 (horario_id=17) - LAB 1
(503, 130, 18, 1, 2),      -- MIERCOLES 17:30 (horario_id=18) - LAB 1
(504, 130, 29, 1, 3),      -- VIERNES 16:45 (horario_id=29) - LAB 1
(505, 130, 30, 1, 4);      -- VIERNES 17:30 (horario_id=30) - LAB 1

-- ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS (asignacion_docente_id = 131, asignatura_plan_id = 68) - 4 horas/semana
-- MARTES (4 bloques) - Periodos 3-6
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(506, 131, 9, NULL, 1),    -- MARTES 15:15 (horario_id=9)
(507, 131, 10, NULL, 2),   -- MARTES 16:00 (horario_id=10)
(508, 131, 11, NULL, 3),   -- MARTES 16:45 (horario_id=11)
(509, 131, 12, NULL, 4);   -- MARTES 17:30 (horario_id=12)

-- ============================================
-- TERCERO B - NOCHE (asignacion_docente_id: 133-140)
-- ============================================

-- CONTABILIDAD GUBERNAMENTAL (asignacion_docente_id = 135, asignatura_plan_id = 64) - 4 horas/semana
-- LUNES (3 bloques) + JUEVES (1 bloque) - Periodos 1-3 y Periodo 1
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(510, 135, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(511, 135, 32, NULL, 2),   -- LUNES 19:00 (horario_id=32)
(512, 135, 33, NULL, 3),   -- LUNES 19:45 (horario_id=33)
(513, 135, 46, NULL, 4);   -- JUEVES 18:15 (horario_id=46)

-- TALLER DE MODALIDAD DE GRADUACIÓN (asignacion_docente_id = 140, asignatura_plan_id = 69) - 4 horas/semana
-- MARTES (2 bloques) + SÁBADO (2 bloques) - Periodos 1-2
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(514, 140, 36, NULL, 1),   -- MARTES 18:15 (horario_id=36)
(515, 140, 37, NULL, 2),   -- MARTES 19:00 (horario_id=37)
(516, 140, 56, NULL, 3),   -- SABADO 15:00 (horario_id=56)
(517, 140, 57, NULL, 4);   -- SABADO 15:45 (horario_id=57)

-- CONTABILIDAD DE SERVICIOS (CONSTRUCCIÓN, HOTELERÍA Y TRANSPORTE) (asignacion_docente_id = 137, asignatura_plan_id = 66) - 2 horas/semana
-- MIÉRCOLES (2 bloques) - Periodos 1-2
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(518, 137, 41, NULL, 1),   -- MIERCOLES 18:15 (horario_id=41)
(519, 137, 42, NULL, 2);   -- MIERCOLES 19:00 (horario_id=42)

-- CONTABILIDAD AGROPECUARIA (asignacion_docente_id = 133, asignatura_plan_id = 62) - 4 horas/semana
-- JUEVES (4 bloques) - Periodos 2-5
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(520, 133, 47, NULL, 1),   -- JUEVES 19:00 (horario_id=47)
(521, 133, 48, NULL, 2),   -- JUEVES 19:45 (horario_id=48)
(522, 133, 49, NULL, 3),   -- JUEVES 20:30 (horario_id=49)
(523, 133, 50, NULL, 4);   -- JUEVES 21:15 (horario_id=50)

-- GABINETE CONTABLE INFORMÁTICO (asignacion_docente_id = 138, asignatura_plan_id = 67) - 4 horas/semana
-- MARTES (2 bloques) + VIERNES (2 bloques) - Periodos 3-4 y Periodos 2-3
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(524, 138, 38, NULL, 1),   -- MARTES 19:45 (horario_id=38)
(525, 138, 39, NULL, 2),   -- MARTES 20:30 (horario_id=39)
(526, 138, 52, NULL, 3),   -- VIERNES 19:00 (horario_id=52)
(527, 138, 53, NULL, 4);   -- VIERNES 19:45 (horario_id=53)

-- CONTABILIDAD EXTRACTIVA (MINERA, PETROLERA Y FORESTAL) (asignacion_docente_id = 136, asignatura_plan_id = 65) - 4 horas/semana
-- VIERNES (1 bloque) + SÁBADO (3 bloques) - Periodo 1 y Periodos 3-5
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(528, 136, 51, NULL, 1),   -- VIERNES 18:15 (horario_id=51)
(529, 136, 58, NULL, 2),   -- SABADO 16:30 (horario_id=58)
(530, 136, 59, NULL, 3),   -- SABADO 17:30 (horario_id=59)
(531, 136, 60, NULL, 4);   -- SABADO 18:15 (horario_id=60)

-- ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS (asignacion_docente_id = 139, asignatura_plan_id = 68) - 4 horas/semana
-- MARTES (1 bloque) + MIÉRCOLES (3 bloques) - Periodo 5 y Periodos 3-5
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(532, 139, 40, NULL, 1),   -- MARTES 21:15 (horario_id=40)
(533, 139, 43, NULL, 2),   -- MIERCOLES 19:45 (horario_id=43)
(534, 139, 44, NULL, 3),   -- MIERCOLES 20:30 (horario_id=44)
(535, 139, 45, NULL, 4);   -- MIERCOLES 21:15 (horario_id=45)

-- CONTABILIDAD DE COSTOS II (asignacion_docente_id = 134, asignatura_plan_id = 63) - 4 horas/semana
-- LUNES (2 bloques) + VIERNES (2 bloques) - Periodos 4-5
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(536, 134, 34, NULL, 1),   -- LUNES 20:30 (horario_id=34)
(537, 134, 35, NULL, 2),   -- LUNES 21:15 (horario_id=35)
(538, 134, 54, NULL, 3),   -- VIERNES 20:30 (horario_id=54)
(539, 134, 55, NULL, 4);   -- VIERNES 21:15 (horario_id=55)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TERCERO A - TARDE): 8 cursos = 30 registros (IDs 480-509)
--   CONTABILIDAD AGROPECUARIA: 4 registros (480-483)
--   CONTABILIDAD GUBERNAMENTAL: 4 registros (484-487)
--   TALLER DE MODALIDAD DE GRADUACIÓN: 4 registros (488-491)
--   CONTABILIDAD DE COSTOS II: 4 registros (492-495)
--   CONTABILIDAD EXTRACTIVA: 4 registros (496-499)
--   CONTABILIDAD DE SERVICIOS: 2 registros (500-501)
--   GABINETE CONTABLE INFORMÁTICO: 4 registros (502-505)
--   ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS: 4 registros (506-509)
--
-- PARALELO B (TERCERO B - NOCHE): 8 cursos = 30 registros (IDs 510-539)
--   CONTABILIDAD GUBERNAMENTAL: 4 registros (510-513)
--   TALLER DE MODALIDAD DE GRADUACIÓN: 4 registros (514-517)
--   CONTABILIDAD DE SERVICIOS: 2 registros (518-519)
--   CONTABILIDAD AGROPECUARIA: 4 registros (520-523)
--   GABINETE CONTABLE INFORMÁTICO: 4 registros (524-527)
--   CONTABILIDAD EXTRACTIVA: 4 registros (528-531)
--   ANÁLISIS E INTERPRETACIÓN DE ESTADOS FINANCIEROS: 4 registros (532-535)
--   CONTABILIDAD DE COSTOS II: 4 registros (536-539)
--
-- TOTAL: 60 registros (IDs 480-539)
-- NOTA: Continuación desde el último ID del seeder de segundo año (479)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
