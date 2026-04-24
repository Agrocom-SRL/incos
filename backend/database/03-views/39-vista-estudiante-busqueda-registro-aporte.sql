-- ============================================
-- VISTA: vista_estudiante_busqueda_registro_aporte
-- Fila lista para búsqueda / muestra previa al registro de cuota de aporte
--
-- Propósito: Une datos personales del estudiante (15) con carrera reciente (38)
-- y resumen de cabeceras de aporte (37). El backend consulta esta vista con LIKE
-- o con filtro cabeceras_con_saldo > 0 para la muestra inicial.
--
-- Dependencias (orden sugerido):
-- 1. 15-vista-estudiante-datos-personales.sql
-- 2. 37-vista-base-estudiante-aporte-saldo-resumen.sql
-- 3. 38-vista-base-estudiante-carrera-reciente.sql
-- 4. Esta vista
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_estudiante_busqueda_registro_aporte;

CREATE VIEW vista_estudiante_busqueda_registro_aporte AS
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
  COALESCE(sr.cabeceras_con_saldo, 0) AS cabeceras_con_saldo,
  COALESCE(sr.saldo_pendiente_total, 0) AS saldo_pendiente_total,
  COALESCE(sr.cabeceras_total, 0) AS cabeceras_total
FROM vista_estudiante_datos_personales v
LEFT JOIN vista_base_estudiante_aporte_saldo_resumen sr ON sr.estudiante_id = v.id
LEFT JOIN vista_base_estudiante_carrera_reciente cr ON cr.estudiante_id = v.id;
