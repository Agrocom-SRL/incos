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
-- Bloques PK (asignacion_horarios.id): 301–420 (continúa desde seeder 45, id 300)

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Fuente: Excel horarios oficial 2026-02-18
-- Fuente: dump servidor 2026-05-29 — 138 bloques (oferta 75–110)
-- asignacion_docente_id = asignaciones_docentes.id (= oferta en gestión 2026)
-- aula_id NULL = hereda aula base de paralelos_gestion; valor explícito = override admin

-- asignacion_docente_id = 75
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(301, 75, 1, NULL, 1),
(302, 75, 2, NULL, 2),
(303, 75, 3, NULL, 3),
(304, 75, 4, NULL, 4),
(305, 75, 7, NULL, 5),
(306, 75, 8, NULL, 6),
(307, 75, 9, NULL, 7),
(308, 75, 10, NULL, 8);

-- asignacion_docente_id = 76
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(309, 76, 15, NULL, 1),
(310, 76, 16, NULL, 2),
(311, 76, 17, NULL, 3),
(312, 76, 18, NULL, 4);

-- asignacion_docente_id = 77
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(313, 77, 11, 1, 1),
(314, 77, 12, 1, 2),
(315, 77, 29, 1, 3),
(316, 77, 30, 1, 4);

-- asignacion_docente_id = 78
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(317, 78, 25, NULL, 1),
(318, 78, 26, NULL, 2),
(319, 78, 27, NULL, 3),
(320, 78, 28, NULL, 4);

-- asignacion_docente_id = 79
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(321, 79, 23, 1, 1),
(322, 79, 24, 1, 2);

-- asignacion_docente_id = 80
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(323, 80, 21, NULL, 1),
(324, 80, 22, NULL, 2);

-- asignacion_docente_id = 81
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(325, 81, 13, NULL, 1),
(326, 81, 14, NULL, 2);

-- asignacion_docente_id = 82
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(327, 82, 5, NULL, 1),
(328, 82, 6, NULL, 2);

-- asignacion_docente_id = 83
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(329, 83, 19, NULL, 1),
(330, 83, 20, NULL, 2);

-- asignacion_docente_id = 84
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(331, 84, 1, NULL, 1),
(332, 84, 2, NULL, 2),
(333, 84, 3, NULL, 3),
(334, 84, 4, NULL, 4),
(335, 84, 25, NULL, 5),
(336, 84, 26, NULL, 6),
(337, 84, 27, NULL, 7),
(338, 84, 28, NULL, 8);

-- asignacion_docente_id = 85
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(339, 85, 13, NULL, 1),
(340, 85, 14, NULL, 2),
(341, 85, 15, NULL, 3),
(342, 85, 16, NULL, 4);

-- asignacion_docente_id = 86
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(343, 86, 19, 1, 1),
(344, 86, 20, 1, 2),
(345, 86, 21, 1, 3),
(346, 86, 22, 1, 4);

-- asignacion_docente_id = 87
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(347, 87, 7, NULL, 1),
(348, 87, 8, NULL, 2),
(349, 87, 9, NULL, 3),
(350, 87, 10, NULL, 4);

-- asignacion_docente_id = 88
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(351, 88, 11, 1, 1),
(352, 88, 12, 1, 2);

-- asignacion_docente_id = 89
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(353, 89, 17, NULL, 1),
(354, 89, 18, NULL, 2);

-- asignacion_docente_id = 90
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(355, 90, 29, NULL, 1),
(356, 90, 30, NULL, 2);

-- asignacion_docente_id = 91
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(357, 91, 5, NULL, 1),
(358, 91, 6, NULL, 2);

-- asignacion_docente_id = 92
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(359, 92, 23, NULL, 1),
(360, 92, 24, NULL, 2);

-- asignacion_docente_id = 93
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(361, 93, 41, NULL, 1),
(362, 93, 42, NULL, 2),
(363, 93, 43, NULL, 3),
(364, 93, 44, NULL, 4),
(365, 93, 45, NULL, 5),
(366, 93, 56, NULL, 6),
(367, 93, 57, NULL, 7),
(368, 93, 58, NULL, 8);

-- asignacion_docente_id = 94
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(369, 94, 46, NULL, 1),
(370, 94, 53, NULL, 2),
(371, 94, 54, NULL, 3),
(372, 94, 55, NULL, 4);

-- asignacion_docente_id = 95
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(373, 95, 31, 1, 1),
(374, 95, 32, 1, 2),
(375, 95, 49, 1, 3),
(376, 95, 50, 1, 4);

-- asignacion_docente_id = 96
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(377, 96, 33, NULL, 1),
(378, 96, 34, NULL, 2),
(379, 96, 35, NULL, 3),
(380, 96, 38, NULL, 4);

-- asignacion_docente_id = 97
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(381, 97, 59, 1, 1),
(382, 97, 60, 1, 2);

-- asignacion_docente_id = 98
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(383, 98, 47, NULL, 1),
(384, 98, 48, NULL, 2);

-- asignacion_docente_id = 99
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(385, 99, 51, NULL, 1),
(386, 99, 52, NULL, 2);

-- asignacion_docente_id = 100
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(387, 100, 36, NULL, 1),
(388, 100, 37, NULL, 2);

-- asignacion_docente_id = 101
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(389, 101, 39, NULL, 1),
(390, 101, 40, NULL, 2);

-- asignacion_docente_id = 102
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(391, 102, 33, NULL, 1),
(392, 102, 34, NULL, 2),
(393, 102, 35, NULL, 3),
(394, 102, 41, NULL, 4),
(395, 102, 42, NULL, 5),
(396, 102, 43, NULL, 6),
(397, 102, 44, NULL, 7),
(398, 102, 45, NULL, 8);

-- asignacion_docente_id = 103
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(399, 103, 47, NULL, 1),
(400, 103, 48, NULL, 2),
(401, 103, 49, NULL, 3),
(402, 103, 50, NULL, 4);

-- asignacion_docente_id = 104
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(403, 104, 46, 1, 1),
(404, 104, 51, 1, 2),
(405, 104, 52, 1, 3),
(406, 104, 53, 1, 4);

-- asignacion_docente_id = 105
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(407, 105, 36, NULL, 1),
(408, 105, 58, NULL, 2),
(409, 105, 59, NULL, 3),
(410, 105, 60, NULL, 4);

-- asignacion_docente_id = 106
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(411, 106, 56, 1, 1),
(412, 106, 57, 1, 2);

-- asignacion_docente_id = 107
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(413, 107, 37, NULL, 1),
(414, 107, 38, NULL, 2);

-- asignacion_docente_id = 108
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(415, 108, 39, NULL, 1),
(416, 108, 40, NULL, 2);

-- asignacion_docente_id = 109
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(417, 109, 31, 1, 1),
(418, 109, 32, 1, 2);

-- asignacion_docente_id = 110
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(419, 110, 54, NULL, 1),
(420, 110, 55, NULL, 2);
SET FOREIGN_KEY_CHECKS = 1;

-- TOTAL: 120 bloques asignacion_horarios (Excel 2026-02-18)
