-- ============================================
-- SEEDER: asignaciones_docentes - CONTADURÍA GENERAL PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de docentes a cursos - Gestión 2026 (VIGENTE)
-- ============================================
-- Gestión 2026: gestion_id = 1 (vigente)
-- Plan Contaduría General: gestion_plan_id = 3
-- Periodo: Primer Año (periodo_id = 7)
-- Paralelos: PRIMERO A (paralelo_id=11), PRIMERO B (paralelo_id=12), PRIMERO C (paralelo_id=13), PRIMERO D (paralelo_id=14)
-- Cursos: IDs 75-110 (1A: 75-83, 1B: 84-92, 1C: 93-101, 1D: 102-110)
-- ============================================
-- NOTA: Asignaciones basadas en el horario académico oficial 2026 (imágenes proporcionadas)
-- Docentes CON-GEN: IDs 16-30
--  16: Hilda Barriga
--  17: Sebastián Vargas
--  18: Sonia Carrizales
--  19: Patricia Rodriguez Cuellar (Téc.)
--  20: Gonzalo Icuña
--  21: Miguel Padilla
--  22: Jose Luis Montenegro
--  23: Franz Lujan
--  26: Willma Fernandez
--  27: Aurelio Hurtado
--  28: Elias Sarzuri
--  29: Teodora Paraguayo
--  30: José Antonio Vara
-- Docentes compartidos:
--  4: Waly Vargas (SIS-INF)
--  12: Georgina Moron (ADM-EMP)
--  9: Elio Honor (ADM-EMP) - para Estadística Primero B

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaciones_docentes;

-- ============================================
-- INSERTAR ASIGNACIONES - PRIMERO A (TARDE)
-- Cursos: IDs 75-83
-- ============================================

-- CONTABILIDAD I (curso_id = 75, asignatura_plan_id = 46) - 8 horas/semana
-- Docente: Lic. Sebastián Vargas (docente_id = 17)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(75, 3, 75, 17, 8, TRUE, '2026-01-19', TRUE);

-- MATEMÁTICA FINANCIERA (curso_id = 76, asignatura_plan_id = 47) - 4 horas/semana
-- Docente: Lic. Hilda Barriga (docente_id = 16)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(76, 3, 76, 16, 4, TRUE, '2026-01-19', TRUE);

-- INFORMÁTICA CONTABLE (curso_id = 77, asignatura_plan_id = 48) - 4 horas/semana
-- Docente: Lic. Miguel Padilla (docente_id = 21)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(77, 3, 77, 21, 4, TRUE, '2026-01-19', TRUE);

-- ADMINISTRACIÓN GENERAL (curso_id = 78, asignatura_plan_id = 49) - 4 horas/semana
-- Docente: Lic. Sonia Carrizales (docente_id = 18)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(78, 3, 78, 18, 4, TRUE, '2026-01-19', TRUE);

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (curso_id = 79, asignatura_plan_id = 50) - 2 horas/semana
-- Docente: Téc. Patricia Rodriguez Cuellar (docente_id = 19)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(79, 3, 79, 19, 2, TRUE, '2026-01-19', TRUE);

-- ECONOMÍA GENERAL APLICADA (curso_id = 80, asignatura_plan_id = 51) - 2 horas/semana
-- Docente: Lic. Gonzalo Icuña (docente_id = 20)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(80, 3, 80, 20, 2, TRUE, '2026-01-19', TRUE);

-- DOCUMENTOS COMERCIALES Y MERCANTILES (curso_id = 81, asignatura_plan_id = 52) - 2 horas/semana
-- Docente: Lic. Hilda Barriga (docente_id = 16)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(81, 3, 81, 16, 2, TRUE, '2026-01-19', TRUE);

-- ESTADÍSTICA APLICADA (curso_id = 82, asignatura_plan_id = 53) - 2 horas/semana
-- Docente: Lic. Jose Luis Montenegro (docente_id = 22)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(82, 3, 82, 22, 2, TRUE, '2026-01-19', TRUE);

-- INGLÉS TÉCNICO (curso_id = 83, asignatura_plan_id = 54) - 2 horas/semana
-- Docente: Ing. Waly Vargas (docente_id = 4) - Compartido con SIS-INF
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(83, 3, 83, 4, 2, TRUE, '2026-01-19', TRUE);

-- ============================================
-- INSERTAR ASIGNACIONES - PRIMERO B (TARDE)
-- Cursos: IDs 84-92
-- ============================================

-- CONTABILIDAD I (curso_id = 84, asignatura_plan_id = 46) - 8 horas/semana
-- Docente: Lic. Teodora Paraguayo (docente_id = 29)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(84, 3, 84, 29, 8, TRUE, '2026-01-19', TRUE);

-- MATEMÁTICA FINANCIERA (curso_id = 85, asignatura_plan_id = 47) - 4 horas/semana
-- Docente: Lic. Georgina Moron (docente_id = 12) - Compartido con ADM-EMP
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(85, 3, 85, 12, 4, TRUE, '2026-01-19', TRUE);

-- INFORMÁTICA CONTABLE (curso_id = 86, asignatura_plan_id = 48) - 4 horas/semana
-- Docente: Lic. Franz Lujan (docente_id = 23)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(86, 3, 86, 23, 4, TRUE, '2026-01-19', TRUE);

-- ADMINISTRACIÓN GENERAL (curso_id = 87, asignatura_plan_id = 49) - 4 horas/semana
-- Docente: Lic. Willma Fernandez (docente_id = 26)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(87, 3, 87, 26, 4, TRUE, '2026-01-19', TRUE);

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (curso_id = 88, asignatura_plan_id = 50) - 2 horas/semana
-- Docente: Téc. Patricia Rodriguez Cuellar (docente_id = 19)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(88, 3, 88, 19, 2, TRUE, '2026-01-19', TRUE);

-- ECONOMÍA GENERAL APLICADA (curso_id = 89, asignatura_plan_id = 51) - 2 horas/semana
-- Docente: Lic. Georgina Moron (docente_id = 12) - Compartido con ADM-EMP
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(89, 3, 89, 12, 2, TRUE, '2026-01-19', TRUE);

-- DOCUMENTOS COMERCIALES Y MERCANTILES (curso_id = 90, asignatura_plan_id = 52) - 2 horas/semana
-- Docente: Lic. Hilda Barriga (docente_id = 16)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(90, 3, 90, 16, 2, TRUE, '2026-01-19', TRUE);

-- ESTADÍSTICA APLICADA (curso_id = 91, asignatura_plan_id = 53) - 2 horas/semana
-- Docente: Lic. Elio Honor (docente_id = 9) - Compartido con ADM-EMP
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(91, 3, 91, 9, 2, TRUE, '2026-01-19', TRUE);

-- INGLÉS TÉCNICO (curso_id = 92, asignatura_plan_id = 54) - 2 horas/semana
-- Docente: Ing. Waly Vargas (docente_id = 4) - Compartido con SIS-INF
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(92, 3, 92, 4, 2, TRUE, '2026-01-19', TRUE);

-- ============================================
-- INSERTAR ASIGNACIONES - PRIMERO C (NOCHE)
-- Cursos: IDs 93-101
-- ============================================

-- CONTABILIDAD I (curso_id = 93, asignatura_plan_id = 46) - 8 horas/semana
-- Docente: Lic. José Antonio Vara (docente_id = 30)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(93, 3, 93, 30, 8, TRUE, '2026-01-19', TRUE);

-- MATEMÁTICA FINANCIERA (curso_id = 94, asignatura_plan_id = 47) - 4 horas/semana
-- Docente: Lic. Georgina Moron (docente_id = 12) - Compartido con ADM-EMP
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(94, 3, 94, 12, 4, TRUE, '2026-01-19', TRUE);

-- INFORMÁTICA CONTABLE (curso_id = 95, asignatura_plan_id = 48) - 4 horas/semana
-- Docente: Lic. Aurelio Hurtado (docente_id = 27)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(95, 3, 95, 27, 4, TRUE, '2026-01-19', TRUE);

-- ADMINISTRACIÓN GENERAL (curso_id = 96, asignatura_plan_id = 49) - 4 horas/semana
-- Docente: Lic. Willma Fernandez (docente_id = 26)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(96, 3, 96, 26, 4, TRUE, '2026-01-19', TRUE);

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (curso_id = 97, asignatura_plan_id = 50) - 2 horas/semana
-- Docente: Lic. Teodora Paraguayo (docente_id = 29)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(97, 3, 97, 29, 2, TRUE, '2026-01-19', TRUE);

-- ECONOMÍA GENERAL APLICADA (curso_id = 98, asignatura_plan_id = 51) - 2 horas/semana
-- Docente: Lic. Gonzalo Icuña (docente_id = 20)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(98, 3, 98, 20, 2, TRUE, '2026-01-19', TRUE);

-- DOCUMENTOS COMERCIALES Y MERCANTILES (curso_id = 99, asignatura_plan_id = 52) - 2 horas/semana
-- Docente: Lic. Elias Sarzuri (docente_id = 28)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(99, 3, 99, 28, 2, TRUE, '2026-01-19', TRUE);

-- ESTADÍSTICA APLICADA (curso_id = 100, asignatura_plan_id = 53) - 2 horas/semana
-- Docente: Lic. Jose Luis Montenegro (docente_id = 22)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(100, 3, 100, 22, 2, TRUE, '2026-01-19', TRUE);

-- INGLÉS TÉCNICO (curso_id = 101, asignatura_plan_id = 54) - 2 horas/semana
-- Docente: Ing. Yesmani Fernandez (docente_id = 7) - Compartido con SIS-INF
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(101, 3, 101, 7, 2, TRUE, '2026-01-19', TRUE);

-- ============================================
-- INSERTAR ASIGNACIONES - PRIMERO D (NOCHE)
-- Cursos: IDs 102-110
-- ============================================

-- CONTABILIDAD I (curso_id = 102, asignatura_plan_id = 46) - 8 horas/semana
-- Docente: Lic. AURELIO HURTADO (docente_id = 27)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(102, 3, 102, 27, 8, TRUE, '2026-01-19', TRUE);

-- MATEMÁTICA FINANCIERA (curso_id = 103, asignatura_plan_id = 47) - 4 horas/semana
-- Docente: Lic. Georgina Moron (docente_id = 12) - Compartido con ADM-EMP
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(103, 3, 103, 12, 4, TRUE, '2026-01-19', TRUE);

-- INFORMÁTICA CONTABLE (curso_id = 104, asignatura_plan_id = 48) - 4 horas/semana
-- Docente: Lic. Aurelio Hurtado (docente_id = 27)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(104, 3, 104, 27, 4, TRUE, '2026-01-19', TRUE);

-- ADMINISTRACIÓN GENERAL (curso_id = 105, asignatura_plan_id = 49) - 4 horas/semana
-- Docente: Lic. Willma Fernandez (docente_id = 26)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(105, 3, 105, 26, 4, TRUE, '2026-01-19', TRUE);

-- LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (curso_id = 106, asignatura_plan_id = 50) - 2 horas/semana
-- Docente: Lic. Teodora Paraguayo (docente_id = 29)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(106, 3, 106, 29, 2, TRUE, '2026-01-19', TRUE);

-- ECONOMÍA GENERAL APLICADA (curso_id = 107, asignatura_plan_id = 51) - 2 horas/semana
-- Docente: Lic. Gonzalo Icuña (docente_id = 20)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(107, 3, 107, 20, 2, TRUE, '2026-01-19', TRUE);

-- DOCUMENTOS COMERCIALES Y MERCANTILES (curso_id = 108, asignatura_plan_id = 52) - 2 horas/semana
-- Docente: Lic. Elias Sarzuri (docente_id = 28)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(108, 3, 108, 28, 2, TRUE, '2026-01-19', TRUE);

-- ESTADÍSTICA APLICADA (curso_id = 109, asignatura_plan_id = 53) - 2 horas/semana
-- Docente: Lic. CF PUMA (docente_id = 13) - Compartido con ADM-EMP
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(109, 3, 109, 13, 2, TRUE, '2026-01-19', TRUE);

-- INGLÉS TÉCNICO (curso_id = 110, asignatura_plan_id = 54) - 2 horas/semana
-- Docente: Ing. Waly Vargas (docente_id = 4) - Compartido con SIS-INF
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(110, 3, 110, 4, 2, TRUE, '2026-01-19', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE ASIGNACIONES
-- ============================================
-- PARALELO A (PRIMERO A - TARDE): 9 asignaciones (IDs 75-83)
--   - Sebastián Vargas (17): CONTABILIDAD I (1 curso, 8 horas)
--   - Hilda Barriga (16): MATEMÁTICA FINANCIERA, DOCUMENTOS COMERCIALES Y MERCANTILES (2 cursos, 6 horas total)
--   - Miguel Padilla (21): INFORMÁTICA CONTABLE (1 curso, 4 horas)
--   - Sonia Carrizales (18): ADMINISTRACIÓN GENERAL (1 curso, 4 horas)
--   - Patricia Rodriguez Cuellar (19): LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (1 curso, 2 horas)
--   - Gonzalo Icuña (20): ECONOMÍA GENERAL APLICADA (1 curso, 2 horas)
--   - Jose Luis Montenegro (22): ESTADÍSTICA APLICADA (1 curso, 2 horas)
--   - Waly Vargas (4): INGLÉS TÉCNICO (1 curso, 2 horas) - Compartido SIS-INF
--
-- PARALELO B (PRIMERO B - TARDE): 9 asignaciones (IDs 84-92)
--   - Teodora Paraguayo (29): CONTABILIDAD I (1 curso, 8 horas)
--   - Georgina Moron (12): MATEMÁTICA FINANCIERA, ECONOMÍA GENERAL APLICADA (2 cursos, 6 horas total) - Compartido ADM-EMP
--   - Franz Lujan (23): INFORMÁTICA CONTABLE (1 curso, 4 horas)
--   - Willma Fernandez (26): ADMINISTRACIÓN GENERAL (1 curso, 4 horas)
--   - Patricia Rodriguez Cuellar (19): LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (1 curso, 2 horas)
--   - Hilda Barriga (16): DOCUMENTOS COMERCIALES Y MERCANTILES (1 curso, 2 horas)
--   - Elio Honor (9): ESTADÍSTICA APLICADA (1 curso, 2 horas) - Compartido ADM-EMP
--   - Waly Vargas (4): INGLÉS TÉCNICO (1 curso, 2 horas) - Compartido SIS-INF
--
-- PARALELO C (PRIMERO C - NOCHE): 9 asignaciones (IDs 93-101)
--   - José Antonio Vara (30): CONTABILIDAD I (1 curso, 8 horas)
--   - Georgina Moron (12): MATEMÁTICA FINANCIERA (1 curso, 4 horas) - Compartido ADM-EMP
--   - Aurelio Hurtado (27): INFORMÁTICA CONTABLE (1 curso, 4 horas)
--   - Willma Fernandez (26): ADMINISTRACIÓN GENERAL (1 curso, 4 horas)
--   - Teodora Paraguayo (29): LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (1 curso, 2 horas)
--   - Gonzalo Icuña (20): ECONOMÍA GENERAL APLICADA (1 curso, 2 horas)
--   - Elias Sarzuri (28): DOCUMENTOS COMERCIALES Y MERCANTILES (1 curso, 2 horas)
--   - Jose Luis Montenegro (22): ESTADÍSTICA APLICADA (1 curso, 2 horas)
--   - Yesmani Fernandez (7): INGLÉS TÉCNICO (1 curso, 2 horas) - Compartido SIS-INF
--
-- PARALELO D (PRIMERO D - NOCHE): 9 asignaciones (IDs 102-110)
--   - Aurelio Hurtado (27): CONTABILIDAD I, INFORMÁTICA CONTABLE (2 cursos, 12 horas total)
--   - Georgina Moron (12): MATEMÁTICA FINANCIERA (1 curso, 4 horas) - Compartido ADM-EMP
--   - Willma Fernandez (26): ADMINISTRACIÓN GENERAL (1 curso, 4 horas)
--   - Teodora Paraguayo (29): LEGISLACIÓN LABORAL Y SEGURIDAD SOCIAL APLICADA (1 curso, 2 horas)
--   - Gonzalo Icuña (20): ECONOMÍA GENERAL APLICADA (1 curso, 2 horas)
--   - Elias Sarzuri (28): DOCUMENTOS COMERCIALES Y MERCANTILES (1 curso, 2 horas)
--   - PUMA (13): ESTADÍSTICA APLICADA (1 curso, 2 horas) - Compartido ADM-EMP
--   - Waly Vargas (4): INGLÉS TÉCNICO (1 curso, 2 horas) - Compartido SIS-INF
--
-- TOTAL: 36 asignaciones (IDs 75-110)
-- Continuación desde el último ID del seeder de Administración tercer año (74)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
