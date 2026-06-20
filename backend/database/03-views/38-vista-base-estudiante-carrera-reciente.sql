-- ============================================
-- VISTA BASE: vista_base_estudiante_carrera_reciente
-- Carrera y código de la fila académica más reciente por estudiante
--
-- Propósito: Evita subconsultas correlacionadas en búsquedas; alinea con
-- ORDER BY estudiante_datos_academicos_id DESC LIMIT 1 por estudiante.
--
-- Dependencias (ejecutar antes):
-- - 21-vista-estudiante-datos-academicos.sql
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_base_estudiante_carrera_reciente;

CREATE VIEW vista_base_estudiante_carrera_reciente AS
SELECT
  va.estudiante_id,
  va.carrera_nombre,
  va.carrera_codigo,
  va.carrera_color_hex
FROM vista_estudiante_datos_academicos va
INNER JOIN (
  SELECT
    va2.estudiante_id,
    MAX(va2.estudiante_datos_academicos_id) AS max_estudiante_datos_academicos_id
  FROM vista_estudiante_datos_academicos va2
  GROUP BY va2.estudiante_id
) ultimo
  ON ultimo.estudiante_id = va.estudiante_id
  AND ultimo.max_estudiante_datos_academicos_id = va.estudiante_datos_academicos_id;
