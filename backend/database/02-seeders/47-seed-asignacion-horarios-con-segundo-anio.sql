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
-- Bloques PK (asignacion_horarios.id): 421–480 (continúa desde seeder 46, id 420)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Fuente: Excel horarios oficial 2026-02-18
-- Fuente: dump servidor 2026-05-29 — 76 bloques (oferta 111–124)
-- asignacion_docente_id referencia oferta_cursos de la gestión 2026
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 111
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(421, 111, 10, 1),
(422, 111, 11, 2),
(423, 111, 12, 3),
(424, 111, 16, 4),
(425, 111, 17, 5),
(426, 111, 18, 6);

-- asignacion_docente_id = 112  (ids 426-431, continúa tras 111)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(427, 112, 7, 1),
(428, 112, 8, 2),
(429, 112, 9, 3),
(430, 112, 13, 4),
(431, 112, 14, 5),
(432, 112, 15, 6);

-- asignacion_docente_id = 113  (ids 432-435)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(433, 113, 25, 1),
(434, 113, 26, 2),
(435, 113, 27, 3),
(436, 113, 28, 4);

-- asignacion_docente_id = 114  (ids 436-437)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(437, 114, 5, 1),
(438, 114, 6, 2);

-- asignacion_docente_id = 115  (ids 438-441)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(439, 115, 1, 1),
(440, 115, 2, 2),
(441, 115, 3, 3),
(442, 115, 4, 4);

-- asignacion_docente_id = 116  (ids 442-445)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(443, 116, 21, 1),
(444, 116, 22, 2),
(445, 116, 23, 3),
(446, 116, 24, 4);

-- asignacion_docente_id = 117  (ids 446-449)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(447, 117, 19, 1),
(448, 117, 20, 2),
(449, 117, 29, 3),
(450, 117, 30, 4);

-- asignacion_docente_id = 118
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(451, 118, 33, 1),
(452, 118, 34, 2),
(453, 118, 35, 3),
(454, 118, 48, 4),
(455, 118, 49, 5),
(456, 118, 50, 6);

-- asignacion_docente_id = 119
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(457, 119, 36, 1),
(458, 119, 37, 2),
(459, 119, 38, 3),
(460, 119, 51, 4),
(461, 119, 52, 5),
(462, 119, 53, 6);

-- asignacion_docente_id = 120
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(463, 120, 31, 1),
(464, 120, 32, 2),
(465, 120, 56, 3),
(466, 120, 57, 4);

-- asignacion_docente_id = 121
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(467, 121, 46, 1),
(468, 121, 47, 2);

-- asignacion_docente_id = 122
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(469, 122, 39, 1),
(470, 122, 40, 2),
(471, 122, 41, 3),
(472, 122, 42, 4);

-- asignacion_docente_id = 123
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(473, 123, 54, 1),
(474, 123, 58, 2),
(475, 123, 59, 3),
(476, 123, 60, 4);

-- asignacion_docente_id = 124
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, orden_secuencia) VALUES
(477, 124, 43, 1),
(478, 124, 44, 2),
(479, 124, 45, 3),
(480, 124, 55, 4);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 60 bloques (ids 421-480)
