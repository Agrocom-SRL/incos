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

-- Fuente: dump servidor 2026-05-29 — 66 bloques (oferta 125–140)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin
-- Nota: pg=18 (CON 3°B) turno TARDE en gestión 2026; bloques semana remapeados de NOCHE→TARDE vs dump

-- asignacion_docente_id = 125
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(480, 125, 1, NULL, 1),
(481, 125, 2, NULL, 2),
(482, 125, 3, NULL, 3),
(483, 125, 4, NULL, 4);

-- asignacion_docente_id = 126
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(492, 126, 19, NULL, 1),
(493, 126, 20, NULL, 2),
(494, 126, 21, NULL, 3),
(495, 126, 22, NULL, 4);

-- asignacion_docente_id = 127
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(484, 127, 7, NULL, 1),
(485, 127, 8, NULL, 2),
(486, 127, 23, NULL, 3),
(487, 127, 24, NULL, 4);

-- asignacion_docente_id = 128
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(496, 128, 25, NULL, 1),
(497, 128, 26, NULL, 2),
(498, 128, 27, NULL, 3),
(499, 128, 28, NULL, 4);

-- asignacion_docente_id = 129
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(500, 129, 5, NULL, 1),
(501, 129, 6, NULL, 2);

-- asignacion_docente_id = 130
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(502, 130, 17, 1, 1),
(503, 130, 18, 1, 2),
(504, 130, 29, 1, 3),
(505, 130, 30, 1, 4);

-- asignacion_docente_id = 131
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(506, 131, 9, NULL, 1),
(507, 131, 10, NULL, 2),
(508, 131, 11, NULL, 3),
(509, 131, 12, NULL, 4);

-- asignacion_docente_id = 132
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(488, 132, 13, NULL, 1),
(489, 132, 14, NULL, 2),
(490, 132, 15, NULL, 3),
(491, 132, 16, NULL, 4);

-- asignacion_docente_id = 133
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(520, 133, 20, NULL, 1),
(521, 133, 21, NULL, 2),
(522, 133, 22, NULL, 3),
(523, 133, 23, NULL, 4);

-- asignacion_docente_id = 134
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(536, 134, 4, NULL, 1),
(537, 134, 5, NULL, 2),
(538, 134, 28, NULL, 3),
(539, 134, 29, NULL, 4);

-- asignacion_docente_id = 135
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(513, 135, 19, NULL, 1),
(510, 135, 1, NULL, 2),
(511, 135, 2, NULL, 3),
(512, 135, 3, NULL, 4);

-- asignacion_docente_id = 136
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(529, 136, 58, NULL, 1),
(530, 136, 59, NULL, 2),
(531, 136, 60, NULL, 3),
(528, 136, 25, NULL, 4);

-- asignacion_docente_id = 137
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(518, 137, 13, NULL, 1),
(519, 137, 14, NULL, 2);

-- asignacion_docente_id = 138
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(524, 138, 9, NULL, 1),
(581, 138, 56, NULL, 1),
(525, 138, 10, NULL, 2),
(582, 138, 57, NULL, 2),
(526, 138, 26, NULL, 3),
(527, 138, 27, NULL, 4);

-- asignacion_docente_id = 139
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(583, 139, 9, NULL, 1),
(584, 139, 10, NULL, 2),
(532, 139, 11, NULL, 3),
(534, 139, 16, NULL, 3),
(533, 139, 15, NULL, 4),
(535, 139, 17, NULL, 4);

-- asignacion_docente_id = 140
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(514, 140, 7, NULL, 1),
(515, 140, 8, NULL, 2),
(516, 140, 56, NULL, 3),
(585, 140, 16, NULL, 3),
(517, 140, 57, NULL, 4),
(586, 140, 17, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 66 bloques asignacion_horarios (oferta 125–140)
