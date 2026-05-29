-- ============================================
-- SEEDER: asignacion_horarios - CONTADURÍA GENERAL SEGUNDO AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: SEGUNDO A (TARDE), SEGUNDO B (NOCHE)
-- ============================================
-- Sprint 5 — Bloques horarios (cuelgan de asignacion_docente_id, no de oferta)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- Orden: Carrera 3 (CON-GEN) → Periodo 2 → Paralelos → Asignaciones → Bloques → Aulas
-- IDs oferta (asignacion_docente_id ref): 111-124 (2A: 111-117, 2B: 118-124)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Continuación desde último ID del seeder de primer año: 419

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Fuente: dump servidor 2026-05-29 — 76 bloques (oferta 111–124)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 111
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(420, 111, 1, NULL, 1),
(577, 111, 23, NULL, 1),
(421, 111, 2, NULL, 2),
(578, 111, 24, NULL, 2),
(422, 111, 3, NULL, 3),
(565, 111, 11, NULL, 3),
(423, 111, 4, NULL, 4),
(566, 111, 12, NULL, 4),
(567, 111, 17, NULL, 5),
(568, 111, 18, NULL, 6);

-- asignacion_docente_id = 112
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(424, 112, 7, NULL, 1),
(425, 112, 8, NULL, 2),
(426, 112, 9, NULL, 3),
(427, 112, 10, NULL, 4),
(428, 112, 13, NULL, 5),
(429, 112, 14, NULL, 6);

-- asignacion_docente_id = 113
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(430, 113, 15, NULL, 1),
(579, 113, 21, NULL, 1),
(431, 113, 16, NULL, 2),
(580, 113, 22, NULL, 2),
(569, 113, 5, NULL, 3),
(570, 113, 6, NULL, 4);

-- asignacion_docente_id = 114
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(432, 114, 21, NULL, 1),
(571, 114, 15, NULL, 1),
(433, 114, 22, NULL, 2),
(572, 114, 16, NULL, 2),
(434, 114, 5, NULL, 3),
(435, 114, 6, NULL, 4);

-- asignacion_docente_id = 115
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(436, 115, 25, NULL, 1),
(437, 115, 26, NULL, 2),
(438, 115, 27, NULL, 3),
(439, 115, 28, NULL, 4);

-- asignacion_docente_id = 116
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(440, 116, 19, NULL, 1),
(441, 116, 20, NULL, 2),
(442, 116, 29, NULL, 3),
(443, 116, 30, NULL, 4);

-- asignacion_docente_id = 117
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(444, 117, 11, NULL, 1),
(448, 117, 23, NULL, 1),
(573, 117, 1, NULL, 1),
(445, 117, 12, NULL, 2),
(449, 117, 24, NULL, 2),
(574, 117, 2, NULL, 2),
(446, 117, 17, NULL, 3),
(575, 117, 3, NULL, 3),
(447, 117, 18, NULL, 4),
(576, 117, 4, NULL, 4);

-- asignacion_docente_id = 118
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(450, 118, 31, NULL, 1),
(451, 118, 36, NULL, 2),
(452, 118, 37, NULL, 3),
(453, 118, 38, NULL, 4),
(454, 118, 39, NULL, 5),
(455, 118, 40, NULL, 6);

-- asignacion_docente_id = 119
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(456, 119, 53, NULL, 1),
(457, 119, 54, NULL, 2),
(458, 119, 55, NULL, 3),
(459, 119, 59, NULL, 4),
(460, 119, 60, NULL, 5),
(461, 119, 58, NULL, 6);

-- asignacion_docente_id = 120
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(462, 120, 47, NULL, 1),
(463, 120, 48, NULL, 2),
(464, 120, 49, NULL, 3),
(465, 120, 50, NULL, 4);

-- asignacion_docente_id = 121
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(466, 121, 56, NULL, 1),
(467, 121, 57, NULL, 2);

-- asignacion_docente_id = 122
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(468, 122, 32, NULL, 1),
(469, 122, 33, NULL, 2),
(470, 122, 34, NULL, 3),
(471, 122, 35, NULL, 4);

-- asignacion_docente_id = 123
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(472, 123, 41, NULL, 1),
(473, 123, 42, NULL, 2),
(474, 123, 51, NULL, 3),
(475, 123, 52, NULL, 4);

-- asignacion_docente_id = 124
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(476, 124, 43, NULL, 1),
(477, 124, 44, NULL, 2),
(478, 124, 45, NULL, 3),
(479, 124, 46, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 76 bloques asignacion_horarios (oferta 111–124)
