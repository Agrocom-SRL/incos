-- ============================================
-- VISTA BASE: vista_base_docente_ficha
-- Ficha de docente: datos personales, geografía de residencia (vista_base_municipios_geografia) y usuario/rol
--
-- Propósito: Una fila por docente activo en tabla docentes (no eliminado lógicamente).
-- Reutilizable para detalle de docente, paneles y vistas agregadas.
--
-- Relaciones:
-- - docentes.estado_civil_id → estados_civiles
-- - docentes.municipio_residencia_id → vista_base_municipios_geografia → departamentos → paises
-- - docentes.usuario_id → usuarios → roles
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_docente_ficha;

CREATE VIEW vista_base_docente_ficha AS
SELECT
  d.id AS docente_id,
  d.ci,
  d.expedicion,
  d.nombres,
  d.apellido_paterno,
  d.apellido_materno,
  d.fecha_nacimiento,
  d.genero,
  d.nacionalidad,
  d.telefono,
  d.celular,
  d.email_personal,
  d.direccion,
  d.zona,
  d.titulo_profesional,
  d.especialidad,
  d.nivel_academico,
  d.institucion_egreso,
  d.anio_egreso,
  d.anios_experiencia,
  d.fecha_contratacion,
  d.fecha_retiro,
  d.tipo_contrato,
  d.estado_laboral,
  d.observaciones,
  d.color_hex,
  d.max_horas_semana,
  d.max_horas_mes,
  d.activo,
  d.usuario_id,
  d.created_at,
  d.updated_at,
  d.estado_civil_id,
  d.municipio_residencia_id,
  geo.provincia_id AS residencia_provincia_id,
  geo.departamento_id AS residencia_departamento_id,
  ec.nombre AS estado_civil_nombre,
  geo.municipio_nombre,
  geo.provincia_nombre,
  geo.departamento_nombre,
  pa_res.nombre AS pais_nombre,
  u.username AS usuario_username,
  u.estado AS usuario_estado,
  r.nombre AS rol_nombre,
  r.codigo AS rol_codigo
FROM docentes d
LEFT JOIN estados_civiles ec ON ec.id = d.estado_civil_id AND ec.deleted_at IS NULL
LEFT JOIN vista_base_municipios_geografia geo ON geo.municipio_id = d.municipio_residencia_id
LEFT JOIN departamentos dep_res ON dep_res.id = geo.departamento_id AND dep_res.deleted_at IS NULL
LEFT JOIN paises pa_res ON pa_res.id = dep_res.pais_id AND pa_res.deleted_at IS NULL
LEFT JOIN usuarios u ON u.id = d.usuario_id AND u.deleted_at IS NULL
LEFT JOIN roles r ON r.id = u.rol_id AND r.deleted_at IS NULL
WHERE d.deleted_at IS NULL;
