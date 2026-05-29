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

-- Fuente: Excel horarios oficial 2026-02-18 (3°B NOCHE); dump servidor (3°A)
-- Nota: pg=18 (CON 3°B) turno NOCHE según Excel 2026

-- asignacion_docente_id = 125
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(480, 125, 7, NULL, 1),
(481, 125, 8, NULL, 2),
(482, 125, 9, NULL, 3),
(483, 125, 10, NULL, 4);

-- asignacion_docente_id = 126
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(492, 126, 11, NULL, 1),
(493, 126, 12, NULL, 2),
(494, 126, 17, NULL, 3),
(495, 126, 18, NULL, 4);

-- asignacion_docente_id = 127
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(484, 127, 13, NULL, 1),
(485, 127, 14, NULL, 2),
(486, 127, 15, NULL, 3),
(487, 127, 16, NULL, 4);

-- asignacion_docente_id = 128
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(496, 128, 23, NULL, 1),
(497, 128, 24, NULL, 2),
(498, 128, 29, NULL, 3),
(499, 128, 30, NULL, 4);

-- asignacion_docente_id = 129
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(500, 129, 5, NULL, 1),
(501, 129, 6, NULL, 2);

-- asignacion_docente_id = 130
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(502, 130, 1, 1, 1),
(503, 130, 2, 1, 2),
(504, 130, 3, 1, 3),
(505, 130, 4, 1, 4);

-- asignacion_docente_id = 131
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(506, 131, 19, NULL, 1),
(507, 131, 20, NULL, 2),
(508, 131, 21, NULL, 3),
(509, 131, 22, NULL, 4);

-- asignacion_docente_id = 132
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(488, 132, 25, NULL, 1),
(489, 132, 26, NULL, 2),
(490, 132, 27, NULL, 3),
(491, 132, 28, NULL, 4);

-- asignacion_docente_id = 133 — Agropecuaria (4h LUN/MAR NOCHE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(520, 133, 31, NULL, 1),
(521, 133, 32, NULL, 2),
(522, 133, 36, NULL, 3),
(523, 133, 37, NULL, 4);

-- asignacion_docente_id = 134 — Costos II (4h MIE NOCHE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(536, 134, 41, NULL, 1),
(537, 134, 42, NULL, 2),
(538, 134, 43, NULL, 3),
(539, 134, 44, NULL, 4);

-- asignacion_docente_id = 135 — Gubernamental (4h MIE/VIE + SAB NOCHE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(513, 135, 45, NULL, 1),
(510, 135, 56, NULL, 2),
(511, 135, 57, NULL, 3),
(512, 135, 58, NULL, 4);

-- asignacion_docente_id = 136 — Extractiva (4h VIE + SAB NOCHE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(528, 136, 54, NULL, 1),
(529, 136, 55, NULL, 2),
(530, 136, 59, NULL, 3),
(531, 136, 60, NULL, 4);

-- asignacion_docente_id = 137 — Servicios (2h JUE NOCHE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(518, 137, 49, NULL, 1),
(519, 137, 50, NULL, 2);

-- asignacion_docente_id = 138 — Gabinete (4h LUN NOCHE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(524, 138, 33, 1, 1),
(525, 138, 34, 1, 2),
(526, 138, 35, 1, 3),
(527, 138, 38, 1, 4);

-- asignacion_docente_id = 139 — Análisis EEFF (4h MAR/VIE NOCHE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(583, 139, 40, NULL, 1),
(532, 139, 51, NULL, 2),
(533, 139, 52, NULL, 3),
(534, 139, 53, NULL, 4);

-- asignacion_docente_id = 140 — Modalidad graduación (4h JUE/MAR NOCHE)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(514, 140, 39, NULL, 1),
(515, 140, 46, NULL, 2),
(516, 140, 47, NULL, 3),
(517, 140, 48, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 58 bloques asignacion_horarios (Excel 2026-02-18)
