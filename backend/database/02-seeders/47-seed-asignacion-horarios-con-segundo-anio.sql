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

-- Fuente: Excel horarios oficial 2026-02-18
-- Fuente: dump servidor 2026-05-29 — 76 bloques (oferta 111–124)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 111
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(420, 111, 10, NULL, 1),
(421, 111, 11, NULL, 2),
(422, 111, 12, NULL, 3),
(423, 111, 16, NULL, 4),
(424, 111, 17, NULL, 5),
(425, 111, 18, NULL, 6);

-- asignacion_docente_id = 112
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(424, 112, 7, NULL, 1),
(425, 112, 8, NULL, 2),
(426, 112, 9, NULL, 3),
(427, 112, 13, NULL, 4),
(428, 112, 14, NULL, 5),
(429, 112, 15, NULL, 6);

-- asignacion_docente_id = 113
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(430, 113, 25, NULL, 1),
(431, 113, 26, NULL, 2),
(432, 113, 27, NULL, 3),
(433, 113, 28, NULL, 4);

-- asignacion_docente_id = 114
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(432, 114, 5, NULL, 1),
(433, 114, 6, NULL, 2);

-- asignacion_docente_id = 115
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(436, 115, 1, NULL, 1),
(437, 115, 2, NULL, 2),
(438, 115, 3, NULL, 3),
(439, 115, 4, NULL, 4);

-- asignacion_docente_id = 116
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(440, 116, 21, NULL, 1),
(441, 116, 22, NULL, 2),
(442, 116, 23, NULL, 3),
(443, 116, 24, NULL, 4);

-- asignacion_docente_id = 117
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(444, 117, 19, NULL, 1),
(445, 117, 20, NULL, 2),
(446, 117, 29, NULL, 3),
(447, 117, 30, NULL, 4);

-- asignacion_docente_id = 118
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(450, 118, 33, NULL, 1),
(451, 118, 34, NULL, 2),
(452, 118, 35, NULL, 3),
(453, 118, 48, NULL, 4),
(454, 118, 49, NULL, 5),
(455, 118, 50, NULL, 6);

-- asignacion_docente_id = 119
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(456, 119, 36, NULL, 1),
(457, 119, 37, NULL, 2),
(458, 119, 38, NULL, 3),
(459, 119, 51, NULL, 4),
(460, 119, 52, NULL, 5),
(461, 119, 53, NULL, 6);

-- asignacion_docente_id = 120
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(462, 120, 31, NULL, 1),
(463, 120, 32, NULL, 2),
(464, 120, 56, NULL, 3),
(465, 120, 57, NULL, 4);

-- asignacion_docente_id = 121
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(466, 121, 46, NULL, 1),
(467, 121, 47, NULL, 2);

-- asignacion_docente_id = 122
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(468, 122, 39, NULL, 1),
(469, 122, 40, NULL, 2),
(470, 122, 41, NULL, 3),
(471, 122, 42, NULL, 4);

-- asignacion_docente_id = 123
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(472, 123, 54, NULL, 1),
(473, 123, 58, NULL, 2),
(474, 123, 59, NULL, 3),
(475, 123, 60, NULL, 4);

-- asignacion_docente_id = 124
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(476, 124, 43, NULL, 1),
(477, 124, 44, NULL, 2),
(478, 124, 45, NULL, 3),
(479, 124, 55, NULL, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 60 bloques asignacion_horarios (Excel 2026-02-18)
