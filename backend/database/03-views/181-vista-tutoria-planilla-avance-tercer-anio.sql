-- ============================================
-- VISTA: vista_tutoria_planilla_avance_tercer_anio
-- Roster de 3er año por bimestre para la planilla de seguimiento de tutoría
-- "10 en 10" (módulo TIT · titulación, Requisito 3).
--
-- Grano: una fila por (estudiante de 3er año CON proyecto, bimestre de su
-- gestión). Vista final delgada ROSTER-driven: parte de la base 178
-- (estudiantes de 3er año, filtrada aquí a proyecto_grado_id IS NOT NULL) y
-- hace INNER JOIN contra los bimestres de la propia gestión del estudiante
-- (periodos_academicos, division = 'BIMESTRE') para no perder estudiantes sin
-- tutorías registradas en el bimestre consultado — el LEFT JOIN de abajo
-- contra la 180 agregada por (proyecto, bimestre) resuelve a 0/NULL en ese
-- caso, no descarta la fila.
--
-- resultado_tutoria (CASE, mismo estilo que la 101): ABANDONO si el
-- integrante quedó RETIRADO del grupo o el proyecto se CANCELÓ; APROBADO /
-- REPROBADO si el proyecto cerró en ese estado; EN_PROCESO en cualquier otro
-- caso (proyecto vigente).
--
-- Bases:
--   - 178 vista_base_tutoria_estudiante_tercer_anio (roster + proyecto)
--   - 180 vista_base_tutoria_bitacora_bimestre_fila (bitácora × bimestre)
--   - periodos_academicos (bimestres de la gestión del estudiante)
--
-- Consumidor:
--   - TutoriaAvanceViewRepository (backend) →
--     GET /proyectos-grado/reportes/planilla-avance-tercer-anio y
--     GET /proyectos-grado/reportes/planilla-avance-tercer-anio/export.
--
-- Uso:
--   SELECT * FROM vista_tutoria_planilla_avance_tercer_anio
--   WHERE carrera_id = ? AND gestion_id = ? AND bimestre = ?
--   ORDER BY apellido_paterno, apellido_materno, nombres;
-- ============================================

USE instituto_incos;

DROP VIEW IF EXISTS vista_tutoria_planilla_avance_tercer_anio;

CREATE VIEW vista_tutoria_planilla_avance_tercer_anio AS
SELECT
  base.estudiante_id                AS estudiante_id,
  base.ci                            AS ci,
  base.expedicion                    AS expedicion,
  base.nombres                       AS nombres,
  base.apellido_paterno              AS apellido_paterno,
  base.apellido_materno              AS apellido_materno,
  base.estudiante_nombre_completo    AS estudiante_nombre_completo,
  base.carrera_id                    AS carrera_id,
  base.carrera_codigo                AS carrera_codigo,
  base.carrera_nombre                AS carrera_nombre,
  base.gestion_id                    AS gestion_id,
  base.proyecto_grado_id             AS proyecto_grado_id,
  base.proyecto_estado               AS proyecto_estado,
  base.tutor_nombre                  AS tutor_nombre,
  pa.numero_orden                    AS bimestre,
  COALESCE(bim.total_tutorias, 0)    AS total_tutorias_bimestre,
  bim.porcentaje_avance              AS porcentaje_avance,
  bim.ultima_observacion             AS ultima_observacion,
  CASE
    WHEN base.integrante_estado = 'RETIRADO' OR base.proyecto_estado = 'CANCELADO' THEN 'ABANDONO'
    WHEN base.proyecto_estado = 'APROBADO' THEN 'APROBADO'
    WHEN base.proyecto_estado = 'REPROBADO' THEN 'REPROBADO'
    ELSE 'EN_PROCESO'
  END AS resultado_tutoria
FROM vista_base_tutoria_estudiante_tercer_anio base
INNER JOIN periodos_academicos pa
  ON pa.gestion_id = base.gestion_id
  AND pa.division = 'BIMESTRE'
  AND pa.deleted_at IS NULL
LEFT JOIN (
  SELECT
    bb.proyecto_grado_id AS proyecto_grado_id,
    bb.bimestre           AS bimestre,
    COUNT(*)               AS total_tutorias,
    SUBSTRING_INDEX(GROUP_CONCAT(bb.porcentaje_avance ORDER BY bb.fecha DESC, bb.bitacora_id DESC), ',', 1) AS porcentaje_avance,
    (
      SELECT bb2.observaciones
      FROM vista_base_tutoria_bitacora_bimestre_fila bb2
      WHERE bb2.proyecto_grado_id = bb.proyecto_grado_id
        AND bb2.bimestre = bb.bimestre
      ORDER BY bb2.fecha DESC, bb2.bitacora_id DESC
      LIMIT 1
    ) AS ultima_observacion
  FROM vista_base_tutoria_bitacora_bimestre_fila bb
  GROUP BY bb.proyecto_grado_id, bb.bimestre
) bim ON bim.proyecto_grado_id = base.proyecto_grado_id AND bim.bimestre = pa.numero_orden
WHERE base.proyecto_grado_id IS NOT NULL;
