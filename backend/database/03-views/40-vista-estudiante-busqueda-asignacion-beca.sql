-- ============================================
-- VISTA: vista_estudiante_busqueda_asignacion_beca
-- Filas para búsqueda / muestra previa al asignar beca (sin beca ACTIVA/PENDIENTE en gestión vigente)
--
-- Propósito: Une datos personales (15) con carrera reciente (38) y excluye estudiantes que ya
-- tienen una beca en la gestión vigente con estado ACTIVA o PENDIENTE.
--
-- Dependencias (orden sugerido):
-- 1. 15-vista-estudiante-datos-personales.sql
-- 2. 38-vista-base-estudiante-carrera-reciente.sql
-- 3. 09-estudiantes-parte2.sql (estudiantes_becas), 07-estructura-academica-parte3.sql (gestiones)
-- 4. Esta vista
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_estudiante_busqueda_asignacion_beca;

CREATE VIEW vista_estudiante_busqueda_asignacion_beca AS
SELECT
  v.id,
  v.codigo_estudiante,
  v.nombres,
  v.apellido_paterno,
  v.apellido_materno,
  v.email_personal,
  v.celular,
  v.telefono_fijo,
  v.ci,
  v.expedicion,
  v.created_at,
  v.activo,
  cr.carrera_nombre,
  cr.carrera_codigo,
  cr.carrera_color_hex
FROM vista_estudiante_datos_personales v
LEFT JOIN vista_base_estudiante_carrera_reciente cr ON cr.estudiante_id = v.id
WHERE NOT EXISTS (
  SELECT 1
  FROM estudiantes_becas eb
  INNER JOIN gestiones g
    ON g.id = eb.gestion_id
    AND g.vigente = TRUE
    AND g.activo = TRUE
    AND g.deleted_at IS NULL
  WHERE eb.estudiante_id = v.id
    AND eb.deleted_at IS NULL
    AND eb.activo = TRUE
    AND eb.estado IN ('ACTIVA', 'PENDIENTE')
);
