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

-- Fuente: Excel horarios oficial 2026-02-18
-- Fuente: dump servidor 2026-05-29 — 138 bloques (oferta 75–110)
-- V2: asignacion_docente_id (= oferta_curso_id en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 75
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(300, 75, 1, NULL, 1),
(301, 75, 2, NULL, 2),
(302, 75, 3, NULL, 3),
(303, 75, 4, NULL, 4),
(304, 75, 7, NULL, 5),
(305, 75, 8, NULL, 6),
(306, 75, 9, NULL, 7),
(307, 75, 10, NULL, 8);

-- asignacion_docente_id = 76
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(308, 76, 15, NULL, 1),
(309, 76, 16, NULL, 2),
(310, 76, 17, NULL, 3),
(311, 76, 18, NULL, 4);

-- asignacion_docente_id = 77
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(312, 77, 11, 1, 1),
(313, 77, 12, 1, 2),
(314, 77, 29, 1, 3),
(315, 77, 30, 1, 4);

-- asignacion_docente_id = 78
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(316, 78, 25, NULL, 1),
(317, 78, 26, NULL, 2),
(318, 78, 27, NULL, 3),
(319, 78, 28, NULL, 4);

-- asignacion_docente_id = 79
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(320, 79, 23, 1, 1),
(321, 79, 24, 1, 2);

-- asignacion_docente_id = 80
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(322, 80, 21, NULL, 1),
(323, 80, 22, NULL, 2);

-- asignacion_docente_id = 81
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(324, 81, 13, NULL, 1),
(325, 81, 14, NULL, 2);

-- asignacion_docente_id = 82
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(326, 82, 5, NULL, 1),
(327, 82, 6, NULL, 2);

-- asignacion_docente_id = 83
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(328, 83, 19, NULL, 1),
(329, 83, 20, NULL, 2);

-- asignacion_docente_id = 84
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(330, 84, 1, NULL, 1),
(331, 84, 2, NULL, 2),
(332, 84, 3, NULL, 3),
(333, 84, 4, NULL, 4),
(334, 84, 25, NULL, 5),
(335, 84, 26, NULL, 6),
(336, 84, 27, NULL, 7),
(337, 84, 28, NULL, 8);

-- asignacion_docente_id = 85
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(338, 85, 13, NULL, 1),
(339, 85, 14, NULL, 2),
(340, 85, 15, NULL, 3),
(341, 85, 16, NULL, 4);

-- asignacion_docente_id = 86
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(342, 86, 19, 1, 1),
(343, 86, 20, 1, 2),
(344, 86, 21, 1, 3),
(345, 86, 22, 1, 4);

-- asignacion_docente_id = 87
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(346, 87, 7, NULL, 1),
(347, 87, 8, NULL, 2),
(348, 87, 9, NULL, 3),
(349, 87, 10, NULL, 4);

-- asignacion_docente_id = 88
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(350, 88, 11, 1, 1),
(351, 88, 12, 1, 2);

-- asignacion_docente_id = 89
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(352, 89, 17, NULL, 1),
(353, 89, 18, NULL, 2);

-- asignacion_docente_id = 90
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(354, 90, 29, NULL, 1),
(355, 90, 30, NULL, 2);

-- asignacion_docente_id = 91
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(356, 91, 5, NULL, 1),
(357, 91, 6, NULL, 2);

-- asignacion_docente_id = 92
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(358, 92, 23, NULL, 1),
(359, 92, 24, NULL, 2);

-- asignacion_docente_id = 93
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(360, 93, 41, NULL, 1),
(361, 93, 42, NULL, 2),
(362, 93, 43, NULL, 3),
(363, 93, 44, NULL, 4),
(364, 93, 45, NULL, 5),
(365, 93, 56, NULL, 6),
(366, 93, 57, NULL, 7),
(367, 93, 58, NULL, 8);

-- asignacion_docente_id = 94
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(368, 94, 46, NULL, 1),
(369, 94, 53, NULL, 2),
(370, 94, 54, NULL, 3),
(371, 94, 55, NULL, 4);

-- asignacion_docente_id = 95
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(372, 95, 31, 1, 1),
(373, 95, 32, 1, 2),
(374, 95, 49, 1, 3),
(375, 95, 50, 1, 4);

-- asignacion_docente_id = 96
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(376, 96, 33, NULL, 1),
(377, 96, 34, NULL, 2),
(378, 96, 35, NULL, 3),
(379, 96, 38, NULL, 4);

-- asignacion_docente_id = 97
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(380, 97, 59, 1, 1),
(381, 97, 60, 1, 2);

-- asignacion_docente_id = 98
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(382, 98, 47, NULL, 1),
(383, 98, 48, NULL, 2);

-- asignacion_docente_id = 99
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(384, 99, 51, NULL, 1),
(385, 99, 52, NULL, 2);

-- asignacion_docente_id = 100
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(386, 100, 36, NULL, 1),
(387, 100, 37, NULL, 2);

-- asignacion_docente_id = 101
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(388, 101, 39, NULL, 1),
(389, 101, 40, NULL, 2);

-- asignacion_docente_id = 102
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(390, 102, 33, NULL, 1),
(391, 102, 34, NULL, 2),
(392, 102, 35, NULL, 3),
(393, 102, 41, NULL, 4),
(394, 102, 42, NULL, 5),
(395, 102, 43, NULL, 6),
(396, 102, 44, NULL, 7),
(397, 102, 45, NULL, 8);

-- asignacion_docente_id = 103
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(398, 103, 47, NULL, 1),
(399, 103, 48, NULL, 2),
(400, 103, 49, NULL, 3),
(401, 103, 50, NULL, 4);

-- asignacion_docente_id = 104
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(402, 104, 46, 1, 1),
(403, 104, 51, 1, 2),
(404, 104, 52, 1, 3),
(405, 104, 53, 1, 4);

-- asignacion_docente_id = 105
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(406, 105, 36, NULL, 1),
(407, 105, 58, NULL, 2),
(408, 105, 59, NULL, 3),
(409, 105, 60, NULL, 4);

-- asignacion_docente_id = 106
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(410, 106, 56, 1, 1),
(411, 106, 57, 1, 2);

-- asignacion_docente_id = 107
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(412, 107, 37, NULL, 1),
(413, 107, 38, NULL, 2);

-- asignacion_docente_id = 108
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(414, 108, 39, NULL, 1),
(415, 108, 40, NULL, 2);

-- asignacion_docente_id = 109
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(416, 109, 31, 1, 1),
(417, 109, 32, 1, 2);

-- asignacion_docente_id = 110
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(418, 110, 54, NULL, 1),
(419, 110, 55, NULL, 2);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 120 bloques asignacion_horarios (Excel 2026-02-18)
