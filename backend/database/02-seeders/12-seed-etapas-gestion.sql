-- ============================================
-- SEEDER: etapas_gestion
-- Sistema de Gestión Académica - Instituto INCOS
-- Datos iniciales: Etapas temporales por gestión académica
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar datos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE etapas_gestion;

-- ============================================
-- INSERTAR ETAPAS POR GESTIÓN
-- ============================================
-- Etapas estándar para cada gestión académica

-- Obtener IDs de las gestiones
SET @gestion_2026_id = (SELECT id FROM gestiones WHERE codigo = '2026' LIMIT 1);
SET @gestion_2025_id = (SELECT id FROM gestiones WHERE codigo = '2025' LIMIT 1);

-- Gestión 2026
INSERT INTO etapas_gestion (gestion_id, nombre, tipo, fecha_inicio, fecha_fin, vigente, descripcion) VALUES
(@gestion_2026_id, 'Pre-inscripción', 'PRE_INSCRIPCION', '2025-11-01', '2025-12-31', FALSE, 'Periodo de pre-inscripción de nuevos estudiantes'),
(@gestion_2026_id, 'Inscripciones', 'INSCRIPCIONES', '2026-01-01', '2026-01-31', FALSE, 'Periodo de inscripciones oficiales'),
(@gestion_2026_id, 'Clases', 'CLASES', '2026-02-01', '2026-10-31', FALSE, 'Periodo de clases regulares'),
(@gestion_2026_id, 'Evaluaciones', 'EVALUACIONES', '2026-11-01', '2026-11-30', FALSE, 'Periodo de evaluaciones y exámenes parciales'),
(@gestion_2026_id, 'Exámenes', 'EXAMENES', '2026-12-01', '2026-12-15', FALSE, 'Periodo de exámenes finales'),
(@gestion_2026_id, 'Entrega de Notas', 'ENTREGA_NOTAS', '2026-12-16', '2026-12-20', FALSE, 'Periodo de entrega y publicación de notas finales'),
(@gestion_2026_id, 'Cierre Administrativo', 'CIERRE_ADMINISTRATIVO', '2026-12-21', '2026-12-31', FALSE, 'Cierre administrativo de la gestión académica');

-- Gestión 2025 (referencia histórica)
INSERT INTO etapas_gestion (gestion_id, nombre, tipo, fecha_inicio, fecha_fin, vigente, descripcion) VALUES
(@gestion_2025_id, 'Pre-inscripción', 'PRE_INSCRIPCION', '2024-11-01', '2024-12-31', FALSE, 'Periodo de pre-inscripción de nuevos estudiantes'),
(@gestion_2025_id, 'Inscripciones', 'INSCRIPCIONES', '2025-01-01', '2025-01-31', FALSE, 'Periodo de inscripciones oficiales'),
(@gestion_2025_id, 'Clases', 'CLASES', '2025-02-01', '2025-10-31', FALSE, 'Periodo de clases regulares'),
(@gestion_2025_id, 'Evaluaciones', 'EVALUACIONES', '2025-11-01', '2025-11-30', FALSE, 'Periodo de evaluaciones y exámenes parciales'),
(@gestion_2025_id, 'Exámenes', 'EXAMENES', '2025-12-01', '2025-12-15', FALSE, 'Periodo de exámenes finales'),
(@gestion_2025_id, 'Entrega de Notas', 'ENTREGA_NOTAS', '2025-12-16', '2025-12-20', FALSE, 'Periodo de entrega y publicación de notas finales'),
(@gestion_2025_id, 'Cierre Administrativo', 'CIERRE_ADMINISTRATIVO', '2025-12-21', '2025-12-31', FALSE, 'Cierre administrativo de la gestión académica');

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SEEDER
-- ============================================

