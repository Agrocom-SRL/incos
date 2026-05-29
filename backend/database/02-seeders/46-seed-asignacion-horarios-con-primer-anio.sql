-- ============================================
-- SEEDER: asignacion_horarios - CONTADURÍA GENERAL PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: PRIMERO A (TARDE), PRIMERO B (TARDE), PRIMERO C (NOCHE), PRIMERO D (NOCHE)
-- ============================================
-- Sprint 5 — Bloques horarios (cuelgan de asignacion_docente_id, no de oferta)
-- Pre-requisitos: 31–39 seed-asignaciones-docentes-* (mismos IDs numéricos)
-- Orden: Carrera 3 (CON-GEN) → Periodo 1 → Paralelos → Asignaciones → Bloques → Aulas
-- IDs oferta (asignacion_docente_id ref): 75-110 (1A: 75-83, 1B: 84-92, 1C: 93-101, 1D: 102-110)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Horarios SABADO: 56-60
-- Aulas: LAB-1=1, LAB-2=2
-- Continuación desde último ID del seeder de Administración tercer año: 299

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Fuente: dump servidor 2026-05-29 — 138 bloques (oferta 75–110)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 75
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(300, 75, 19, NULL, 1),
(301, 75, 20, NULL, 2),
(302, 75, 21, NULL, 3),
(303, 75, 22, NULL, 4),
(304, 75, 25, NULL, 5),
(305, 75, 26, NULL, 6),
(306, 75, 27, NULL, 7),
(307, 75, 28, NULL, 8);

-- asignacion_docente_id = 76
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(308, 76, 1, NULL, 1),
(309, 76, 2, NULL, 2),
(310, 76, 3, NULL, 3),
(311, 76, 4, NULL, 4);

-- asignacion_docente_id = 77
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(312, 77, 11, 1, 1),
(313, 77, 12, 1, 2),
(314, 77, 23, 1, 3),
(315, 77, 24, 1, 4);

-- asignacion_docente_id = 78
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(316, 78, 13, NULL, 1),
(317, 78, 14, NULL, 2),
(318, 78, 15, NULL, 3),
(319, 78, 16, NULL, 4);

-- asignacion_docente_id = 79
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(320, 79, 7, NULL, 1),
(321, 79, 8, NULL, 2);

-- asignacion_docente_id = 80
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(322, 80, 5, NULL, 1),
(323, 80, 6, NULL, 2);

-- asignacion_docente_id = 81
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(324, 81, 9, NULL, 1),
(325, 81, 10, NULL, 2);

-- asignacion_docente_id = 82
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(326, 82, 29, NULL, 1),
(327, 82, 30, NULL, 2);

-- asignacion_docente_id = 83
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(328, 83, 17, NULL, 1),
(329, 83, 18, NULL, 2);

-- asignacion_docente_id = 84
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(330, 84, 3, NULL, 1),
(331, 84, 4, NULL, 2),
(332, 84, 25, NULL, 3),
(333, 84, 26, NULL, 4),
(334, 84, 27, NULL, 5),
(335, 84, 28, NULL, 6),
(336, 84, 29, NULL, 7),
(337, 84, 30, NULL, 8);

-- asignacion_docente_id = 85
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(338, 85, 7, NULL, 1),
(339, 85, 8, NULL, 2),
(340, 85, 9, NULL, 3),
(341, 85, 10, NULL, 4);

-- asignacion_docente_id = 86
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(342, 86, 13, 1, 1),
(343, 86, 14, 1, 2),
(344, 86, 15, 1, 3),
(345, 86, 16, 1, 4);

-- asignacion_docente_id = 87
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(346, 87, 5, NULL, 1),
(347, 87, 6, NULL, 2),
(348, 87, 17, NULL, 3),
(349, 87, 18, NULL, 4);

-- asignacion_docente_id = 88
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(350, 88, 1, NULL, 1),
(351, 88, 2, NULL, 2);

-- asignacion_docente_id = 89
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(352, 89, 11, NULL, 1),
(353, 89, 12, NULL, 2);

-- asignacion_docente_id = 90
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(354, 90, 21, NULL, 1),
(355, 90, 22, NULL, 2);

-- asignacion_docente_id = 91
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(356, 91, 19, NULL, 1),
(357, 91, 20, NULL, 2);

-- asignacion_docente_id = 92
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(358, 92, 23, NULL, 1),
(359, 92, 24, NULL, 2);

-- asignacion_docente_id = 93
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(360, 93, 33, NULL, 1),
(361, 93, 34, NULL, 2),
(362, 93, 35, NULL, 3),
(363, 93, 41, NULL, 4),
(364, 93, 42, NULL, 5),
(365, 93, 43, NULL, 6),
(366, 93, 44, NULL, 7),
(367, 93, 45, NULL, 8);

-- asignacion_docente_id = 94
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(369, 94, 58, NULL, 1),
(546, 94, 56, NULL, 1),
(368, 94, 51, NULL, 2),
(370, 94, 59, NULL, 2),
(371, 94, 60, NULL, 3),
(547, 94, 52, NULL, 3),
(548, 94, 53, NULL, 4);

-- asignacion_docente_id = 95
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(372, 95, 47, NULL, 1),
(373, 95, 48, NULL, 2),
(374, 95, 59, 2, 3),
(541, 95, 52, NULL, 3),
(549, 95, 59, 1, 3),
(375, 95, 60, 2, 4),
(542, 95, 53, NULL, 4),
(550, 95, 60, 1, 4);

-- asignacion_docente_id = 96
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(543, 96, 46, NULL, 1),
(376, 96, 38, NULL, 2),
(377, 96, 39, NULL, 3),
(378, 96, 48, NULL, 3),
(379, 96, 49, NULL, 4),
(544, 96, 40, NULL, 4);

-- asignacion_docente_id = 97
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(380, 97, 36, NULL, 1),
(381, 97, 37, NULL, 2);

-- asignacion_docente_id = 98
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(382, 98, 31, NULL, 1),
(383, 98, 32, NULL, 2);

-- asignacion_docente_id = 99
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(384, 99, 54, NULL, 1),
(385, 99, 55, NULL, 2);

-- asignacion_docente_id = 100
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(386, 100, 57, NULL, 1),
(545, 100, 56, NULL, 1),
(387, 100, 58, NULL, 2),
(551, 100, 58, NULL, 2);

-- asignacion_docente_id = 101
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(388, 101, 49, NULL, 1),
(389, 101, 50, NULL, 2);

-- asignacion_docente_id = 102
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(390, 102, 33, NULL, 1),
(391, 102, 34, NULL, 2),
(392, 102, 35, NULL, 3),
(393, 102, 43, NULL, 4),
(394, 102, 44, NULL, 4),
(395, 102, 45, NULL, 5),
(396, 102, 53, NULL, 6),
(397, 102, 54, NULL, 7),
(552, 102, 55, NULL, 8);

-- asignacion_docente_id = 103
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(398, 103, 36, NULL, 1),
(399, 103, 58, NULL, 2),
(400, 103, 59, NULL, 3),
(401, 103, 60, NULL, 4);

-- asignacion_docente_id = 104
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(402, 104, 42, NULL, 1),
(403, 104, 43, NULL, 2),
(404, 104, 51, NULL, 3),
(405, 104, 52, NULL, 4);

-- asignacion_docente_id = 105
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(407, 105, 46, NULL, 1),
(409, 105, 48, NULL, 1),
(408, 105, 47, NULL, 2),
(559, 105, 49, NULL, 2),
(560, 105, 50, NULL, 3),
(406, 105, 41, NULL, 4);

-- asignacion_docente_id = 106
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(410, 106, 39, NULL, 1),
(411, 106, 40, NULL, 2);

-- asignacion_docente_id = 107
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(412, 107, 49, NULL, 1),
(561, 107, 46, NULL, 1),
(413, 107, 50, NULL, 2),
(562, 107, 47, NULL, 2);

-- asignacion_docente_id = 108
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(414, 108, 37, NULL, 1),
(415, 108, 38, NULL, 2);

-- asignacion_docente_id = 109
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(416, 109, 59, NULL, 1),
(563, 109, 56, NULL, 1),
(417, 109, 60, NULL, 2),
(564, 109, 57, NULL, 2);

-- asignacion_docente_id = 110
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(418, 110, 31, NULL, 1),
(419, 110, 32, NULL, 2);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 138 bloques asignacion_horarios (oferta 75–110)
