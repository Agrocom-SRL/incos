-- ============================================
-- SEEDER: asignacion_horarios - CONTADURÍA GENERAL TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: TERCERO A (TARDE), TERCERO B (NOCHE)
-- ============================================
-- Bloques horarios (cuelgan de asignacion_docente_id)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- IDs oferta (asignacion_docente_id ref): 125-140 (3A: 125-132, 3B: 133-140)
-- Bloques PK (asignacion_horarios.id): 481–540 (continúa desde seeder 47, id 480; fin cadena 40–48)
-- aula_id siempre NULL: hereda aula base de paralelos_gestion (sin override por bloque en seed)

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- asignacion_docente_id = 125 (bloques 481-484)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(481, 125, 7, 1),
(482, 125, 8, 2),
(483, 125, 9, 3),
(484, 125, 10, 4);

-- asignacion_docente_id = 126 (bloques 485-488)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(485, 126, 11, 1),
(486, 126, 12, 2),
(487, 126, 17, 3),
(488, 126, 18, 4);

-- asignacion_docente_id = 127 (bloques 489-492)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(489, 127, 13, 1),
(490, 127, 14, 2),
(491, 127, 15, 3),
(492, 127, 16, 4);

-- asignacion_docente_id = 128 (bloques 493-496)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(493, 128, 23, 1),
(494, 128, 24, 2),
(495, 128, 29, 3),
(496, 128, 30, 4);

-- asignacion_docente_id = 129 (bloques 497-498)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(497, 129, 5, 1),
(498, 129, 6, 2);

-- asignacion_docente_id = 130 (bloques 499-502)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(499, 130, 1, 1),
(500, 130, 2, 2),
(501, 130, 3, 3),
(502, 130, 4, 4);

-- asignacion_docente_id = 131 (bloques 503-506)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(503, 131, 19, 1),
(504, 131, 20, 2),
(505, 131, 21, 3),
(506, 131, 22, 4);

-- asignacion_docente_id = 132 (bloques 507-510)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(507, 132, 25, 1),
(508, 132, 26, 2),
(509, 132, 27, 3),
(510, 132, 28, 4);

-- asignacion_docente_id = 133 (bloques 511-514)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(511, 133, 31, 1),
(512, 133, 32, 2),
(513, 133, 36, 3),
(514, 133, 37, 4);

-- asignacion_docente_id = 134 (bloques 515-518)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(515, 134, 41, 1),
(516, 134, 42, 2),
(517, 134, 43, 3),
(518, 134, 44, 4);

-- asignacion_docente_id = 135 (bloques 519-522)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(519, 135, 45, 1),
(520, 135, 56, 2),
(521, 135, 57, 3),
(522, 135, 58, 4);

-- asignacion_docente_id = 136 (bloques 523-526)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(523, 136, 54, 1),
(524, 136, 55, 2),
(525, 136, 59, 3),
(526, 136, 60, 4);

-- asignacion_docente_id = 137 (bloques 527-528)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(527, 137, 49, 1),
(528, 137, 50, 2);

-- asignacion_docente_id = 138 (bloques 529-532)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(529, 138, 33, 1),
(530, 138, 34, 2),
(531, 138, 35, 3),
(532, 138, 38, 4);

-- asignacion_docente_id = 139 (bloques 533-536)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(533, 139, 40, 1),
(534, 139, 51, 2),
(535, 139, 52, 3),
(536, 139, 53, 4);

-- asignacion_docente_id = 140 (bloques 537-540)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(537, 140, 39, 1),
(538, 140, 46, 2),
(539, 140, 47, 3),
(540, 140, 48, 4);

SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 60 bloques (bloques 482-541)
