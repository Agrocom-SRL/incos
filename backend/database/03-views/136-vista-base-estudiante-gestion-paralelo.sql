-- ============================================
-- VISTA BASE: vista_base_estudiante_gestion_paralelo
-- Paralelo representativo por (estudiante, gestión): una fila por estudiante+gestión.
--
-- Reutiliza:
-- - 03 vista_base_inscripciones_estudiantes  (estudiante_id, gestion_id, inscripcion_id)
-- - 100 vista_base_matricula_inscripcion_paralelo (inscripcion_id → paralelo único)
--
-- Regla de desempate (análoga a 38 "carrera reciente"): inscripción más reciente
-- por estudiante+gestión = MAX(inscripcion_id). Evita duplicar filas cuando un
-- estudiante tiene más de una inscripción en la misma gestión.
--
-- Consumidor: vista_beca_asignada_listado (136) → listado de becas asignadas.
--
-- Dependencias (ejecutar antes):
-- - 03-vista-base-inscripciones-estudiantes.sql
-- - 100-vista-base-matricula-inscripcion-paralelo.sql
-- ============================================
USE instituto_incos;

DROP VIEW IF EXISTS vista_base_estudiante_gestion_paralelo;

CREATE VIEW vista_base_estudiante_gestion_paralelo AS
SELECT
  vie.estudiante_id,
  vie.gestion_id,
  p.paralelo_id,
  p.paralelo_nombre,
  p.paralelo_turno,
  p.paralelo_descripcion
FROM vista_base_inscripciones_estudiantes vie
INNER JOIN vista_base_matricula_inscripcion_paralelo p
  ON p.inscripcion_id = vie.inscripcion_id
INNER JOIN (
  SELECT
    vie2.estudiante_id,
    vie2.gestion_id,
    MAX(vie2.inscripcion_id) AS max_inscripcion_id
  FROM vista_base_inscripciones_estudiantes vie2
  GROUP BY vie2.estudiante_id, vie2.gestion_id
) ultimo
  ON ultimo.estudiante_id = vie.estudiante_id
  AND ultimo.gestion_id = vie.gestion_id
  AND ultimo.max_inscripcion_id = vie.inscripcion_id;
