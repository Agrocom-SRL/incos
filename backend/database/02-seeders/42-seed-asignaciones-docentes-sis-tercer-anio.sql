-- ============================================
-- SEEDER: asignaciones_docentes - SISTEMAS INFORMÁTICOS TERCER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de docentes a cursos - Gestión 2026 (VIGENTE)
-- ============================================
-- Gestión 2026: gestion_id = 1 (vigente)
-- Plan Sistemas Informáticos: gestion_plan_id = 1
-- Periodo: Tercer Año (periodo_id = 3)
-- Paralelo: TERCERO A (paralelo_id=4)
-- Cursos: IDs 23-30 (3A: 23-30)
-- ============================================
-- NOTA: Asignaciones basadas en el horario académico oficial 2026
-- Docentes SIS-INF: IDs 1-7
--  1: Ybeth Camacho
--  2: Roxana Justiniano
--  3: Magali Ticlla
--  4: Waly Vargas
--  5: Giovanna Fernandez
--  6: Lily Arenas
--  7: Yesmani Fernandez

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE asignaciones_docentes;

-- ============================================
-- INSERTAR ASIGNACIONES - TERCERO A (NOCHE)
-- Cursos: IDs 23-30
-- ============================================

-- EMPRENDIMIENTO PRODUCTIVO (curso_id = 23, asignatura_plan_id = 16)
-- Docente: Ing. Waly Vargas (docente_id = 4)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(23, 1, 23, 4, 4, TRUE, '2026-01-19', TRUE);

-- DISEÑO Y PROGRAMACIÓN WEB III (curso_id = 24, asignatura_plan_id = 17)
-- Docente: Ing. Yesmani Fernandez (docente_id = 7)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(24, 1, 24, 7, 4, TRUE, '2026-01-19', TRUE);

-- GESTIÓN Y MEJORAMIENTO DE CALIDAD DE SOFTWARE (curso_id = 25, asignatura_plan_id = 18)
-- Docente: Ing. Roxana Justiniano (docente_id = 2)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(25, 1, 25, 2, 2, TRUE, '2026-01-19', TRUE);

-- REDES DE COMPUTADORAS II (curso_id = 26, asignatura_plan_id = 19)
-- Docente: Ing. Roxana Justiniano (docente_id = 2)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(26, 1, 26, 2, 4, TRUE, '2026-01-19', TRUE);

-- TALLER DE MODALIDAD DE GRADUACIÓN (curso_id = 27, asignatura_plan_id = 20)
-- Docente: Ing. Lily Arenas (docente_id = 6)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(27, 1, 27, 6, 4, TRUE, '2026-01-19', TRUE);

-- ANÁLISIS Y DISEÑO DE SISTEMAS II (curso_id = 28, asignatura_plan_id = 21)
-- Docente: Ing. Magali Ticlla (docente_id = 3)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(28, 1, 28, 3, 4, TRUE, '2026-01-19', TRUE);

-- PROGRAMACIÓN PARA DISPOSITIVOS MÓVILES II (curso_id = 29, asignatura_plan_id = 22)
-- Docente: Ing. Yesmani Fernandez (docente_id = 7)
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(29, 1, 29, 7, 4, TRUE, '2026-01-19', TRUE);

-- BASE DE DATOS II (curso_id = 30, asignatura_plan_id = 23)
-- Docente: Ing. Ybeth Camacho (docente_id = 1)
-- Nota: En la imagen aparece como "Ibeth Camacho", se asume que es Ybeth Camacho
INSERT INTO asignaciones_docentes (id, gestion_plan_id, curso_id, docente_id, carga_horaria, vigente, fecha_asignacion, activo) VALUES
(30, 1, 30, 1, 4, TRUE, '2026-01-19', TRUE);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE ASIGNACIONES
-- ============================================
-- PARALELO A (TERCERO A - NOCHE): 8 asignaciones (IDs 23-30)
--   - Ybeth Camacho: BDD-308 (1 curso)
--   - Roxana Justiniano: GMC-303, RDC-304 (2 cursos)
--   - Magali Ticlla: ADS-306 (1 curso)
--   - Waly Vargas: EMP-301 (1 curso)
--   - Lily Arenas: TMG-305 (1 curso)
--   - Yesmani Fernandez: DPW-302, PDM-307 (2 cursos)
--
-- TOTAL: 8 asignaciones de docentes para Tercer Año - Sistemas Informáticos
-- Gestión: 2026 (VIGENTE)
-- ============================================
-- FIN DEL SEEDER
-- ============================================
