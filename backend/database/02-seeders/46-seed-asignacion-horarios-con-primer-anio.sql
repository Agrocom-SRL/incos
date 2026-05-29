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

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignacion_horarios;

-- ============================================
-- PRIMERO A - TARDE (asignacion_docente_id: 75-83)
-- ============================================

-- CONTABILIDAD I (asignacion_docente_id = 75) - 8 horas/semana
-- JUEVES (4 bloques) + VIERNES (4 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(300, 75, 19, NULL, 1),   -- JUEVES 13:45 (horario_id=19)
(301, 75, 20, NULL, 2),   -- JUEVES 14:30 (horario_id=20)
(302, 75, 21, NULL, 3),   -- JUEVES 15:15 (horario_id=21)
(303, 75, 22, NULL, 4),   -- JUEVES 16:00 (horario_id=22)
(304, 75, 25, NULL, 5),   -- VIERNES 13:45 (horario_id=25)
(305, 75, 26, NULL, 6),   -- VIERNES 14:30 (horario_id=26)
(306, 75, 27, NULL, 7),   -- VIERNES 15:15 (horario_id=27)
(307, 75, 28, NULL, 8);   -- VIERNES 16:00 (horario_id=28)

-- MATEMÁTICA FINANCIERA (asignacion_docente_id = 76) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(308, 76, 1, NULL, 1),    -- LUNES 13:45 (horario_id=1)
(309, 76, 2, NULL, 2),    -- LUNES 14:30 (horario_id=2)
(310, 76, 3, NULL, 3),    -- LUNES 15:15 (horario_id=3)
(311, 76, 4, NULL, 4);    -- LUNES 16:00 (horario_id=4)

-- INFORMÁTICA CONTABLE (asignacion_docente_id = 77) - 4 horas/semana LAB 1
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(312, 77, 11, 1, 1),      -- MARTES 16:45 (horario_id=11)
(313, 77, 12, 1, 2),      -- MARTES 17:30 (horario_id=12)
(314, 77, 23, 1, 3),      -- JUEVES 16:45 (horario_id=23)
(315, 77, 24, 1, 4);      -- JUEVES 17:30 (horario_id=24)

-- ADMINISTRACIÓN GENERAL (asignacion_docente_id = 78) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(316, 78, 13, NULL, 1),   -- MIERCOLES 13:45 (horario_id=13)
(317, 78, 14, NULL, 2),   -- MIERCOLES 14:30 (horario_id=14)
(318, 78, 15, NULL, 3),   -- MIERCOLES 15:15 (horario_id=15)
(319, 78, 16, NULL, 4);   -- MIERCOLES 16:00 (horario_id=16)

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (asignacion_docente_id = 79) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(320, 79, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(321, 79, 8, NULL, 2);    -- MARTES 14:30 (horario_id=8)

-- ECONOMÍA GENERAL APLICADA (asignacion_docente_id = 80) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(322, 80, 5, NULL, 1),    -- LUNES 16:45 (horario_id=5)
(323, 80, 6, NULL, 2);    -- LUNES 17:30 (horario_id=6)

-- DOCUMENTOS COMERCIALES Y MERCANTILES (asignacion_docente_id = 81) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(324, 81, 9, NULL, 1),    -- MARTES 15:15 (horario_id=9)
(325, 81, 10, NULL, 2);   -- MARTES 16:00 (horario_id=10)

-- ESTADÍSTICA APLICADA (asignacion_docente_id = 82) - 2 horas/semana
-- VIERNES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(326, 82, 29, NULL, 1),   -- VIERNES 16:45 (horario_id=29)
(327, 82, 30, NULL, 2);   -- VIERNES 17:30 (horario_id=30)

-- INGLÉS TÉCNICO (asignacion_docente_id = 83) - 2 horas/semana
-- MIÉRCOLES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(328, 83, 17, NULL, 1),   -- MIERCOLES 16:45 (horario_id=17)
(329, 83, 18, NULL, 2);   -- MIERCOLES 17:30 (horario_id=18)

-- ============================================
-- PRIMERO B - TARDE (asignacion_docente_id: 84-92)
-- ============================================

-- CONTABILIDAD I (asignacion_docente_id = 84) - 8 horas/semana
-- LUNES (2 bloques) + VIERNES (6 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(330, 84, 3, NULL, 1),    -- LUNES 15:15 (horario_id=3)
(331, 84, 4, NULL, 2),    -- LUNES 16:00 (horario_id=4)
(332, 84, 25, NULL, 3),   -- VIERNES 13:45 (horario_id=25)
(333, 84, 26, NULL, 4),   -- VIERNES 14:30 (horario_id=26)
(334, 84, 27, NULL, 5),   -- VIERNES 15:15 (horario_id=27)
(335, 84, 28, NULL, 6),   -- VIERNES 16:00 (horario_id=28)
(336, 84, 29, NULL, 7),   -- VIERNES 16:45 (horario_id=29)
(337, 84, 30, NULL, 8);   -- VIERNES 17:30 (horario_id=30)

-- MATEMÁTICA FINANCIERA (asignacion_docente_id = 85) - 4 horas/semana
-- MARTES (4 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(338, 85, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(339, 85, 8, NULL, 2),    -- MARTES 14:30 (horario_id=8)
(340, 85, 9, NULL, 3),    -- MARTES 15:15 (horario_id=9)
(341, 85, 10, NULL, 4);   -- MARTES 16:00 (horario_id=10)

-- INFORMÁTICA CONTABLE (asignacion_docente_id = 86) - 4 horas/semana LAB 1
-- MIÉRCOLES (4 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(342, 86, 13, 1, 1),      -- MIERCOLES 13:45 (horario_id=13) - LAB 1
(343, 86, 14, 1, 2),      -- MIERCOLES 14:30 (horario_id=14) - LAB 1
(344, 86, 15, 1, 3),      -- MIERCOLES 15:15 (horario_id=15) - LAB 1
(345, 86, 16, 1, 4);      -- MIERCOLES 16:00 (horario_id=16) - LAB 1

-- ADMINISTRACIÓN GENERAL (asignacion_docente_id = 87) - 4 horas/semana
-- LUNES (2 bloques) + MIÉRCOLES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(346, 87, 5, NULL, 1),    -- LUNES 16:45 (horario_id=5)
(347, 87, 6, NULL, 2),    -- LUNES 17:30 (horario_id=6)
(348, 87, 17, NULL, 3),   -- MIERCOLES 16:45 (horario_id=17)
(349, 87, 18, NULL, 4);   -- MIERCOLES 17:30 (horario_id=18)

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (asignacion_docente_id = 88) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(350, 88, 1, NULL, 1),    -- LUNES 13:45 (horario_id=1)
(351, 88, 2, NULL, 2);    -- LUNES 14:30 (horario_id=2)

-- ECONOMÍA GENERAL APLICADA (asignacion_docente_id = 89) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(352, 89, 11, NULL, 1),   -- MARTES 16:45 (horario_id=11)
(353, 89, 12, NULL, 2);   -- MARTES 17:30 (horario_id=12)

-- DOCUMENTOS COMERCIALES Y MERCANTILES (asignacion_docente_id = 90) - 2 horas/semana
-- JUEVES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(354, 90, 21, NULL, 1),   -- JUEVES 15:15 (horario_id=21)
(355, 90, 22, NULL, 2);   -- JUEVES 16:00 (horario_id=22)

-- ESTADÍSTICA APLICADA (asignacion_docente_id = 91) - 2 horas/semana
-- JUEVES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(356, 91, 19, NULL, 1),   -- JUEVES 13:45 (horario_id=19)
(357, 91, 20, NULL, 2);   -- JUEVES 14:30 (horario_id=20)

-- INGLÉS TÉCNICO (asignacion_docente_id = 92) - 2 horas/semana
-- JUEVES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(358, 92, 23, NULL, 1),   -- JUEVES 16:45 (horario_id=23)
(359, 92, 24, NULL, 2);   -- JUEVES 17:30 (horario_id=24)

-- ============================================
-- PRIMERO C - NOCHE (asignacion_docente_id: 93-101)
-- ============================================

-- CONTABILIDAD I (asignacion_docente_id = 93) - 8 horas/semana
-- LUNES (3 bloques) + MIÉRCOLES (5 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(360, 93, 33, NULL, 1),   -- LUNES 19:45 (horario_id=33)
(361, 93, 34, NULL, 2),   -- LUNES 20:30 (horario_id=34)
(362, 93, 35, NULL, 3),   -- LUNES 21:15 (horario_id=35)
(363, 93, 41, NULL, 4),   -- MIERCOLES 18:15 (horario_id=41)
(364, 93, 42, NULL, 5),   -- MIERCOLES 19:00 (horario_id=42)
(365, 93, 43, NULL, 6),   -- MIERCOLES 19:45 (horario_id=43)
(366, 93, 44, NULL, 7),   -- MIERCOLES 20:30 (horario_id=44)
(367, 93, 45, NULL, 8);   -- MIERCOLES 21:15 (horario_id=45)

-- MATEMÁTICA FINANCIERA (asignacion_docente_id = 94) - 4 horas/semana
-- VIERNES (1 bloque) + SÁBADO (3 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(368, 94, 51, NULL, 1),   -- VIERNES 18:15 (horario_id=51)
(369, 94, 58, NULL, 2),   -- SABADO 16:30 (horario_id=58)
(370, 94, 59, NULL, 3),   -- SABADO 17:30 (horario_id=59)
(371, 94, 60, NULL, 4);   -- SABADO 18:15 (horario_id=60)

-- INFORMÁTICA CONTABLE (asignacion_docente_id = 95) - 4 horas/semana LAB 1
-- JUEVES (2 bloques) + SÁBADO (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(372, 95, 47, 1, 1),      -- JUEVES 19:00 (horario_id=47) - LAB 1
(373, 95, 48, 1, 2),      -- JUEVES 19:45 (horario_id=48) - LAB 1
(374, 95, 59, 1, 3),      -- SABADO 17:30 (horario_id=59) - LAB 1
(375, 95, 60, 1, 4);      -- SABADO 18:15 (horario_id=60) - LAB 1

-- ADMINISTRACIÓN GENERAL (asignacion_docente_id = 96) - 4 horas/semana
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(376, 96, 38, NULL, 1),   -- MARTES 19:45 (horario_id=38)
(377, 96, 39, NULL, 2),   -- MARTES 20:30 (horario_id=39)
(378, 96, 48, NULL, 3),   -- JUEVES 19:45 (horario_id=48)
(379, 96, 49, NULL, 4);   -- JUEVES 20:30 (horario_id=49)

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (asignacion_docente_id = 97) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(380, 97, 36, NULL, 1),   -- MARTES 18:15 (horario_id=36)
(381, 97, 37, NULL, 2);   -- MARTES 19:00 (horario_id=37)

-- ECONOMÍA GENERAL APLICADA (asignacion_docente_id = 98) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(382, 98, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(383, 98, 32, NULL, 2);   -- LUNES 19:00 (horario_id=32)

-- DOCUMENTOS COMERCIALES Y MERCANTILES (asignacion_docente_id = 99) - 2 horas/semana
-- VIERNES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(384, 99, 54, NULL, 1),   -- VIERNES 20:30 (horario_id=54)
(385, 99, 55, NULL, 2);   -- VIERNES 21:15 (horario_id=55)

-- ESTADÍSTICA APLICADA (asignacion_docente_id = 100) - 2 horas/semana
-- SÁBADO (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(386, 100, 57, NULL, 1),  -- SABADO 15:45 (horario_id=57)
(387, 100, 58, NULL, 2);  -- SABADO 16:30 (horario_id=58)

-- INGLÉS TÉCNICO (asignacion_docente_id = 101) - 2 horas/semana
-- JUEVES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(388, 101, 49, NULL, 1),  -- JUEVES 20:30 (horario_id=49)
(389, 101, 50, NULL, 2);  -- JUEVES 21:15 (horario_id=50)

-- ============================================
-- PRIMERO D - NOCHE (asignacion_docente_id: 102-110)
-- ============================================

-- CONTABILIDAD I (asignacion_docente_id = 102) - 8 horas/semana
-- LUNES (3 bloques) + MIÉRCOLES (3 bloques) + VIERNES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(390, 102, 33, NULL, 1),  -- LUNES 19:45 (horario_id=33)
(391, 102, 34, NULL, 2),  -- LUNES 20:30 (horario_id=34)
(392, 102, 35, NULL, 3),  -- LUNES 21:15 (horario_id=35)
(393, 102, 43, NULL, 4),  -- MIERCOLES 19:45 (horario_id=43)
(394, 102, 44, NULL, 5),  -- MIERCOLES 20:30 (horario_id=44)
(395, 102, 45, NULL, 6),  -- MIERCOLES 21:15 (horario_id=45)
(396, 102, 53, NULL, 7),  -- VIERNES 19:45 (horario_id=53)
(397, 102, 54, NULL, 8);  -- VIERNES 20:30 (horario_id=54)

-- MATEMÁTICA FINANCIERA (asignacion_docente_id = 103) - 4 horas/semana
-- MARTES (1 bloque) + SÁBADO (3 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(398, 103, 36, NULL, 1),  -- MARTES 18:15 (horario_id=36)
(399, 103, 58, NULL, 2),  -- SABADO 16:30 (horario_id=58)
(400, 103, 59, NULL, 3),  -- SABADO 17:30 (horario_id=59)
(401, 103, 60, NULL, 4);  -- SABADO 18:15 (horario_id=60)

-- INFORMÁTICA CONTABLE (asignacion_docente_id = 104) - 4 horas/semana LAB 1
-- MIÉRCOLES (2 bloques teóricos) + VIERNES (2 bloques LAB 1)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(402, 104, 42, NULL, 1),  -- MIERCOLES 19:00 (horario_id=42) - Teórico
(403, 104, 43, NULL, 2),  -- MIERCOLES 19:45 (horario_id=43) - Teórico
(404, 104, 51, 1, 3),     -- VIERNES 18:15 (horario_id=51) - LAB 1
(405, 104, 52, 1, 4);     -- VIERNES 19:00 (horario_id=52) - LAB 1

-- ADMINISTRACIÓN GENERAL (asignacion_docente_id = 105) - 4 horas/semana
-- MIÉRCOLES (1 bloque) + JUEVES (3 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(406, 105, 41, NULL, 1),  -- MIERCOLES 18:15 (horario_id=41)
(407, 105, 46, NULL, 2),  -- JUEVES 18:15 (horario_id=46)
(408, 105, 47, NULL, 3),  -- JUEVES 19:00 (horario_id=47)
(409, 105, 48, NULL, 4);  -- JUEVES 19:45 (horario_id=48)

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (asignacion_docente_id = 106) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(410, 106, 39, NULL, 1),  -- MARTES 20:30 (horario_id=39)
(411, 106, 40, NULL, 2);  -- MARTES 21:15 (horario_id=40)

-- ECONOMÍA GENERAL APLICADA (asignacion_docente_id = 107) - 2 horas/semana
-- JUEVES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(412, 107, 49, NULL, 1),  -- JUEVES 20:30 (horario_id=49)
(413, 107, 50, NULL, 2);  -- JUEVES 21:15 (horario_id=50)

-- DOCUMENTOS COMERCIALES Y MERCANTILES (asignacion_docente_id = 108) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(414, 108, 37, NULL, 1),  -- MARTES 19:00 (horario_id=37)
(415, 108, 38, NULL, 2);  -- MARTES 19:45 (horario_id=38)

-- ESTADÍSTICA APLICADA (asignacion_docente_id = 109) - 2 horas/semana
-- SÁBADO (2 bloques) LAB 1
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(416, 109, 59, 1, 1),     -- SABADO 17:30 (horario_id=59) - LAB 1
(417, 109, 60, 1, 2);     -- SABADO 18:15 (horario_id=60) - LAB 1

-- INGLÉS TÉCNICO (asignacion_docente_id = 110) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO asignacion_horarios (id, asignacion_docente_id, horario_id, aula_id, orden_secuencia) VALUES
(418, 110, 31, NULL, 1),  -- LUNES 18:15 (horario_id=31)
(419, 110, 32, NULL, 2);  -- LUNES 19:00 (horario_id=32)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (PRIMERO A - TARDE): 9 cursos = 30 registros (IDs 300-329)
--   CONTABILIDAD I: 8 registros (300-307)
--   MATEMÁTICA FINANCIERA: 4 registros (308-311)
--   INFORMÁTICA CONTABLE: 4 registros (312-315) - LAB 1
--   ADMINISTRACIÓN GENERAL: 4 registros (316-319)
--   LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA: 2 registros (320-321)
--   ECONOMÍA GENERAL APLICADA: 2 registros (322-323)
--   DOCUMENTOS COMERCIALES Y MERCANTILES: 2 registros (324-325)
--   ESTADÍSTICA APLICADA: 2 registros (326-327)
--   INGLÉS TÉCNICO: 2 registros (328-329)
--
-- PARALELO B (PRIMERO B - TARDE): 9 cursos = 30 registros (IDs 330-359)
--   CONTABILIDAD I: 8 registros (330-337)
--   MATEMÁTICA FINANCIERA: 4 registros (338-341)
--   INFORMÁTICA CONTABLE: 4 registros (342-345) - LAB 1
--   ADMINISTRACIÓN GENERAL: 4 registros (346-349)
--   LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA: 2 registros (350-351)
--   ECONOMÍA GENERAL APLICADA: 2 registros (352-353)
--   DOCUMENTOS COMERCIALES Y MERCANTILES: 2 registros (354-355)
--   ESTADÍSTICA APLICADA: 2 registros (356-357)
--   INGLÉS TÉCNICO: 2 registros (358-359)
--
-- PARALELO C (PRIMERO C - NOCHE): 9 cursos = 30 registros (IDs 360-389)
--   CONTABILIDAD I: 8 registros (360-367)
--   MATEMÁTICA FINANCIERA: 4 registros (368-371)
--   INFORMÁTICA CONTABLE: 4 registros (372-375) - LAB 1
--   ADMINISTRACIÓN GENERAL: 4 registros (376-379)
--   LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA: 2 registros (380-381)
--   ECONOMÍA GENERAL APLICADA: 2 registros (382-383)
--   DOCUMENTOS COMERCIALES Y MERCANTILES: 2 registros (384-385)
--   ESTADÍSTICA APLICADA: 2 registros (386-387)
--   INGLÉS TÉCNICO: 2 registros (388-389)
--
-- PARALELO D (PRIMERO D - NOCHE): 9 cursos = 30 registros (IDs 390-419)
--   CONTABILIDAD I: 8 registros (390-397)
--   MATEMÁTICA FINANCIERA: 4 registros (398-401)
--   INFORMÁTICA CONTABLE: 4 registros (402-405) - LAB 1 (parcial)
--   ADMINISTRACIÓN GENERAL: 4 registros (406-409)
--   LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA: 2 registros (410-411)
--   ECONOMÍA GENERAL APLICADA: 2 registros (412-413)
--   DOCUMENTOS COMERCIALES Y MERCANTILES: 2 registros (414-415)
--   ESTADÍSTICA APLICADA: 2 registros (416-417) - LAB 1
--   INGLÉS TÉCNICO: 2 registros (418-419)
--
-- TOTAL: 120 registros (IDs 300-419)
-- NOTA: Continuación desde el último ID del seeder de Administración tercer año (299)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
