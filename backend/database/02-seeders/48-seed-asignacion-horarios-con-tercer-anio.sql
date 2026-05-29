-- ============================================
-- SEEDER: asignacion_horarios - CONTADURÍA GENERAL TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: TERCERO A (TARDE), TERCERO B (NOCHE)
-- ============================================
-- Bloques horarios (cuelgan de asignacion_docente_id)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- IDs oferta (asignacion_docente_id ref): 125-140 (3A: 125-132, 3B: 133-140)
-- Bloques PK (asignacion_horarios.id): 481–540 (continúa desde seeder 47, id 480; fin cadena 40–48)

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- asignacion_docente_id = 125 (bloques 481-484)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(481, 125, 7, NULL, 1),
(482, 125, 8, NULL, 2),
(483, 125, 9, NULL, 3),
(484, 125, 10, NULL, 4);

-- asignacion_docente_id = 126 (bloques 485-488)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(485, 126, 11, NULL, 1),
(486, 126, 12, NULL, 2),
(487, 126, 17, NULL, 3),
(488, 126, 18, NULL, 4);

-- asignacion_docente_id = 127 (bloques 489-492)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(489, 127, 13, NULL, 1),
(490, 127, 14, NULL, 2),
(491, 127, 15, NULL, 3),
(492, 127, 16, NULL, 4);

-- asignacion_docente_id = 128 (bloques 493-496)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(493, 128, 23, NULL, 1),
(494, 128, 24, NULL, 2),
(495, 128, 29, NULL, 3),
(496, 128, 30, NULL, 4);

-- asignacion_docente_id = 129 (bloques 497-498)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(497, 129, 5, NULL, 1),
(498, 129, 6, NULL, 2);

-- asignacion_docente_id = 130 (bloques 499-502)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(499, 130, 1, 1, 1),
(500, 130, 2, 1, 2),
(501, 130, 3, 1, 3),
(502, 130, 4, 1, 4);

-- asignacion_docente_id = 131 (bloques 503-506)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(503, 131, 19, NULL, 1),
(504, 131, 20, NULL, 2),
(505, 131, 21, NULL, 3),
(506, 131, 22, NULL, 4);

-- asignacion_docente_id = 132 (bloques 507-510)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(507, 132, 25, NULL, 1),
(508, 132, 26, NULL, 2),
(509, 132, 27, NULL, 3),
(510, 132, 28, NULL, 4);

-- asignacion_docente_id = 133 (bloques 511-514)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(511, 133, 31, NULL, 1),
(512, 133, 32, NULL, 2),
(513, 133, 36, NULL, 3),
(514, 133, 37, NULL, 4);

-- asignacion_docente_id = 134 (bloques 515-518)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(515, 134, 41, NULL, 1),
(516, 134, 42, NULL, 2),
(517, 134, 43, NULL, 3),
(518, 134, 44, NULL, 4);

-- asignacion_docente_id = 135 (bloques 519-522)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(519, 135, 45, NULL, 1),
(520, 135, 56, NULL, 2),
(521, 135, 57, NULL, 3),
(522, 135, 58, NULL, 4);

-- asignacion_docente_id = 136 (bloques 523-526)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(523, 136, 54, NULL, 1),
(524, 136, 55, NULL, 2),
(525, 136, 59, NULL, 3),
(526, 136, 60, NULL, 4);

-- asignacion_docente_id = 137 (bloques 527-528)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(527, 137, 49, NULL, 1),
(528, 137, 50, NULL, 2);

-- asignacion_docente_id = 138 (bloques 529-532)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(529, 138, 33, 1, 1),
(530, 138, 34, 1, 2),
(531, 138, 35, 1, 3),
(532, 138, 38, 1, 4);

-- asignacion_docente_id = 139 (bloques 533-536)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(533, 139, 40, NULL, 1),
(534, 139, 51, NULL, 2),
(535, 139, 52, NULL, 3),
(536, 139, 53, NULL, 4);

-- asignacion_docente_id = 140 (bloques 537-540)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(537, 140, 39, NULL, 1),
(538, 140, 46, NULL, 2),
(539, 140, 47, NULL, 3),
(540, 140, 48, NULL, 4);

SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 60 bloques (bloques 482-541)
