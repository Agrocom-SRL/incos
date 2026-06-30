-- ============================================
-- VISTA: vista_estudiante_datos_personales
-- Cuerpo completo: datos de un estudiante con todas sus piezas (08–14)
--
-- Propósito: Une el torso (estudiantes) con las piezas base 09–14.
-- - 08 vista_base_municipios_geografia: usada internamente por 10 y 12, no se une aquí.
-- - 09 estado_civil (1:1)
-- - 10 residencia (1:1, usa 08)
-- - 11 apoderados (1:N → JSON)
-- - 12 orígenes + 14 idiomas (1:N → JSON, orígenes con país, ciudad e idiomas)
-- - 13 discapacidades (1:N → JSON)
--
-- NOTA: Se usan tablas derivadas (LEFT JOIN de agregados por estudiante_id) en lugar
-- de subconsultas correlacionadas en el SELECT, para evitar el error MySQL #1054
-- "No se reconoce la columna 'e.id' en WHERE" al crear/importar la vista.
--
-- IMPORTANTE: Ejecutar primero las vistas base en este orden:
-- 1. 08-vista-base-municipios-geografia.sql
-- 2. 12-vista-base-estudiante-origenes.sql (debe incluir nacimiento_municipio_id, nacimiento_provincia_id, nacimiento_departamento_id)
-- 3. 14-vista-base-estudiante-origenes-idiomas.sql
-- 4. Esta vista (15-vista-estudiante-datos-personales.sql)
--
-- Uso:
-- SELECT * FROM vista_estudiante_datos_personales WHERE id = ?;
-- SELECT * FROM vista_estudiante_datos_personales WHERE codigo_estudiante = ?;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_estudiante_datos_personales;

CREATE VIEW vista_estudiante_datos_personales AS
SELECT
  e.id,
  e.codigo_estudiante,
  e.ci,
  e.expedicion,
  e.nombres,
  e.apellido_paterno,
  e.apellido_materno,
  e.fecha_nacimiento,
  e.genero,
  e.estado_civil_id,
  e.tipo_sangre,
  e.tiene_discapacidad,
  e.email_personal,
  e.celular,
  e.telefono_fijo,
  e.direccion,
  e.municipio_residencia_id,
  e.zona,
  e.trabaja,
  e.empresa_institucion,
  e.cargo,
  e.observaciones,
  e.usuario_id,
  e.activo,
  e.created_at,
  e.updated_at,
  ec.estado_civil_nombre,
  ec.estado_civil_abreviatura,
  r.residencia_municipio_nombre,
  r.residencia_municipio_codigo,
  r.residencia_provincia_id,
  r.residencia_provincia_nombre,
  r.residencia_provincia_codigo,
  r.residencia_departamento_id,
  r.residencia_departamento_nombre,
  r.residencia_departamento_codigo,
  -- Cuenta de acceso vinculada (mismo patrón que vista 50 docente; alias `rol` porque `r` es residencia)
  u.username AS usuario_username,
  u.estado   AS usuario_estado,
  rol.nombre AS rol_nombre,
  rol.codigo AS rol_codigo,
  COALESCE(apoderados_agg.apoderados_json, JSON_ARRAY()) AS apoderados,
  COALESCE(origenes_agg.origenes_json, JSON_ARRAY()) AS origenes,
  COALESCE(discapacidades_agg.discapacidades_json, JSON_ARRAY()) AS discapacidades
FROM estudiantes e
LEFT JOIN vista_base_estudiante_estado_civil ec ON ec.estudiante_id = e.id
LEFT JOIN vista_base_estudiante_residencia r ON r.estudiante_id = e.id
LEFT JOIN (
  SELECT
    a.estudiante_id,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'apoderado_id', a.apoderado_id,
        'tipo_parentesco_id', a.tipo_parentesco_id,
        'tipo_parentesco_nombre', a.tipo_parentesco_nombre,
        'apoderado_nombres', a.apoderado_nombres,
        'apoderado_apellidos', a.apoderado_apellidos,
        'celular_1', a.celular_1,
        'celular_2', a.celular_2,
        'vive_con_estudiante', a.vive_con_estudiante
      )
    ) AS apoderados_json
  FROM vista_base_estudiante_apoderados a
  GROUP BY a.estudiante_id
) apoderados_agg ON apoderados_agg.estudiante_id = e.id
LEFT JOIN (
  SELECT
    o_ordenado.estudiante_id,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'origen_id', o_ordenado.origen_id,
        'pais_id', o_ordenado.pais_id,
        'pais_id_efectivo', o_ordenado.pais_id_efectivo,
        'pais_nombre', o_ordenado.pais_nombre,
        'pais_codigo_iso', o_ordenado.pais_codigo_iso,
        'municipio_nacimiento_id', o_ordenado.municipio_nacimiento_id,
        'nacimiento_municipio_id', o_ordenado.nacimiento_municipio_id,
        'nacimiento_provincia_id', o_ordenado.nacimiento_provincia_id,
        'nacimiento_departamento_id', o_ordenado.nacimiento_departamento_id,
        'ciudad', o_ordenado.ciudad,
        'ciudad_nacimiento_raw', o_ordenado.ciudad_nacimiento_raw,
        'tipo_origen', o_ordenado.tipo_origen,
        'es_principal', o_ordenado.es_principal,
        'nacimiento_municipio_nombre', o_ordenado.nacimiento_municipio_nombre,
        'nacimiento_provincia_nombre', o_ordenado.nacimiento_provincia_nombre,
        'nacimiento_departamento_nombre', o_ordenado.nacimiento_departamento_nombre,
        'idioma_materno_id', o_ordenado.idioma_materno_id,
        'idioma_materno_nombre', o_ordenado.idioma_materno_nombre,
        'idioma_materno_codigo_iso', o_ordenado.idioma_materno_codigo_iso,
        'idioma_secundario_id', o_ordenado.idioma_secundario_id,
        'idioma_secundario_nombre', o_ordenado.idioma_secundario_nombre,
        'idioma_secundario_codigo_iso', o_ordenado.idioma_secundario_codigo_iso
      )
    ) AS origenes_json
  FROM (
    SELECT
      o.origen_id,
      o.estudiante_id,
      o.pais_id,
      o.pais_id_efectivo,
      o.pais_nombre,
      o.pais_codigo_iso,
      o.municipio_nacimiento_id,
      o.nacimiento_municipio_id,
      o.nacimiento_provincia_id,
      o.nacimiento_departamento_id,
      o.ciudad,
      o.ciudad_nacimiento_raw,
      o.tipo_origen,
      o.es_principal,
      o.nacimiento_municipio_nombre,
      o.nacimiento_provincia_nombre,
      o.nacimiento_departamento_nombre,
      i.idioma_materno_id,
      i.idioma_materno_nombre,
      i.idioma_materno_codigo_iso,
      i.idioma_secundario_id,
      i.idioma_secundario_nombre,
      i.idioma_secundario_codigo_iso
    FROM vista_base_estudiante_origenes o
    LEFT JOIN vista_base_estudiante_origenes_idiomas i ON i.origen_id = o.origen_id
  ) o_ordenado
  GROUP BY o_ordenado.estudiante_id
) origenes_agg ON origenes_agg.estudiante_id = e.id
LEFT JOIN (
  SELECT
    d.estudiante_id,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'discapacidad_id', d.discapacidad_id,
        'tipo_discapacidad_id', d.tipo_discapacidad_id,
        'tipo_discapacidad_nombre', d.tipo_discapacidad_nombre,
        'discapacidad_descripcion', d.discapacidad_descripcion,
        'grado_discapacidad', d.grado_discapacidad,
        'discapacidad_causa', d.discapacidad_causa
      )
    ) AS discapacidades_json
  FROM vista_base_estudiante_discapacidades d
  GROUP BY d.estudiante_id
) discapacidades_agg ON discapacidades_agg.estudiante_id = e.id
-- Usuario de acceso del estudiante (N:1, no duplica filas). LEFT JOIN: no excluye estudiantes sin cuenta.
LEFT JOIN usuarios u   ON u.id = e.usuario_id AND u.deleted_at IS NULL
LEFT JOIN roles    rol ON rol.id = u.rol_id   AND rol.deleted_at IS NULL
WHERE e.activo = TRUE
  AND e.deleted_at IS NULL;
