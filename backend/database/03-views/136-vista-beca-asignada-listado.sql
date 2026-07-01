-- ============================================
-- VISTA: vista_beca_asignada_listado
-- Listado de becas/descuentos asignados a estudiantes con datos enriquecidos
--
-- Propósito: Elimina el N+1 del listado de becas asignadas. Une en una sola
-- lectura estudiantes_becas + estudiante + carrera reciente + tipo de beca +
-- gestión + impacto en el aporte (pago_aporte). Reutiliza la vista 38
-- (vista_base_estudiante_carrera_reciente); NO duplica la lógica de "carrera
-- más reciente por estudiante".
--
-- Consumidor: StudentScholarshipRepository.listarBecasAsignadas() →
-- ListStudentScholarshipsUseCase (arquetipo B, solo lectura).
--
-- Relaciones:
-- - estudiantes_becas.estudiante_id → estudiantes.id (INNER)
-- - estudiantes_becas.estudiante_id → vista_base_estudiante_carrera_reciente.estudiante_id (LEFT)
-- - estudiantes_becas.beca_descuento_id → becas_descuentos.id (LEFT)
-- - estudiantes_becas.gestion_id → gestiones.id (LEFT)
-- - pago_aporte.estudiante_beca_id → estudiantes_becas.id (LEFT, impacto en aporte)
--
-- Dependencias (ejecutar antes):
-- - 38-vista-base-estudiante-carrera-reciente.sql
--
-- Uso:
-- SELECT * FROM vista_beca_asignada_listado WHERE estudiante_id = ? ORDER BY id;
-- SELECT * FROM vista_beca_asignada_listado WHERE gestion_id = ? AND estado = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_beca_asignada_listado;

CREATE VIEW vista_beca_asignada_listado AS
SELECT
  eb.id,
  eb.estudiante_id,
  eb.beca_descuento_id,
  eb.gestion_id,
  eb.fecha_solicitud,
  eb.estado,
  eb.documentos_completos,
  eb.observaciones,
  eb.created_at,
  eb.updated_at,
  -- Estudiante
  est.codigo_estudiante,
  est.nombres,
  est.apellido_paterno,
  est.apellido_materno,
  est.ci,
  est.expedicion,
  -- Carrera reciente (reutiliza vista 38)
  cr.carrera_nombre,
  cr.carrera_codigo,
  cr.carrera_color_hex,
  -- Tipo de beca / descuento
  bd.nombre AS beca_nombre,
  bd.codigo AS beca_codigo,
  bd.porcentaje AS beca_porcentaje,
  bd.descripcion AS beca_descripcion,
  -- Gestión
  g.nombre AS gestion_nombre,
  g.anio AS gestion_anio,
  g.codigo AS gestion_codigo,
  -- Impacto en el aporte (cabecera pago_aporte de la beca)
  pa.descuento_beca AS descuento_aplicado,
  pa.monto_obligatorio AS monto_obligatorio
FROM estudiantes_becas eb
INNER JOIN estudiantes est ON est.id = eb.estudiante_id
  AND est.activo = TRUE
  AND est.deleted_at IS NULL
LEFT JOIN vista_base_estudiante_carrera_reciente cr ON cr.estudiante_id = eb.estudiante_id
LEFT JOIN becas_descuentos bd ON bd.id = eb.beca_descuento_id
  AND bd.activo = TRUE
  AND bd.deleted_at IS NULL
LEFT JOIN gestiones g ON g.id = eb.gestion_id
  AND g.activo = TRUE
  AND g.deleted_at IS NULL
LEFT JOIN pago_aporte pa ON pa.estudiante_beca_id = eb.id
  AND pa.activo = TRUE
  AND pa.deleted_at IS NULL
WHERE eb.activo = TRUE
  AND eb.deleted_at IS NULL;
