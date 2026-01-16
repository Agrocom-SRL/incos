-- ============================================
-- SEEDER: paralelos - COMPLETO
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: TODOS los paralelos del horario académico 2025
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE paralelos;

-- ============================================
-- LIMPIAR VARIABLES DE USUARIO (para evitar conflictos con otros seeders)
-- ============================================
SET @carrera_sis_id = NULL;
SET @carrera_adm_id = NULL;
SET @carrera_con_id = NULL;
SET @plan_sis_id = NULL;
SET @plan_adm_id = NULL;
SET @plan_con_id = NULL;
SET @periodo_sis_1_id = NULL;
SET @periodo_sis_2_id = NULL;
SET @periodo_sis_3_id = NULL;
SET @periodo_adm_1_id = NULL;
SET @periodo_adm_2_id = NULL;
SET @periodo_adm_3_id = NULL;
SET @periodo_con_1_id = NULL;
SET @periodo_con_2_id = NULL;
SET @periodo_con_3_id = NULL;

-- ============================================
-- OBTENER IDs DE REFERENCIA
-- ============================================

-- IDs de carreras (usando codigo para evitar dependencia del orden de inserción)
SET @carrera_sis_id = (SELECT id FROM carreras WHERE codigo = 'SIS-INF' AND deleted_at IS NULL LIMIT 1);
SET @carrera_adm_id = (SELECT id FROM carreras WHERE codigo = 'ADM-EMP' AND deleted_at IS NULL LIMIT 1);
SET @carrera_con_id = (SELECT id FROM carreras WHERE codigo = 'CON-GEN' AND deleted_at IS NULL LIMIT 1);

-- Validar que se obtuvieron los IDs correctamente
-- Si alguna variable es NULL, significa que la carrera no existe o no se insertó correctamente

-- IDs de planes de estudio (usando carrera_id para obtener el plan correcto)
SET @plan_sis_id = (SELECT id FROM planes_estudios WHERE carrera_id = @carrera_sis_id AND deleted_at IS NULL AND activo = TRUE LIMIT 1);
SET @plan_adm_id = (SELECT id FROM planes_estudios WHERE carrera_id = @carrera_adm_id AND deleted_at IS NULL AND activo = TRUE LIMIT 1);
SET @plan_con_id = (SELECT id FROM planes_estudios WHERE carrera_id = @carrera_con_id AND deleted_at IS NULL AND activo = TRUE LIMIT 1);

-- IDs de periodos por carrera (usando plan_estudio_id y numero para obtener el periodo correcto)
-- SISTEMAS INFORMÁTICOS
SET @periodo_sis_1_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_sis_id AND numero = 1 AND deleted_at IS NULL AND activo = TRUE LIMIT 1);
SET @periodo_sis_2_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_sis_id AND numero = 2 AND deleted_at IS NULL AND activo = TRUE LIMIT 1);
SET @periodo_sis_3_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_sis_id AND numero = 3 AND deleted_at IS NULL AND activo = TRUE LIMIT 1);

-- ADMINISTRACIÓN DE EMPRESAS
SET @periodo_adm_1_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_adm_id AND numero = 1 AND deleted_at IS NULL AND activo = TRUE LIMIT 1);
SET @periodo_adm_2_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_adm_id AND numero = 2 AND deleted_at IS NULL AND activo = TRUE LIMIT 1);
SET @periodo_adm_3_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_adm_id AND numero = 3 AND deleted_at IS NULL AND activo = TRUE LIMIT 1);

-- CONTADURÍA GENERAL
SET @periodo_con_1_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_con_id AND numero = 1 AND deleted_at IS NULL AND activo = TRUE LIMIT 1);
SET @periodo_con_2_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_con_id AND numero = 2 AND deleted_at IS NULL AND activo = TRUE LIMIT 1);
SET @periodo_con_3_id = (SELECT id FROM periodos WHERE plan_estudio_id = @plan_con_id AND numero = 3 AND deleted_at IS NULL AND activo = TRUE LIMIT 1);

-- ============================================
-- INSERTAR PARALELOS - CONTADURÍA GENERAL
-- ============================================

-- PRIMER AÑO
INSERT INTO paralelos (carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(@carrera_con_id, @periodo_con_1_id, 'PRIMERO A', 'TARDE', 'Paralelo A de Primer Año - Contaduría General - Turno Tarde'),
(@carrera_con_id, @periodo_con_1_id, 'PRIMERO B', 'TARDE', 'Paralelo B de Primer Año - Contaduría General - Turno Tarde'),
(@carrera_con_id, @periodo_con_1_id, 'PRIMERO C', 'NOCHE', 'Paralelo C de Primer Año - Contaduría General - Turno Noche'),
(@carrera_con_id, @periodo_con_1_id, 'PRIMERO D', 'NOCHE', 'Paralelo D de Primer Año - Contaduría General - Turno Noche');

-- SEGUNDO AÑO
INSERT INTO paralelos (carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(@carrera_con_id, @periodo_con_2_id, 'SEGUNDO A', 'TARDE', 'Paralelo A de Segundo Año - Contaduría General - Turno Tarde'),
(@carrera_con_id, @periodo_con_2_id, 'SEGUNDO B', 'NOCHE', 'Paralelo B de Segundo Año - Contaduría General - Turno Noche');

-- TERCER AÑO
INSERT INTO paralelos (carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(@carrera_con_id, @periodo_con_3_id, 'TERCERO A', 'TARDE', 'Paralelo A de Tercer Año - Contaduría General - Turno Tarde'),
(@carrera_con_id, @periodo_con_3_id, 'TERCERO B', 'TARDE', 'Paralelo B de Tercer Año - Contaduría General - Turno Tarde');

-- ============================================
-- INSERTAR PARALELOS - ADMINISTRACIÓN DE EMPRESAS
-- ============================================

-- PRIMER AÑO
INSERT INTO paralelos (carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(@carrera_adm_id, @periodo_adm_1_id, 'PRIMERO A', 'TARDE', 'Paralelo A de Primer Año - Administración de Empresas - Turno Tarde'),
(@carrera_adm_id, @periodo_adm_1_id, 'PRIMERO B', 'NOCHE', 'Paralelo B de Primer Año - Administración de Empresas - Turno Noche');

-- SEGUNDO AÑO
INSERT INTO paralelos (carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(@carrera_adm_id, @periodo_adm_2_id, 'SEGUNDO A', 'TARDE', 'Paralelo A de Segundo Año - Administración de Empresas - Turno Tarde'),
(@carrera_adm_id, @periodo_adm_2_id, 'SEGUNDO B', 'NOCHE', 'Paralelo B de Segundo Año - Administración de Empresas - Turno Noche');

-- TERCER AÑO
INSERT INTO paralelos (carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(@carrera_adm_id, @periodo_adm_3_id, 'TERCERO A', 'NOCHE', 'Paralelo A de Tercer Año - Administración de Empresas - Turno Noche');

-- ============================================
-- INSERTAR PARALELOS - SISTEMAS INFORMÁTICOS
-- ============================================

-- PRIMER AÑO
INSERT INTO paralelos (carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(@carrera_sis_id, @periodo_sis_1_id, 'PRIMERO A', 'NOCHE', 'Paralelo A de Primer Año - Sistemas Informáticos - Turno Noche'),
(@carrera_sis_id, @periodo_sis_1_id, 'PRIMERO B', 'NOCHE', 'Paralelo B de Primer Año - Sistemas Informáticos - Turno Noche');

-- SEGUNDO AÑO
INSERT INTO paralelos (carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(@carrera_sis_id, @periodo_sis_2_id, 'SEGUNDO A', 'NOCHE', 'Paralelo A de Segundo Año - Sistemas Informáticos - Turno Noche');

-- TERCER AÑO
INSERT INTO paralelos (carrera_id, periodo_id, nombre, turno, descripcion) VALUES
(@carrera_sis_id, @periodo_sis_3_id, 'TERCERO A', 'NOCHE', 'Paralelo A de Tercer Año - Sistemas Informáticos - Turno Noche');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DE PARALELOS CREADOS
-- ============================================
-- CONTADURÍA GENERAL:
--   Primer Año: A (TARDE), B (TARDE), C (NOCHE), D (NOCHE) = 4 paralelos
--   Segundo Año: A (TARDE), B (NOCHE) = 2 paralelos
--   Tercer Año: A (TARDE), B (TARDE) = 2 paralelos
--   TOTAL: 8 paralelos
--
-- ADMINISTRACIÓN DE EMPRESAS:
--   Primer Año: A (TARDE), B (NOCHE) = 2 paralelos
--   Segundo Año: A (TARDE), B (NOCHE) = 2 paralelos
--   Tercer Año: A (NOCHE) = 1 paralelo
--   TOTAL: 5 paralelos
--
-- SISTEMAS INFORMÁTICOS:
--   Primer Año: A (NOCHE), B (NOCHE) = 2 paralelos
--   Segundo Año: A (NOCHE) = 1 paralelo
--   Tercer Año: A (NOCHE) = 1 paralelo
--   TOTAL: 4 paralelos
--
-- TOTAL GENERAL: 17 paralelos
-- ============================================
-- FIN DEL SEEDER
-- ============================================