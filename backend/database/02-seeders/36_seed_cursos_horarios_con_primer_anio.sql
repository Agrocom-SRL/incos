-- ============================================
-- SEEDER: cursos_horarios - CONTADURÍA GENERAL PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: PRIMERO A (TARDE), PRIMERO B (TARDE), PRIMERO C (NOCHE), PRIMERO D (NOCHE)
-- ============================================
-- Orden: Carrera 3 (CON-GEN) → Periodo 1 → Paralelos → Cursos → Horarios → Aulas
-- IDs fijos de cursos: 68-103 (1A: 68-76, 1B: 77-85, 1C: 86-94, 1D: 95-103)
-- Horarios TARDE: 1-30 (LUNES: 1-6, MARTES: 7-12, MIERCOLES: 13-18, JUEVES: 19-24, VIERNES: 25-30)
-- Horarios NOCHE: 31-55 (LUNES: 31-35, MARTES: 36-40, MIERCOLES: 41-45, JUEVES: 46-50, VIERNES: 51-55)
-- Aulas: LAB-1=1, LAB-2=2

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE cursos_horarios;

-- ============================================
-- PRIMERO A - TARDE (curso_id: 68-76)
-- ============================================

-- CONTABILIDAD I (curso_id = 68) - 8 horas/semana
-- JUEVES (4 bloques) + VIERNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(276, 68, 19, NULL, 1),   -- JUEVES 13:45 (horario_id=19)
(277, 68, 20, NULL, 2),   -- JUEVES 14:30 (horario_id=20)
(278, 68, 21, NULL, 3),   -- JUEVES 15:15 (horario_id=21)
(279, 68, 22, NULL, 4),   -- JUEVES 16:00 (horario_id=22)
(280, 68, 25, NULL, 5),   -- VIERNES 13:45 (horario_id=25)
(281, 68, 26, NULL, 6),   -- VIERNES 14:30 (horario_id=26)
(282, 68, 27, NULL, 7),   -- VIERNES 15:15 (horario_id=27)
(283, 68, 28, NULL, 8);   -- VIERNES 16:00 (horario_id=28)

-- MATEMÁTICA FINANCIERA (curso_id = 69) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(284, 69, 1, NULL, 1),    -- LUNES 13:45 (horario_id=1)
(285, 69, 2, NULL, 2),    -- LUNES 14:30 (horario_id=2)
(286, 69, 3, NULL, 3),    -- LUNES 15:15 (horario_id=3)
(287, 69, 4, NULL, 4);    -- LUNES 16:00 (horario_id=4)

-- INFORMÁTICA CONTABLE (curso_id = 70) - 4 horas/semana LAB 1
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(288, 70, 11, 1, 1),      -- MARTES 16:45 (horario_id=11)
(289, 70, 12, 1, 2),      -- MARTES 17:30 (horario_id=12)
(290, 70, 23, 1, 3),      -- JUEVES 16:45 (horario_id=23)
(291, 70, 24, 1, 4);      -- JUEVES 17:30 (horario_id=24)

-- ADMINISTRACIÓN GENERAL (curso_id = 71) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(292, 71, 13, NULL, 1),   -- MIERCOLES 13:45 (horario_id=13)
(293, 71, 14, NULL, 2),   -- MIERCOLES 14:30 (horario_id=14)
(294, 71, 15, NULL, 3),   -- MIERCOLES 15:15 (horario_id=15)
(295, 71, 16, NULL, 4);   -- MIERCOLES 16:00 (horario_id=16)

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (curso_id = 72) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(296, 72, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(297, 72, 8, NULL, 2);    -- MARTES 14:30 (horario_id=8)

-- ECONOMÍA GENERAL APLICADA (curso_id = 73) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(298, 73, 5, NULL, 1),    -- LUNES 16:45 (horario_id=5)
(299, 73, 6, NULL, 2);    -- LUNES 17:30 (horario_id=6)

-- DOCUMENTOS COMERCIALES Y MERCANTILES (curso_id = 74) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(300, 74, 9, NULL, 1),    -- MARTES 15:15 (horario_id=9)
(301, 74, 10, NULL, 2);   -- MARTES 16:00 (horario_id=10)

-- ESTADÍSTICA APLICADA (curso_id = 75) - 2 horas/semana
-- VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(302, 75, 29, NULL, 1),   -- VIERNES 16:45 (horario_id=29)
(303, 75, 30, NULL, 2);   -- VIERNES 17:30 (horario_id=30)

-- INGLÉS TÉCNICO (curso_id = 76) - 2 horas/semana
-- MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(304, 76, 17, NULL, 1),   -- MIERCOLES 16:45 (horario_id=17)
(305, 76, 18, NULL, 2);   -- MIERCOLES 17:30 (horario_id=18)

-- ============================================
-- PRIMERO B - TARDE (curso_id: 77-85)
-- ============================================

-- CONTABILIDAD I (curso_id = 77) - 8 horas/semana
-- JUEVES (4 bloques) + VIERNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(306, 77, 19, NULL, 1),   -- JUEVES 13:45 (horario_id=19)
(307, 77, 20, NULL, 2),   -- JUEVES 14:30 (horario_id=20)
(308, 77, 21, NULL, 3),   -- JUEVES 15:15 (horario_id=21)
(309, 77, 22, NULL, 4),   -- JUEVES 16:00 (horario_id=22)
(310, 77, 25, NULL, 5),   -- VIERNES 13:45 (horario_id=25)
(311, 77, 26, NULL, 6),   -- VIERNES 14:30 (horario_id=26)
(312, 77, 27, NULL, 7),   -- VIERNES 15:15 (horario_id=27)
(313, 77, 28, NULL, 8);   -- VIERNES 16:00 (horario_id=28)

-- MATEMÁTICA FINANCIERA (curso_id = 78) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(314, 78, 1, NULL, 1),    -- LUNES 13:45 (horario_id=1)
(315, 78, 2, NULL, 2),    -- LUNES 14:30 (horario_id=2)
(316, 78, 3, NULL, 3),    -- LUNES 15:15 (horario_id=3)
(317, 78, 4, NULL, 4);    -- LUNES 16:00 (horario_id=4)

-- INFORMÁTICA CONTABLE (curso_id = 79) - 4 horas/semana LAB 2
-- MARTES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(318, 79, 11, 2, 1),      -- MARTES 16:45 (horario_id=11)
(319, 79, 12, 2, 2),      -- MARTES 17:30 (horario_id=12)
(320, 79, 23, 2, 3),      -- JUEVES 16:45 (horario_id=23)
(321, 79, 24, 2, 4);      -- JUEVES 17:30 (horario_id=24)

-- ADMINISTRACIÓN GENERAL (curso_id = 80) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(322, 80, 13, NULL, 1),   -- MIERCOLES 13:45 (horario_id=13)
(323, 80, 14, NULL, 2),   -- MIERCOLES 14:30 (horario_id=14)
(324, 80, 15, NULL, 3),   -- MIERCOLES 15:15 (horario_id=15)
(325, 80, 16, NULL, 4);   -- MIERCOLES 16:00 (horario_id=16)

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (curso_id = 81) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(326, 81, 7, NULL, 1),    -- MARTES 13:45 (horario_id=7)
(327, 81, 8, NULL, 2);    -- MARTES 14:30 (horario_id=8)

-- ECONOMÍA GENERAL APLICADA (curso_id = 82) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(328, 82, 5, NULL, 1),    -- LUNES 16:45 (horario_id=5)
(329, 82, 6, NULL, 2);    -- LUNES 17:30 (horario_id=6)

-- DOCUMENTOS COMERCIALES Y MERCANTILES (curso_id = 83) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(330, 83, 9, NULL, 1),    -- MARTES 15:15 (horario_id=9)
(331, 83, 10, NULL, 2);   -- MARTES 16:00 (horario_id=10)

-- ESTADÍSTICA APLICADA (curso_id = 84) - 2 horas/semana
-- VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(332, 84, 29, NULL, 1),   -- VIERNES 16:45 (horario_id=29)
(333, 84, 30, NULL, 2);   -- VIERNES 17:30 (horario_id=30)

-- INGLÉS TÉCNICO (curso_id = 85) - 2 horas/semana
-- MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(334, 85, 17, NULL, 1),   -- MIERCOLES 16:45 (horario_id=17)
(335, 85, 18, NULL, 2);   -- MIERCOLES 17:30 (horario_id=18)

-- ============================================
-- PRIMERO C - NOCHE (curso_id: 86-94)
-- ============================================

-- CONTABILIDAD I (curso_id = 86) - 8 horas/semana
-- JUEVES (4 bloques) + VIERNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(336, 86, 46, NULL, 1),   -- JUEVES 18:15 (horario_id=46)
(337, 86, 47, NULL, 2),   -- JUEVES 19:00 (horario_id=47)
(338, 86, 48, NULL, 3),   -- JUEVES 19:45 (horario_id=48)
(339, 86, 49, NULL, 4),   -- JUEVES 20:30 (horario_id=49)
(340, 86, 51, NULL, 5),   -- VIERNES 18:15 (horario_id=51)
(341, 86, 52, NULL, 6),   -- VIERNES 19:00 (horario_id=52)
(342, 86, 53, NULL, 7),   -- VIERNES 19:45 (horario_id=53)
(343, 86, 54, NULL, 8);   -- VIERNES 20:30 (horario_id=54)

-- MATEMÁTICA FINANCIERA (curso_id = 87) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(344, 87, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(345, 87, 32, NULL, 2),   -- LUNES 19:00 (horario_id=32)
(346, 87, 33, NULL, 3),   -- LUNES 19:45 (horario_id=33)
(347, 87, 34, NULL, 4);   -- LUNES 20:30 (horario_id=34)

-- INFORMÁTICA CONTABLE (curso_id = 88) - 4 horas/semana LAB 1
-- MARTES (2 bloques) + JUEVES (1 bloque) + VIERNES (1 bloque)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(348, 88, 39, 1, 1),       -- MARTES 20:30 (horario_id=39)
(349, 88, 40, 1, 2),      -- MARTES 21:15 (horario_id=40)
(350, 88, 50, 1, 3),      -- JUEVES 21:15 (horario_id=50)
(351, 88, 55, 1, 4);      -- VIERNES 21:15 (horario_id=55)

-- ADMINISTRACIÓN GENERAL (curso_id = 89) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(352, 89, 41, NULL, 1),   -- MIERCOLES 18:15 (horario_id=41)
(353, 89, 42, NULL, 2),   -- MIERCOLES 19:00 (horario_id=42)
(354, 89, 43, NULL, 3),   -- MIERCOLES 19:45 (horario_id=43)
(355, 89, 44, NULL, 4);   -- MIERCOLES 20:30 (horario_id=44)

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (curso_id = 90) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(356, 90, 36, NULL, 1),   -- MARTES 18:15 (horario_id=36)
(357, 90, 37, NULL, 2);   -- MARTES 19:00 (horario_id=37)

-- ECONOMÍA GENERAL APLICADA (curso_id = 91) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(358, 91, 34, NULL, 1),   -- LUNES 20:30 (horario_id=34)
(359, 91, 35, NULL, 2);   -- LUNES 21:15 (horario_id=35)

-- DOCUMENTOS COMERCIALES Y MERCANTILES (curso_id = 92) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(360, 92, 38, NULL, 1),   -- MARTES 19:45 (horario_id=38)
(361, 92, 39, NULL, 2);   -- MARTES 20:30 (horario_id=39)

-- ESTADÍSTICA APLICADA (curso_id = 93) - 2 horas/semana
-- VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(362, 93, 54, NULL, 1),   -- VIERNES 20:30 (horario_id=54)
(363, 93, 55, NULL, 2);   -- VIERNES 21:15 (horario_id=55)

-- INGLÉS TÉCNICO (curso_id = 94) - 2 horas/semana
-- MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(364, 94, 44, NULL, 1),   -- MIERCOLES 20:30 (horario_id=44)
(365, 94, 45, NULL, 2);   -- MIERCOLES 21:15 (horario_id=45)

-- ============================================
-- PRIMERO D - NOCHE (curso_id: 95-103)
-- ============================================

-- CONTABILIDAD I (curso_id = 95) - 8 horas/semana
-- JUEVES (4 bloques) + VIERNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(366, 95, 46, NULL, 1),   -- JUEVES 18:15 (horario_id=46)
(367, 95, 47, NULL, 2),   -- JUEVES 19:00 (horario_id=47)
(368, 95, 48, NULL, 3),   -- JUEVES 19:45 (horario_id=48)
(369, 95, 49, NULL, 4),   -- JUEVES 20:30 (horario_id=49)
(370, 95, 51, NULL, 5),   -- VIERNES 18:15 (horario_id=51)
(371, 95, 52, NULL, 6),   -- VIERNES 19:00 (horario_id=52)
(372, 95, 53, NULL, 7),   -- VIERNES 19:45 (horario_id=53)
(373, 95, 54, NULL, 8);   -- VIERNES 20:30 (horario_id=54)

-- MATEMÁTICA FINANCIERA (curso_id = 96) - 4 horas/semana
-- LUNES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(374, 96, 31, NULL, 1),   -- LUNES 18:15 (horario_id=31)
(375, 96, 32, NULL, 2),   -- LUNES 19:00 (horario_id=32)
(376, 96, 33, NULL, 3),   -- LUNES 19:45 (horario_id=33)
(377, 96, 34, NULL, 4);   -- LUNES 20:30 (horario_id=34)

-- INFORMÁTICA CONTABLE (curso_id = 97) - 4 horas/semana LAB 2
-- MARTES (2 bloques) + JUEVES (1 bloque) + VIERNES (1 bloque)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(378, 97, 39, 2, 1),       -- MARTES 20:30 (horario_id=39)
(379, 97, 40, 2, 2),      -- MARTES 21:15 (horario_id=40)
(380, 97, 50, 2, 3),      -- JUEVES 21:15 (horario_id=50)
(381, 97, 55, 2, 4);      -- VIERNES 21:15 (horario_id=55)

-- ADMINISTRACIÓN GENERAL (curso_id = 98) - 4 horas/semana
-- MIÉRCOLES (4 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(382, 98, 41, NULL, 1),   -- MIERCOLES 18:15 (horario_id=41)
(383, 98, 42, NULL, 2),   -- MIERCOLES 19:00 (horario_id=42)
(384, 98, 43, NULL, 3),   -- MIERCOLES 19:45 (horario_id=43)
(385, 98, 44, NULL, 4);   -- MIERCOLES 20:30 (horario_id=44)

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (curso_id = 99) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(386, 99, 36, NULL, 1),   -- MARTES 18:15 (horario_id=36)
(387, 99, 37, NULL, 2);   -- MARTES 19:00 (horario_id=37)

-- ECONOMÍA GENERAL APLICADA (curso_id = 100) - 2 horas/semana
-- LUNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(388, 100, 34, NULL, 1),  -- LUNES 20:30 (horario_id=34)
(389, 100, 35, NULL, 2);   -- LUNES 21:15 (horario_id=35)

-- DOCUMENTOS COMERCIALES Y MERCANTILES (curso_id = 101) - 2 horas/semana
-- MARTES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(390, 101, 38, NULL, 1),  -- MARTES 19:45 (horario_id=38)
(391, 101, 39, NULL, 2);   -- MARTES 20:30 (horario_id=39)

-- ESTADÍSTICA APLICADA (curso_id = 102) - 2 horas/semana
-- VIERNES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(392, 102, 54, NULL, 1),   -- VIERNES 20:30 (horario_id=54)
(393, 102, 55, NULL, 2);   -- VIERNES 21:15 (horario_id=55)

-- INGLÉS TÉCNICO (curso_id = 103) - 2 horas/semana
-- MIÉRCOLES (2 bloques)
INSERT INTO cursos_horarios (id, curso_id, horario_id, aula_id, orden_secuencia) VALUES
(394, 103, 44, NULL, 1),   -- MIERCOLES 20:30 (horario_id=44)
(395, 103, 45, NULL, 2);   -- MIERCOLES 21:15 (horario_id=45)

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (TARDE): 9 cursos × ~3-8 bloques = 30 registros (IDs 276-305)
-- PARALELO B (TARDE): 9 cursos × ~3-8 bloques = 30 registros (IDs 306-335)
-- PARALELO C (NOCHE): 9 cursos × ~3-8 bloques = 30 registros (IDs 336-365)
-- PARALELO D (NOCHE): 9 cursos × ~3-8 bloques = 30 registros (IDs 366-395)
-- TOTAL: 120 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
